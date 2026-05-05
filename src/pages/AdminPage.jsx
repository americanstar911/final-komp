import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/notificationSlice';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api/api';

function getProductCategoryId(product) {
    return product.category?.id || product.categoryId || product.category_id;
}

export default function AdminPage() {
    const [allProducts, setAllProducts] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allOrders, setAllOrders] = useState([]);

    const [productPendingDeleteId, setProductPendingDeleteId] = useState(null);
    const [categoryPendingDeleteId, setCategoryPendingDeleteId] = useState(null);
    const [userPendingDeleteId, setUserPendingDeleteId] = useState(null);
    const [orderPendingDeleteId, setOrderPendingDeleteId] = useState(null);

    const { user: currentLoggedInUser } = useAuth();
    const dispatchReduxAction = useAppDispatch();

    useEffect(() => {
        async function loadAdminData() {
            try {
                const [productsResponse, categoriesResponse, usersResponse, ordersResponse] = await Promise.all([
                    api.get('/products'),
                    api.get('/categories'),
                    api.get('/api/users'),
                    api.get('/admin/orders'),
                ]);

                setAllProducts(productsResponse.data);
                setAllCategories(categoriesResponse.data);
                setAllUsers(usersResponse.data);
                setAllOrders(ordersResponse.data);
            } catch (networkError) {
                dispatchReduxAction(
                    addNotification({ message: 'Failed to load admin data.', type: 'error' })
                );
            }
        }

        loadAdminData();
    }, [dispatchReduxAction]);

    const resolveCategoryNameFromId = (categoryIdToResolve) => {
        const matchingCategoryRow = allCategories.find(
            (oneCategory) => oneCategory.id === categoryIdToResolve
        );
        return matchingCategoryRow ? matchingCategoryRow.name : '—';
    };

    const resolveUserNameFromId = (userIdToResolve) => {
        const matchingUserRow = allUsers.find(
            (oneUser) => oneUser.id === userIdToResolve
        );
        return matchingUserRow ? (matchingUserRow.fullName || matchingUserRow.full_name) : `user #${userIdToResolve}`;
    };

    const handleConfirmDeleteProduct = async () => {
        try {
            await api.delete(`/products/${productPendingDeleteId}`);

            setAllProducts((previousProductsList) =>
                previousProductsList.filter(
                    (oneProduct) => oneProduct.id !== productPendingDeleteId
                )
            );

            dispatchReduxAction(
                addNotification({ message: 'Product deleted.', type: 'info' })
            );
        } catch (networkError) {
            dispatchReduxAction(
                addNotification({ message: 'Failed to delete product.', type: 'error' })
            );
        }

        setProductPendingDeleteId(null);
    };

    const handleConfirmDeleteCategory = async () => {
        try {
            await api.delete(`/categories/${categoryPendingDeleteId}`);

            setAllCategories((previousCategoriesList) =>
                previousCategoriesList.filter(
                    (oneCategory) => oneCategory.id !== categoryPendingDeleteId
                )
            );

            dispatchReduxAction(
                addNotification({ message: 'Category deleted.', type: 'info' })
            );
        } catch (networkError) {
            dispatchReduxAction(
                addNotification({ message: 'Failed to delete category.', type: 'error' })
            );
        }

        setCategoryPendingDeleteId(null);
    };

    const handleConfirmDeleteUser = async () => {
        try {
            await api.delete(`/api/users/${userPendingDeleteId}`);

            setAllUsers((previousUsersList) =>
                previousUsersList.filter((oneUser) => oneUser.id !== userPendingDeleteId)
            );

            dispatchReduxAction(
                addNotification({ message: 'User removed.', type: 'info' })
            );
        } catch (networkError) {
            dispatchReduxAction(
                addNotification({ message: 'Failed to delete user.', type: 'error' })
            );
        }

        setUserPendingDeleteId(null);
    };

    const handleRequestDeleteOrder = (orderId, orderStatus) => {
        if (orderStatus === 'cancelled') {
            dispatchReduxAction(
                addNotification({
                    message: 'Cancelled orders are locked and cannot be modified.',
                    type: 'info',
                })
            );
            return;
        }
        setOrderPendingDeleteId(orderId);
    };

    const handleConfirmDeleteOrder = async () => {
        try {
            await api.delete(`/admin/orders/${orderPendingDeleteId}`);

            setAllOrders((previousOrdersList) =>
                previousOrdersList.filter(
                    (oneOrder) => oneOrder.id !== orderPendingDeleteId
                )
            );

            dispatchReduxAction(
                addNotification({ message: 'Order removed.', type: 'info' })
            );
        } catch (networkError) {
            dispatchReduxAction(
                addNotification({ message: 'Failed to delete order.', type: 'error' })
            );
        }

        setOrderPendingDeleteId(null);
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>Admin Panel</h1>
                <div className="admin-header-actions">
                    <Link to="/products/new" className="primary-link-btn">
                        + Add Product
                    </Link>
                    <Link to="/admin/categories/new" className="primary-link-btn">
                        + Add Category
                    </Link>
                </div>
            </div>
            <section className="admin-section">
                <h3 className="admin-section-title">Products ({allProducts.length})</h3>
                {allProducts.map((oneProduct) => (
                    <div key={oneProduct.id} className="admin-row">
                        <span className="admin-text">
                            {oneProduct.name} - ${oneProduct.price}{' '}
                            <span className="admin-muted">
                                ({resolveCategoryNameFromId(getProductCategoryId(oneProduct))})
                            </span>
                        </span>
                        <div className="admin-actions">
                            <Link
                                to={`/products/${oneProduct.id}/edit`}
                                className="admin-link"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => setProductPendingDeleteId(oneProduct.id)}
                                className="delete-text-btn"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </section>
            <section className="admin-section">
                <h3 className="admin-section-title">Categories ({allCategories.length})</h3>
                {allCategories.map((oneCategory) => (
                    <div key={oneCategory.id} className="admin-row">
                        <span className="admin-text">{oneCategory.name}</span>
                        <div className="admin-actions">
                            <Link
                                to={`/admin/categories/${oneCategory.id}/edit`}
                                className="admin-link"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => setCategoryPendingDeleteId(oneCategory.id)}
                                className="delete-text-btn"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </section>
            <section className="admin-section">
                <h3 className="admin-section-title">Users ({allUsers.length})</h3>
                {allUsers.map((oneUser) => (
                    <div key={oneUser.id} className="admin-row">
                        <span className="admin-text">
                            {oneUser.fullName || oneUser.full_name}{' '}
                            <span className="admin-muted">
                                ({oneUser.email} - {oneUser.role})
                            </span>
                        </span>
                        {oneUser.id !== currentLoggedInUser.id && (
                            <button
                                onClick={() => setUserPendingDeleteId(oneUser.id)}
                                className="delete-text-btn"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                ))}
            </section>
            <section className="admin-section">
                <h3 className="admin-section-title">Orders ({allOrders.length})</h3>
                {allOrders.length === 0 && (
                    <p className="admin-note">No orders have been placed yet.</p>
                )}
                <div className="admin-orders-list">
                    {allOrders.map((oneOrder) => {
                        const thisOrderIsCancelled = oneOrder.status === 'cancelled';

                        return (
                            <div
                                key={oneOrder.id}
                                className={`admin-Entities.Order-card ${
                                    thisOrderIsCancelled ? 'admin-Entities.Order-card-cancelled' : ''
                                }`}
                            >
                                <div className="admin-Entities.Order-header">
                                    <strong className="admin-Entities.Order-number">
                                        Order #{oneOrder.id}
                                    </strong>
                                    <span className="admin-Entities.Order-buyer">
                                        by {oneOrder.userFullName || resolveUserNameFromId(oneOrder.userId)}
                                    </span>
                                    <span
                                        className={`admin-Entities.Order-status admin-Entities.Order-status-${oneOrder.status}`}
                                    >
                                        {oneOrder.status}
                                    </span>
                                </div>
                                <div className="admin-Entities.Order-items">
                                    {oneOrder.items?.map((oneOrderItem) => (
                                        <div key={oneOrderItem.id} className="admin-Entities.Order-item-row">
                                            {oneOrderItem.name} × {oneOrderItem.quantity} —{' '}
                                            ${oneOrderItem.price}
                                        </div>
                                    ))}
                                </div>
                                <div className="admin-Entities.Order-address">
                                    <span className="admin-muted">Address:</span>{' '}
                                    {oneOrder.address || '— not provided —'}
                                </div>
                                <div className="admin-Entities.Order-footer">
                                    <strong className="admin-Entities.Order-total">
                                        Total: ${Number(oneOrder.total).toFixed(2)}
                                    </strong>
                                    {thisOrderIsCancelled ? (
                                        <span className="Entities.Order-locked-label">
                                            Cancelled — locked
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                handleRequestDeleteOrder(
                                                    oneOrder.id,
                                                    oneOrder.status
                                                )
                                            }
                                            className="delete-text-btn"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
            <ConfirmModal
                isOpen={productPendingDeleteId !== null}
                message="Are you sure you want to delete this product? This action cannot be undone."
                onConfirm={handleConfirmDeleteProduct}
                onCancel={() => setProductPendingDeleteId(null)}
            />
            <ConfirmModal
                isOpen={categoryPendingDeleteId !== null}
                message="Are you sure you want to delete this category? This action cannot be undone."
                onConfirm={handleConfirmDeleteCategory}
                onCancel={() => setCategoryPendingDeleteId(null)}
            />
            <ConfirmModal
                isOpen={userPendingDeleteId !== null}
                message="Are you sure you want to delete this user? This action cannot be undone."
                onConfirm={handleConfirmDeleteUser}
                onCancel={() => setUserPendingDeleteId(null)}
            />
            <ConfirmModal
                isOpen={orderPendingDeleteId !== null}
                message="Are you sure you want to delete this order? This action cannot be undone."
                onConfirm={handleConfirmDeleteOrder}
                onCancel={() => setOrderPendingDeleteId(null)}
            />
        </div>
    );
}
