import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import cartSliceReducer from './cartSlice';
import notificationSliceReducer from './notificationSlice';

const reduxStore = configureStore({
    reducer: {
        cart: cartSliceReducer,

        notifications: notificationSliceReducer,
    },
});

export const useAppDispatch = () => useDispatch();

export const useAppSelector = useSelector;

export default reduxStore;
