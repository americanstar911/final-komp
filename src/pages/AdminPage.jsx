import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/notificationSlice';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminPage({ productsApi, usersApi, ordersApi, categoriesApi }) {
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
        fetch(productsApi)
            .then((r) => r.json())
            .then((list) => setAllProducts(list));

        fetch(categoriesApi)
            .then((r) => r.json())
            .then((list) => setAllCategories(list));

        fetch(usersApi)
            .then((r) => r.json())
            .then((list) => setAllUsers(list));

        fetch(ordersApi)
            .then((r) => r.json())
            .then((list) => setAllOrders(list));
    }, [productsApi, usersApi, ordersApi, categoriesApi]);

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
        return matchingUserRow ? matchingUserRow.full_name : `user #${userIdToResolve}`;
    };

    const handleRequestDeleteProduct = (productId) => {
        setProductPendingDeleteId(productId);
    };

    const handleConfirmDeleteProduct = async () => {
        try {
            await fetch(`${productsApi}/${productPendingDeleteId}`, { method: 'DELETE' });

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

    const handleCancelDeleteProduct = () => {
        setProductPendingDeleteId(null);
    };

    const handleRequestDeleteCategory = (categoryId) => {
        setCategoryPendingDeleteId(categoryId);
    };

    const handleConfirmDeleteCategory = async () => {
        try {
            await fetch(`${categoriesApi}/${categoryPendingDeleteId}`, { method: 'DELETE' });

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

    const handleCancelDeleteCategory = () => {
        setCategoryPendingDeleteId(null);
    };

    const handleRequestDeleteUser = (userId) => {
        if (userId === currentLoggedInUser.id) return;
        setUserPendingDeleteId(userId);
    };

    const handleConfirmDeleteUser = async () => {
        try {
            await fetch(`${usersApi}/${userPendingDeleteId}`, { method: 'DELETE' });

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

    const handleCancelDeleteUser = () => {
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
            await fetch(`${ordersApi}/${orderPendingDeleteId}`, { method: 'DELETE' });

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

    const handleCancelDeleteOrder = () => {
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
                                ({resolveCategoryNameFromId(oneProduct.category_id)})
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
                                onClick={() => handleRequestDeleteProduct(oneProduct.id)}
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
                                onClick={() => handleRequestDeleteCategory(oneCategory.id)}
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
                            {oneUser.full_name}{' '}
                            <span className="admin-muted">
                                ({oneUser.email} - {oneUser.role})
                            </span>
                        </span>
                        {oneUser.id !== currentLoggedInUser.id && (
                            <button
                                onClick={() => handleRequestDeleteUser(oneUser.id)}
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
                                className={`admin-order-card ${
                                    thisOrderIsCancelled ? 'admin-order-card-cancelled' : ''
                                }`}
                            >

                                <div className="admin-order-header">
                                    <strong className="admin-order-number">
                                        Order #{oneOrder.id}
                                    </strong>
                                    <span className="admin-order-buyer">
                                        by {resolveUserNameFromId(oneOrder.user_id)}
                                    </span>
                                    <span
                                        className={`admin-order-status admin-order-status-${oneOrder.status}`}
                                    >
                                        {oneOrder.status}
                                    </span>
                                </div>
                                <div className="admin-order-items">
                                    {oneOrder.items?.map((oneOrderItem, rowIndex) => (
                                        <div key={rowIndex} className="admin-order-item-row">
                                            {oneOrderItem.name} × {oneOrderItem.qty} —{' '}
                                            ${oneOrderItem.price}
                                        </div>
                                    ))}
                                </div>
                                <div className="admin-order-address">
                                    <span className="admin-muted">Address:</span>{' '}
                                    {oneOrder.address || '— not provided —'}
                                </div>
                                <div className="admin-order-footer">
                                    <strong className="admin-order-total">
                                        Total: ${Number(oneOrder.total).toFixed(2)}
                                    </strong>
                                    {thisOrderIsCancelled ? (
                                        <span className="order-locked-label">
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
                onCancel={handleCancelDeleteProduct}
            />
            <ConfirmModal
                isOpen={categoryPendingDeleteId !== null}
                message="Are you sure you want to delete this category? This action cannot be undone."
                onConfirm={handleConfirmDeleteCategory}
                onCancel={handleCancelDeleteCategory}
            />
            <ConfirmModal
                isOpen={userPendingDeleteId !== null}
                message="Are you sure you want to delete this user? This action cannot be undone."
                onConfirm={handleConfirmDeleteUser}
                onCancel={handleCancelDeleteUser}
            />
            <ConfirmModal
                isOpen={orderPendingDeleteId !== null}
                message="Are you sure you want to delete this order? This action cannot be undone."
                onConfirm={handleConfirmDeleteOrder}
                onCancel={handleCancelDeleteOrder}
            />
        </div>
    );
}
