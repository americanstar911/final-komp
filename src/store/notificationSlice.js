import { createSlice } from '@reduxjs/toolkit';

const initialNotificationState = {
    list: [],
};

function generateUniqueNotificationId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const notificationSlice = createSlice({
    name: 'notifications',

    initialState: initialNotificationState,

    reducers: {
        addNotification: (state, action) => {
            const { message: toastMessage, type: toastType } = action.payload;

            state.list.push({
                id: generateUniqueNotificationId(),
                message: toastMessage,
                type: toastType || 'info',
            });
        },

        removeNotification: (state, action) => {
            const notificationIdToRemove = action.payload;

            state.list = state.list.filter(
                (oneNotification) => oneNotification.id !== notificationIdToRemove
            );
        },
    },
});

export const { addNotification, removeNotification } = notificationSlice.actions;

export const selectNotifications = (reduxState) => reduxState.notifications.list;

export default notificationSlice.reducer;
