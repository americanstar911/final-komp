import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/notificationSlice';
import ConfirmModal from '../components/ConfirmModal';


export default function ProductFormPage({ productsApi, categoriesApi }) {

    const { id: productIdFromUrlParam } = useParams();

    const navigateToRoute = useNavigate();

    const dispatchReduxAction = useAppDispatch();

    const [productNameInputValue, setProductNameInputValue] = useState('');
    const [productPriceInputValue, setProductPriceInputValue] = useState('');

    const [productCategoryIdInputValue, setProductCategoryIdInputValue] = useState('');
    const [productImageUrlInputValue, setProductImageUrlInputValue] = useState('');

    const [allCategories, setAllCategories] = useState([]);

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    useEffect(() => {
        
        if (!productIdFromUrlParam) return;

        fetch(`${productsApi}/${productIdFromUrlParam}`)
            .then((fetchResponse) => fetchResponse.json())
            .then((existingProductRecord) => {
               
                setProductNameInputValue(existingProductRecord.name);
                setProductPriceInputValue(existingProductRecord.price);

                setProductCategoryIdInputValue(String(existingProductRecord.category_id || ''));
                setProductImageUrlInputValue(existingProductRecord.image || '');
            });
    }, [productIdFromUrlParam, productsApi]);

    useEffect(() => {
        fetch(categoriesApi)
            .then((fetchResponse) => fetchResponse.json())
            .then((categoriesListFromApi) => {
                setAllCategories(categoriesListFromApi);

                if (!productIdFromUrlParam && categoriesListFromApi.length > 0) {
                    setProductCategoryIdInputValue(String(categoriesListFromApi[0].id));
                }
            });
    }, [categoriesApi, productIdFromUrlParam]);

   
    const handleProductNameInputChange = (inputChangeEvent) => {
        setProductNameInputValue(inputChangeEvent.target.value);
    };

    const handleProductPriceInputChange = (inputChangeEvent) => {
        setProductPriceInputValue(inputChangeEvent.target.value);
    };

    const handleProductCategoryDropdownChange = (selectChangeEvent) => {
        setProductCategoryIdInputValue(selectChangeEvent.target.value);
    };

    const handleProductImageUrlInputChange = (inputChangeEvent) => {
        setProductImageUrlInputValue(inputChangeEvent.target.value);
    };

    
    const handleProductFormSubmit = async (formSubmitEvent) => {
    
        formSubmitEvent.preventDefault();

        const productDataPayload = {
            name: productNameInputValue,
            price: Number(productPriceInputValue),
            category_id: Number(productCategoryIdInputValue),
            image: productImageUrlInputValue,
        };

        const httpMethodToUse = productIdFromUrlParam ? 'PUT' : 'POST';
        const fullRequestUrl = productIdFromUrlParam
            ? `${productsApi}/${productIdFromUrlParam}` 
            : productsApi;                              

        try {
        
            await fetch(fullRequestUrl, {
                method: httpMethodToUse,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productDataPayload),
            });

            if (productIdFromUrlParam) {
                dispatchReduxAction(
                    addNotification({
                        message: `Product '${productNameInputValue}' updated.`,
                        type: 'success',
                    })
                );
            } else {
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

    const handleCancelButtonClick = () => {
        setIsCancelModalOpen(true);
    };

    const handleConfirmCancel = () => {
        setIsCancelModalOpen(false);
        navigateToRoute('/admin');
    };

    const handleDismissCancelModal = () => {
        setIsCancelModalOpen(false);
    };


    return (
        <div className="form-page">
            {/* Заголовок меняется в зависимости от режима */}
            <h2>{productIdFromUrlParam ? 'Edit Entities.User.Product' : 'Add New Entities.User.Product'}</h2>

            <form onSubmit={handleProductFormSubmit}>
                {/* Поле Entities.User.Product Name */}
                <div className="form-group">
                    <label>Product Name</label>
                    <input
                        type="text"
                        value={productNameInputValue}
                        onChange={handleProductNameInputChange}
                        required
                    />
                </div>

                {/* Поле Price — type="number" фильтрует ввод только цифр */}
                <div className="form-group">
                    <label>Price ($)</label>
                    <input
                        type="number"
                        value={productPriceInputValue}
                        onChange={handleProductPriceInputChange}
                        required
                    />
                </div>

                {/* <select> категории — опции строятся ДИНАМИЧЕСКИ из allCategories */}
                <div className="form-group">
                    <label>Category</label>
                    <select
                        value={productCategoryIdInputValue}
                        onChange={handleProductCategoryDropdownChange}
                        required
                    >
                        {/* Одна <option> на каждую категорию из БД */}
                        {allCategories.map((oneCategory) => (
                            <option key={oneCategory.id} value={oneCategory.id}>
                                {oneCategory.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Поле Image URL — не обязательное, у товара может не быть картинки */}
                <div className="form-group">
                    <label>Image URL</label>
                    <input
                        type="text"
                        value={productImageUrlInputValue}
                        onChange={handleProductImageUrlInputChange}
                    />
                </div>

                {/* Кнопки — Save (submit) и Cancel (обычная кнопка, type="button") */}
                <div className="form-actions">
                    <button type="submit" className="btn-add">
                        {productIdFromUrlParam ? 'Save Changes' : 'Create Entities.User.Product'}
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

            {/* Модалка подтверждения отмены */}
            <ConfirmModal
                isOpen={isCancelModalOpen}
                message="Are you sure you want to cancel? Any unsaved changes will be lost."
                onConfirm={handleConfirmCancel}
                onCancel={handleDismissCancelModal}
            />
        </div>
    );
}
