import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/notificationSlice';
import api from '../api/api';

function getProductCategoryId(product) {
    return product.category?.id || product.categoryId || product.category_id;
}

export default function ProductsPage() {
    const [allProducts, setAllProducts] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [selectedCategoryName, setSelectedCategoryName] = useState('all');

    const { addToCart } = useCart();
    const { user: currentLoggedInUser } = useAuth();
    const dispatchReduxAction = useAppDispatch();
    const navigateToRoute = useNavigate();
    const currentLocationObject = useLocation();

    useEffect(() => {
        const queryParamsFromUrl = new URLSearchParams(currentLocationObject.search);
        const categoryFromUrl = queryParamsFromUrl.get('category');
        setSelectedCategoryName(categoryFromUrl || 'all');
    }, [currentLocationObject.search]);

    useEffect(() => {
        async function loadProductsAndCategories() {
            try {
                const [productsResponse, categoriesResponse] = await Promise.all([
                    api.get('/products'),
                    api.get('/categories'),
                ]);

                setAllProducts(productsResponse.data);
                setAllCategories(categoriesResponse.data);
            } catch (networkError) {
                dispatchReduxAction(
                    addNotification({ message: 'Failed to load products.', type: 'error' })
                );
            }
        }

        loadProductsAndCategories();
    }, [dispatchReduxAction]);

    const resolveCategoryNameFromId = (categoryIdToResolve) => {
        const matchingCategoryRow = allCategories.find(
            (oneCategory) => oneCategory.id === categoryIdToResolve
        );

        return matchingCategoryRow ? matchingCategoryRow.name : '';
    };

    const productsMatchingSelectedCategory =
        selectedCategoryName === 'all'
            ? allProducts
            : allProducts.filter(
                (oneProduct) =>
                    resolveCategoryNameFromId(getProductCategoryId(oneProduct)) === selectedCategoryName
            );

    const handleAddProductToCartButtonClick = (productBeingAdded) => {
        if (!currentLoggedInUser) {
            dispatchReduxAction(
                addNotification({
                    message: 'Please log in to add items to your cart.',
                    type: 'error',
                })
            );
            navigateToRoute('/login');
            return;
        }

        if (currentLoggedInUser.role === 'admin') {
            dispatchReduxAction(
                addNotification({
                    message: 'Admins cannot add items to a cart.',
                    type: 'info',
                })
            );
            return;
        }

        addToCart(productBeingAdded);

        dispatchReduxAction(
            addNotification({
                message: `'${productBeingAdded.name}' added to cart.`,
                type: 'success',
            })
        );
    };

    return (
        <div className="catalogue-page">
            <h2 className="catalogue-title">Catalogue</h2>
            <div className="catalogue-filters">
                <button
                    key="filter-all"
                    onClick={() => setSelectedCategoryName('all')}
                    className={`filter-btn ${selectedCategoryName === 'all' ? 'active' : ''}`}
                >
                    All
                </button>
                {allCategories.map((oneCategory) => (
                    <button
                        key={oneCategory.id}
                        onClick={() => setSelectedCategoryName(oneCategory.name)}
                        className={`filter-btn ${
                            selectedCategoryName === oneCategory.name ? 'active' : ''
                        }`}
                    >
                        {oneCategory.name}
                    </button>
                ))}
            </div>
            <div className="grid">
                {productsMatchingSelectedCategory.map((oneProduct) => (
                    <div key={oneProduct.id} className="product-card">
                        <div className="product-tile">
                            {oneProduct.image ? (
                                <img
                                    src={oneProduct.image}
                                    alt={oneProduct.name}
                                    className="product-img"
                                />
                            ) : (
                                <div className="product-placeholder">No image</div>
                            )}
                        </div>
                        <p className="product-name">{oneProduct.name}</p>
                        <p className="product-price">${oneProduct.price}</p>
                        <p className="product-category-label">
                            {resolveCategoryNameFromId(getProductCategoryId(oneProduct))}
                        </p>
                        <div className="product-actions">
                            <button
                                onClick={() => handleAddProductToCartButtonClick(oneProduct)}
                                className="product-add-btn"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {productsMatchingSelectedCategory.length === 0 && (
                <p className="empty-state-text">No products found.</p>
            )}
        </div>
    );
}
