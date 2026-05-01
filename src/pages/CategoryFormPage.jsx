import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/notificationSlice';

export default function CategoryFormPage({ categoriesApi }) {
    const { id: categoryIdFromUrlParam } = useParams();

    const navigateToRoute = useNavigate();

    const dispatchReduxAction = useAppDispatch();

    const [categoryNameInputValue, setCategoryNameInputValue] = useState('');

    const [isSavingCategory, setIsSavingCategory] = useState(false);

    useEffect(() => {
        if (!categoryIdFromUrlParam) return;

        fetch(`${categoriesApi}/${categoryIdFromUrlParam}`)
            .then((fetchResponse) => fetchResponse.json())
            .then((existingCategoryRecord) => {
                setCategoryNameInputValue(existingCategoryRecord.name || '');
            });
    }, [categoryIdFromUrlParam, categoriesApi]);

    const handleCategoryNameInputChange = (inputChangeEvent) => {
        setCategoryNameInputValue(inputChangeEvent.target.value);
    };

    const handleCategoryFormSubmit = async (formSubmitEvent) => {
        formSubmitEvent.preventDefault();

        const categoryDataPayload = { name: categoryNameInputValue };

        const httpMethodToUse = categoryIdFromUrlParam ? 'PUT' : 'POST';
        const fullRequestUrl = categoryIdFromUrlParam
            ? `${categoriesApi}/${categoryIdFromUrlParam}`
            : categoriesApi;

        setIsSavingCategory(true);

        try {
            await fetch(fullRequestUrl, {
                method: httpMethodToUse,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryDataPayload),
            });

            if (categoryIdFromUrlParam) {
                dispatchReduxAction(
                    addNotification({
                        message: `Category '${categoryNameInputValue}' updated.`,
                        type: 'success',
                    })
                );
            } else {
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

    const handleCancelButtonClick = () => {
        navigateToRoute('/admin');
    };

    return (
        <div className="form-page">
            <h2>{categoryIdFromUrlParam ? 'Edit Entities.Category' : 'Add New Entities.Category'}</h2>
            <form onSubmit={handleCategoryFormSubmit}>
                <div className="form-group">
                    <label>Category Name</label>
                    <input
                        type="text"
                        value={categoryNameInputValue}
                        onChange={handleCategoryNameInputChange}
                        required
                    />
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-add" disabled={isSavingCategory}>
                        {isSavingCategory
                            ? 'Saving...'
                            : categoryIdFromUrlParam
                              ? 'Save Changes'
                              : 'Create Entities.Category'}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancelButtonClick}
                        className="btn-cancel"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
