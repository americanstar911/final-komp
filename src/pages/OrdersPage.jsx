import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/notificationSlice';
import ConfirmModal from '../components/ConfirmModal';

export default function OrdersPage({ ordersApi }) {
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

        const ordersFetchUrl =
            currentLoggedInUser.role === 'admin'
                ? ordersApi
                : `${ordersApi}?user_id=${currentLoggedInUser.id}`;

        fetch(ordersFetchUrl)
            .then((fetchResponse) => fetchResponse.json())
            .then((ordersListFromApi) => {
                setAllOrders(ordersListFromApi);
                setIsLoadingOrders(false);
            })
            .catch(() => {
                setIsLoadingOrders(false);
                dispatchReduxAction(
                    addNotification({ message: 'Failed to load orders.', type: 'error' })
                );
            });
    }, [currentLoggedInUser, navigateToRoute, ordersApi, dispatchReduxAction]);

    const handleRequestDeleteOrder = (orderId) => {
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

    const handleRequestCancelOrder = (orderId) => {
        setOrderPendingCancelId(orderId);
    };

    const handleConfirmCancelOrder = async () => {
        try {
            const patchResponse = await fetch(`${ordersApi}/${orderPendingCancelId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'cancelled' }),
            });

            const updatedOrderRecord = await patchResponse.json();

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

    const handleCancelCancelOrder = () => {
        setOrderPendingCancelId(null);
    };

    const handleRequestChangeOrderAddress = (orderId, currentAddressValue) => {
        setOrderPendingAddressEditId(orderId);
        setAddressEditInputValue(currentAddressValue || '');
    };

    const handleAddressEditInputChange = (inputChangeEvent) => {
        setAddressEditInputValue(inputChangeEvent.target.value);
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
            const patchResponse = await fetch(
                `${ordersApi}/${orderPendingAddressEditId}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address: trimmedNewAddress }),
                }
            );

            const updatedOrderRecord = await patchResponse.json();

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

    const handleCancelChangeOrderAddress = () => {
        setOrderPendingAddressEditId(null);
        setAddressEditInputValue('');
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

                            className={`order-card ${thisOrderIsCancelled ? 'order-card-cancelled' : ''}`}
                        >

                            <div className="order-header">
                                <h3 className="order-number">Order #{oneOrder.id}</h3>
                                <span
                                    className={`order-status order-status-${oneOrder.status}`}
                                >
                                    {oneOrder.status}
                                </span>
                            </div>
                            <div className="order-items">
                                {oneOrder.items?.map((oneOrderItem, rowIndex) => (
                                    <div key={rowIndex} className="order-item-row">
                                        {oneOrderItem.name} x {oneOrderItem.qty} - ${oneOrderItem.price}
                                    </div>
                                ))}
                            </div>
                            <div className="order-address-row">
                                {addressEditFormOpenForThisOrder ? (
                                    <div className="order-address-edit">
                                        <label className="order-address-label">
                                            New delivery address
                                        </label>
                                        <input
                                            type="text"
                                            value={addressEditInputValue}
                                            onChange={handleAddressEditInputChange}
                                            className="order-address-input"
                                            placeholder="Street, building, apartment, city"
                                        />
                                        <div className="order-address-edit-actions">
                                            <button
                                                onClick={handleConfirmSaveNewAddress}
                                                className="primary-action-btn"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancelChangeOrderAddress}
                                                className="secondary-action-btn"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <span className="order-address-label">
                                            Delivery address:
                                        </span>
                                        <span className="order-address-value">
                                            {oneOrder.address || '— not provided —'}
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="order-footer">
                                <strong className="order-total">
                                    Total: ${Number(oneOrder.total).toFixed(2)}
                                </strong>
                                <div className="order-action-group">
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
                                            onClick={() =>
                                                handleRequestCancelOrder(oneOrder.id)
                                            }
                                            className="cancel-order-btn"
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                    {currentUserCanDeleteOrders && !thisOrderIsCancelled && (
                                        <button
                                            onClick={() =>
                                                handleRequestDeleteOrder(oneOrder.id)
                                            }
                                            className="delete-text-btn"
                                        >
                                            Delete
                                        </button>
                                    )}
                                    {currentUserCanDeleteOrders && thisOrderIsCancelled && (
                                        <span className="order-locked-label">
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
                onCancel={handleCancelDeleteOrder}
            />
            <ConfirmModal
                isOpen={orderPendingCancelId !== null}
                message="Are you sure you want to cancel this order? This action cannot be undone."
                onConfirm={handleConfirmCancelOrder}
                onCancel={handleCancelCancelOrder}
            />
        </div>
    );
}
