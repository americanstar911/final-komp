import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/notificationSlice';
import api from '../api/api';

export default function CategoryFormPage() {
    const { id: categoryIdFromUrlParam } = useParams();
    const navigateToRoute = useNavigate();
    const dispatchReduxAction = useAppDispatch();

    const [categoryNameInputValue, setCategoryNameInputValue] = useState('');
    const [categoryDescriptionInputValue, setCategoryDescriptionInputValue] = useState('');
    const [isSavingCategory, setIsSavingCategory] = useState(false);

    useEffect(() => {
        if (!categoryIdFromUrlParam) return;

        async function loadCategory() {
            const response = await api.get(`/categories/${categoryIdFromUrlParam}`);
            const existingCategoryRecord = response.data;
            setCategoryNameInputValue(existingCategoryRecord.name || '');
            setCategoryDescriptionInputValue(existingCategoryRecord.description || '');
        }

        loadCategory();
    }, [categoryIdFromUrlParam]);

    const handleCategoryFormSubmit = async (formSubmitEvent) => {
        formSubmitEvent.preventDefault();

        const categoryDataPayload = {
            name: categoryNameInputValue,
            description: categoryDescriptionInputValue,
        };

        setIsSavingCategory(true);

        try {
            if (categoryIdFromUrlParam) {
                await api.put(`/categories/${categoryIdFromUrlParam}`, categoryDataPayload);
                dispatchReduxAction(
                    addNotification({
                        message: `Category '${categoryNameInputValue}' updated.`,
                        type: 'success',
                    })
                );
            } else {
                await api.post('/categories', categoryDataPayload);
                dispatchReduxAction(
                    addNotification({
                        message: `Category '${categoryNameInputValue}' created.`,
                        type: 'success',
                    })
                );
            }

            navigateToRoute('/admin');
        } catch (networkError) {
            dispatchReduxAction(
                addNotification({ message: 'Failed to save category.', type: 'error' })
            );
        }

        setIsSavingCategory(false);
    };

    return (
        <div className="form-page">
            <h2>{categoryIdFromUrlParam ? 'Edit Category' : 'Add New Category'}</h2>
            <form onSubmit={handleCategoryFormSubmit}>
                <div className="form-group">
                    <label>Category Name</label>
                    <input
                        type="text"
                        value={categoryNameInputValue}
                        onChange={(event) => setCategoryNameInputValue(event.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <input
                        type="text"
                        value={categoryDescriptionInputValue}
                        onChange={(event) => setCategoryDescriptionInputValue(event.target.value)}
                    />
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-add" disabled={isSavingCategory}>
                        {isSavingCategory
                            ? 'Saving...'
                            : categoryIdFromUrlParam
                                ? 'Save Changes'
                                : 'Create Category'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigateToRoute('/admin')}
                        className="btn-cancel"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
