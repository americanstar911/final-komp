import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/notificationSlice';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api/api';

export default function ProductFormPage() {
    const { id: productIdFromUrlParam } = useParams();
    const navigateToRoute = useNavigate();
    const dispatchReduxAction = useAppDispatch();

    const [productNameInputValue, setProductNameInputValue] = useState('');
    const [productDescriptionInputValue, setProductDescriptionInputValue] = useState('');
    const [productPriceInputValue, setProductPriceInputValue] = useState('');
    const [productStockInputValue, setProductStockInputValue] = useState('');
    const [productCategoryIdInputValue, setProductCategoryIdInputValue] = useState('');
    const [productImageUrlInputValue, setProductImageUrlInputValue] = useState('');
    const [allCategories, setAllCategories] = useState([]);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    useEffect(() => {
        async function loadCategories() {
            const response = await api.get('/categories');
            setAllCategories(response.data);

            if (!productIdFromUrlParam && response.data.length > 0) {
                setProductCategoryIdInputValue(String(response.data[0].id));
            }
        }

        loadCategories();
    }, [productIdFromUrlParam]);

    useEffect(() => {
        if (!productIdFromUrlParam) return;

        async function loadProduct() {
            const response = await api.get(`/products/${productIdFromUrlParam}`);
            const existingProductRecord = response.data;

            setProductNameInputValue(existingProductRecord.name || '');
            setProductDescriptionInputValue(existingProductRecord.description || '');
            setProductPriceInputValue(String(existingProductRecord.price || ''));
            setProductStockInputValue(String(existingProductRecord.stock || ''));
            setProductCategoryIdInputValue(String(existingProductRecord.category?.id || ''));
            setProductImageUrlInputValue(existingProductRecord.image || '');
        }

        loadProduct();
    }, [productIdFromUrlParam]);

    const handleProductFormSubmit = async (formSubmitEvent) => {
        formSubmitEvent.preventDefault();

        const productDataPayload = {
            name: productNameInputValue,
            description: productDescriptionInputValue,
            price: Number(productPriceInputValue),
            stock: Number(productStockInputValue),
            categoryId: Number(productCategoryIdInputValue),
            image: productImageUrlInputValue,
        };

        try {
            if (productIdFromUrlParam) {
                await api.put(`/products/${productIdFromUrlParam}`, productDataPayload);
                dispatchReduxAction(
                    addNotification({
                        message: `Product '${productNameInputValue}' updated.`,
                        type: 'success',
                    })
                );
            } else {
                await api.post('/products', productDataPayload);
                dispatchReduxAction(
                    addNotification({
                        message: `Product '${productNameInputValue}' created successfully.`,
                        type: 'success',
                    })
                );
            }

            navigateToRoute('/admin');
        } catch (networkError) {
            dispatchReduxAction(
                addNotification({ message: 'Failed to save product.', type: 'error' })
            );
        }
    };

    return (
        <div className="form-page">
            <h2>{productIdFromUrlParam ? 'Edit Product' : 'Add New Product'}</h2>

            <form onSubmit={handleProductFormSubmit}>
                <div className="form-group">
                    <label>Product Name</label>
                    <input
                        type="text"
                        value={productNameInputValue}
                        onChange={(event) => setProductNameInputValue(event.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <input
                        type="text"
                        value={productDescriptionInputValue}
                        onChange={(event) => setProductDescriptionInputValue(event.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Price ($)</label>
                    <input
                        type="number"
                        value={productPriceInputValue}
                        onChange={(event) => setProductPriceInputValue(event.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Stock</label>
                    <input
                        type="number"
                        value={productStockInputValue}
                        onChange={(event) => setProductStockInputValue(event.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Category</label>
                    <select
                        value={productCategoryIdInputValue}
                        onChange={(event) => setProductCategoryIdInputValue(event.target.value)}
                        required
                    >
                        {allCategories.map((oneCategory) => (
                            <option key={oneCategory.id} value={oneCategory.id}>
                                {oneCategory.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Image URL</label>
                    <input
                        type="text"
                        value={productImageUrlInputValue}
                        onChange={(event) => setProductImageUrlInputValue(event.target.value)}
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-add">
                        {productIdFromUrlParam ? 'Save Changes' : 'Create Product'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsCancelModalOpen(true)}
                        className="btn-cancel"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            <ConfirmModal
                isOpen={isCancelModalOpen}
                message="Are you sure you want to cancel? Any unsaved changes will be lost."
                onConfirm={() => navigateToRoute('/admin')}
                onCancel={() => setIsCancelModalOpen(false)}
            />
        </div>
    );
}
