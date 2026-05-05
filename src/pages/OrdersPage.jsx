import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/notificationSlice';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api/api';

export default function OrdersPage() {
    const [allOrders, setAllOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [orderPendingDeleteId, setOrderPendingDeleteId] = useState(null);
    const [orderPendingCancelId, setOrderPendingCancelId] = useState(null);
    const [orderPendingAddressEditId, setOrderPendingAddressEditId] = useState(null);
    const [addressEditInputValue, setAddressEditInputValue] = useState('');

    const { user: currentLoggedInUser } = useAuth();
    const navigateToRoute = useNavigate();
    const dispatchReduxAction = useAppDispatch();

    useEffect(() => {
        if (!currentLoggedInUser) {
            navigateToRoute('/login');
            return;
        }

        async function loadOrders() {
            setIsLoadingOrders(true);

            try {
                const response = await api.get(
                    currentLoggedInUser.role === 'admin' ? '/admin/orders' : '/orders/my'
                );
                setAllOrders(response.data);
            } catch (networkError) {
                dispatchReduxAction(
                    addNotification({ message: 'Failed to load orders.', type: 'error' })
                );
            }

            setIsLoadingOrders(false);
        }

        loadOrders();
    }, [currentLoggedInUser, navigateToRoute, dispatchReduxAction]);

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

    const handleConfirmCancelOrder = async () => {
        try {
            const response = await api.patch(`/orders/${orderPendingCancelId}/cancel`);
            const updatedOrderRecord = response.data;

            setAllOrders((previousOrdersList) =>
                previousOrdersList.map((oneOrder) =>
                    oneOrder.id === orderPendingCancelId ? updatedOrderRecord : oneOrder
                )
            );

            dispatchReduxAction(
                addNotification({ message: 'Order cancelled.', type: 'info' })
            );
        } catch (networkError) {
            dispatchReduxAction(
                addNotification({ message: 'Failed to cancel order.', type: 'error' })
            );
        }

        setOrderPendingCancelId(null);
    };

    const handleRequestChangeOrderAddress = (orderId, currentAddressValue) => {
        setOrderPendingAddressEditId(orderId);
        setAddressEditInputValue(currentAddressValue || '');
    };

    const handleConfirmSaveNewAddress = async () => {
        const trimmedNewAddress = addressEditInputValue.trim();
        if (trimmedNewAddress.length === 0) {
            dispatchReduxAction(
                addNotification({
                    message: 'Delivery address cannot be empty.',
                    type: 'error',
                })
            );
            return;
        }

        try {
            const response = await api.patch(`/orders/${orderPendingAddressEditId}/address`, {
                address: trimmedNewAddress,
            });

            const updatedOrderRecord = response.data;

            setAllOrders((previousOrdersList) =>
                previousOrdersList.map((oneOrder) =>
                    oneOrder.id === orderPendingAddressEditId
                        ? updatedOrderRecord
                        : oneOrder
                )
            );

            dispatchReduxAction(
                addNotification({
                    message: 'Delivery address updated.',
                    type: 'success',
                })
            );

            setOrderPendingAddressEditId(null);
            setAddressEditInputValue('');
        } catch (networkError) {
            dispatchReduxAction(
                addNotification({ message: 'Failed to update address.', type: 'error' })
            );
        }
    };

    const currentUserCanDeleteOrders = currentLoggedInUser?.role === 'admin';
    const currentUserIsRegularCustomer = currentLoggedInUser?.role !== 'admin';

    return (
        <div className="orders-page">
            <h2 className="orders-title">
                {currentLoggedInUser?.role === 'admin' ? 'All Orders' : 'My Orders'}
            </h2>
            {!isLoadingOrders && allOrders.length === 0 && (
                <div className="orders-empty">
                    <p className="orders-empty-text">No orders yet.</p>
                    <button
                        onClick={() => navigateToRoute('/products')}
                        className="primary-action-btn"
                    >
                        Go Shopping
                    </button>
                </div>
            )}
            <div className="orders-list">
                {allOrders.map((oneOrder) => {
                    const thisOrderIsCancelled = oneOrder.status === 'cancelled';
                    const addressEditFormOpenForThisOrder =
                        orderPendingAddressEditId === oneOrder.id;

                    return (
                        <div
                            key={oneOrder.id}
                            className={`Entities.Order-card ${thisOrderIsCancelled ? 'Entities.Order-card-cancelled' : ''}`}
                        >
                            <div className="Entities.Order-header">
                                <h3 className="Entities.Order-number">Order #{oneOrder.id}</h3>
                                <span
                                    className={`Entities.Order-status Entities.Order-status-${oneOrder.status}`}
                                >
                                    {oneOrder.status}
                                </span>
                            </div>
                            <div className="Entities.Order-items">
                                {oneOrder.items?.map((oneOrderItem) => (
                                    <div key={oneOrderItem.id} className="Entities.Order-item-row">
                                        {oneOrderItem.name} x {oneOrderItem.quantity} - ${oneOrderItem.price}
                                    </div>
                                ))}
                            </div>
                            <div className="Entities.Order-address-row">
                                {addressEditFormOpenForThisOrder ? (
                                    <div className="Entities.Order-address-edit">
                                        <label className="Entities.Order-address-label">
                                            New delivery address
                                        </label>
                                        <input
                                            type="text"
                                            value={addressEditInputValue}
                                            onChange={(event) => setAddressEditInputValue(event.target.value)}
                                            className="Entities.Order-address-input"
                                            placeholder="Street, building, apartment, city"
                                        />
                                        <div className="Entities.Order-address-edit-actions">
                                            <button
                                                onClick={handleConfirmSaveNewAddress}
                                                className="primary-action-btn"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setOrderPendingAddressEditId(null);
                                                    setAddressEditInputValue('');
                                                }}
                                                className="secondary-action-btn"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <span className="Entities.Order-address-label">
                                            Delivery address:
                                        </span>
                                        <span className="Entities.Order-address-value">
                                            {oneOrder.address || '— not provided —'}
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="Entities.Order-footer">
                                <strong className="Entities.Order-total">
                                    Total: ${Number(oneOrder.total).toFixed(2)}
                                </strong>
                                <div className="Entities.Order-action-group">
                                    {currentUserIsRegularCustomer &&
                                        !thisOrderIsCancelled &&
                                        !addressEditFormOpenForThisOrder && (
                                            <button
                                                onClick={() =>
                                                    handleRequestChangeOrderAddress(
                                                        oneOrder.id,
                                                        oneOrder.address
                                                    )
                                                }
                                                className="secondary-action-btn"
                                            >
                                                Change Address
                                            </button>
                                        )}
                                    {currentUserIsRegularCustomer && !thisOrderIsCancelled && (
                                        <button
                                            onClick={() => setOrderPendingCancelId(oneOrder.id)}
                                            className="cancel-Entities.Order-btn"
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                    {currentUserCanDeleteOrders && !thisOrderIsCancelled && (
                                        <button
                                            onClick={() => setOrderPendingDeleteId(oneOrder.id)}
                                            className="delete-text-btn"
                                        >
                                            Delete
                                        </button>
                                    )}
                                    {currentUserCanDeleteOrders && thisOrderIsCancelled && (
                                        <span className="Entities.Order-locked-label">
                                            Cancelled — locked
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <ConfirmModal
                isOpen={orderPendingDeleteId !== null}
                message="Are you sure you want to delete this order? This action cannot be undone."
                onConfirm={handleConfirmDeleteOrder}
                onCancel={() => setOrderPendingDeleteId(null)}
            />
            <ConfirmModal
                isOpen={orderPendingCancelId !== null}
                message="Are you sure you want to cancel this order? This action cannot be undone."
                onConfirm={handleConfirmCancelOrder}
                onCancel={() => setOrderPendingCancelId(null)}
            />
        </div>
    );
}
