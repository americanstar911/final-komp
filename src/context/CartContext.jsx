import { createContext, useContext } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
    addItem,
    removeItem,
    updateItemQty,
    clearAllItems,
    selectCartItems,
    selectCartTotal,
} from '../store/cartSlice';

const CartContext = createContext();

export function CartProvider({ children }) {
    const dispatchReduxAction = useAppDispatch();

    const allCartItems = useAppSelector(selectCartItems);

    const currentCartMoneyTotal = useAppSelector(selectCartTotal);

    const addProductToCart = (productToAdd) => {
        dispatchReduxAction(addItem(productToAdd));
    };

    const removeProductFromCart = (productId) => {
        dispatchReduxAction(removeItem(productId));
    };

    const updateCartItemQuantity = (productId, newQty) => {
        dispatchReduxAction(updateItemQty({ id: productId, qty: newQty }));
    };

    const clearEntireCart = () => {
        dispatchReduxAction(clearAllItems());
    };

    return (
        <CartContext.Provider
            value={{
                cart: allCartItems,
                addToCart: addProductToCart,
                removeFromCart: removeProductFromCart,
                updateQty: updateCartItemQuantity,
                clearCart: clearEntireCart,
                total: currentCartMoneyTotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
