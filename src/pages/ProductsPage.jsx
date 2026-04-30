import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/notificationSlice';

export default function ProductsPage({ productsApi, categoriesApi }) {
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
        fetch(productsApi)
            .then((fetchResponse) => fetchResponse.json())
            .then((productsListFromApi) => setAllProducts(productsListFromApi));
    }, [productsApi]);

    useEffect(() => {
        fetch(categoriesApi)
            .then((fetchResponse) => fetchResponse.json())
            .then((categoriesListFromApi) => setAllCategories(categoriesListFromApi));
    }, [categoriesApi]);

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
                      resolveCategoryNameFromId(oneProduct.category_id) === selectedCategoryName
              );

    const handleCategoryFilterButtonClick = (newCategoryName) => {
        setSelectedCategoryName(newCategoryName);
    };

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
                    onClick={() => handleCategoryFilterButtonClick('all')}
                    className={`filter-btn ${selectedCategoryName === 'all' ? 'active' : ''}`}
                >
                    All
                </button>
                {allCategories.map((oneCategory) => (
                    <button
                        key={oneCategory.id}
                        onClick={() => handleCategoryFilterButtonClick(oneCategory.name)}

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
                            {resolveCategoryNameFromId(oneProduct.category_id)}
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
