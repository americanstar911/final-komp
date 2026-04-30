import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/notificationSlice';
import ConfirmModal from '../components/ConfirmModal';

export default function CartPage({ ordersApi }) {
    const navigateToRoute = useNavigate();

    const { user: currentLoggedInUser } = useAuth();

    const {
        cart: allCartLineItems,
        removeFromCart,
        updateQty,
        clearCart,
        total: currentCartMoneyTotal,
    } = useCart();

    const dispatchReduxAction = useAppDispatch();

    const [cartItemPendingDeleteId, setCartItemPendingDeleteId] = useState(null);

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const [deliveryAddressInputValue, setDeliveryAddressInputValue] = useState('');

    const handleIncreaseItemQuantity = (productId, currentQuantity) => {
        updateQty(productId, currentQuantity + 1);
    };

    const handleDecreaseItemQuantity = (productId, currentQuantity) => {
        updateQty(productId, currentQuantity - 1);
    };

    const handleRequestRemoveCartItem = (productId) => {
        setCartItemPendingDeleteId(productId);
    };

    const handleConfirmRemoveCartItem = () => {
        const cartItemBeingRemoved = allCartLineItems.find(
            (oneItem) => oneItem.id === cartItemPendingDeleteId
        );

        if (cartItemBeingRemoved) {
            dispatchReduxAction(
                addNotification({
                    message: `'${cartItemBeingRemoved.name}' removed from cart.`,
                    type: 'info',
                })
            );
        }

        removeFromCart(cartItemPendingDeleteId);

        setCartItemPendingDeleteId(null);
    };

    const handleCancelRemoveCartItem = () => {
        setCartItemPendingDeleteId(null);
    };

    const handleClearEntireCart = () => {
        clearCart();
        dispatchReduxAction(
            addNotification({ message: 'Cart cleared.', type: 'info' })
        );
    };

    const handleDeliveryAddressInputChange = (inputChangeEvent) => {
        setDeliveryAddressInputValue(inputChangeEvent.target.value);
    };

    const handlePlaceOrderButtonClick = async () => {
        if (!currentLoggedInUser) {
            navigateToRoute('/login');
            return;
        }

        const trimmedDeliveryAddress = deliveryAddressInputValue.trim();
        if (trimmedDeliveryAddress.length === 0) {
            dispatchReduxAction(
                addNotification({
                    message: 'Please enter a delivery address before placing the order.',
                    type: 'error',
                })
            );
            return;
        }

        setIsPlacingOrder(true);

        try {
            const newOrderPayload = {
                user_id: currentLoggedInUser.id,
                total: currentCartMoneyTotal,
                status: 'pending',
                address: trimmedDeliveryAddress,
                items: allCartLineItems.map((oneItem) => ({
                    id: oneItem.id,
                    name: oneItem.name,
                    price: oneItem.price,
                    qty: oneItem.qty,
                })),
            };

            await fetch(ordersApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrderPayload),
            });

            dispatchReduxAction(
                addNotification({ message: 'Order placed successfully!', type: 'success' })
            );

            clearCart();
            navigateToRoute('/orders');
        } catch (networkError) {
            dispatchReduxAction(
                addNotification({ message: 'Failed to place order.', type: 'error' })
            );
        }

        setIsPlacingOrder(false);
    };

    if (allCartLineItems.length === 0) {
        return (
            <div className="cart-empty">
                <h2>Your cart is empty</h2>
                <button
                    onClick={() => navigateToRoute('/products')}
                    className="primary-action-btn"
                >
                    Go to Shop
                </button>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <h2 className="cart-title">Your Cart ({allCartLineItems.length})</h2>
            <div>
                {allCartLineItems.map((oneCartItem) => (
                    <div key={oneCartItem.id} className="cart-item">
                        <span className="cart-item-name">{oneCartItem.name}</span>
                        <span className="cart-item-price">${oneCartItem.price}</span>
                        <div className="cart-qty-box">
                            <button
                                onClick={() =>
                                    handleDecreaseItemQuantity(oneCartItem.id, oneCartItem.qty)
                                }
                                className="cart-qty-btn"
                            >
                                -
                            </button>
                            <span className="cart-qty-display">{oneCartItem.qty}</span>
                            <button
                                onClick={() =>
                                    handleIncreaseItemQuantity(oneCartItem.id, oneCartItem.qty)
                                }
                                className="cart-qty-btn"
                            >
                                +
                            </button>
                        </div>
                        <button
                            onClick={() => handleRequestRemoveCartItem(oneCartItem.id)}
                            className="cart-remove-btn"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
            <div className="cart-address-section">
                <label className="cart-address-label" htmlFor="delivery-address-input">
                    Delivery Address
                </label>
                <input
                    id="delivery-address-input"
                    type="text"
                    value={deliveryAddressInputValue}
                    onChange={handleDeliveryAddressInputChange}
                    placeholder="Street, building, apartment, city"
                    className="cart-address-input"
                    required
                />
            </div>
            <div className="cart-summary">
                <h3>Total: ${currentCartMoneyTotal.toFixed(2)}</h3>
                <div className="cart-action-group">
                    <button onClick={handleClearEntireCart} className="secondary-action-btn">
                        Clear Cart
                    </button>
                    <button
                        onClick={handlePlaceOrderButtonClick}
                        className="primary-action-btn"
                        disabled={isPlacingOrder}
                    >
                        {isPlacingOrder ? 'Placing...' : 'Place Order'}
                    </button>
                </div>
            </div>
            <ConfirmModal
                isOpen={cartItemPendingDeleteId !== null}
                message="Remove this item from your cart?"
                onConfirm={handleConfirmRemoveCartItem}
                onCancel={handleCancelRemoveCartItem}
            />
        </div>
    );
}
