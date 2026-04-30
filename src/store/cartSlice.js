import { createSlice } from '@reduxjs/toolkit';

const initialCartState = {
    items: [],
};

const cartSlice = createSlice({
    name: 'cart',

    initialState: initialCartState,

    reducers: {
        addItem: (state, action) => {
            const incomingProduct = action.payload;

            const existingItemInCart = state.items.find(
                (oneItem) => oneItem.id === incomingProduct.id
            );

            if (existingItemInCart) {
                existingItemInCart.qty += 1;
            } else {
                state.items.push({
                    id: incomingProduct.id,
                    name: incomingProduct.name,
                    price: incomingProduct.price,
                    image: incomingProduct.image,
                    qty: 1,
                });
            }
        },

        removeItem: (state, action) => {
            const idToRemove = action.payload;
            state.items = state.items.filter((oneItem) => oneItem.id !== idToRemove);
        },

        updateItemQty: (state, action) => {
            const { id: idToUpdate, qty: newQuantity } = action.payload;

            if (newQuantity <= 0) {
                state.items = state.items.filter((oneItem) => oneItem.id !== idToUpdate);
                return;
            }

            const matchingItem = state.items.find((oneItem) => oneItem.id === idToUpdate);
            if (matchingItem) {
                matchingItem.qty = newQuantity;
            }
        },

        clearAllItems: (state) => {
            state.items = [];
        },

        setAllItems: (state, action) => {
            const replacementItemsList = Array.isArray(action.payload) ? action.payload : [];
            state.items = replacementItemsList;
        },
    },
});

export const { addItem, removeItem, updateItemQty, clearAllItems, setAllItems } =
    cartSlice.actions;

export const selectCartItems = (reduxState) => reduxState.cart.items;

export const selectCartTotal = (reduxState) =>
    reduxState.cart.items.reduce(
        (runningSum, oneItem) => runningSum + oneItem.price * oneItem.qty,
        0
    );

export const selectCartCount = (reduxState) =>
    reduxState.cart.items.reduce((runningSum, oneItem) => runningSum + oneItem.qty, 0);

export default cartSlice.reducer;
