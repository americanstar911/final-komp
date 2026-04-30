import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { removeNotification, selectNotifications } from '../store/notificationSlice';

const TOAST_AUTO_DISMISS_MS = 3500;

function SingleToastItem({ notification, onRequestCloseToast }) {
    useEffect(() => {
        const autoDismissTimerId = setTimeout(() => {
            onRequestCloseToast(notification.id);
        }, TOAST_AUTO_DISMISS_MS);

        return () => clearTimeout(autoDismissTimerId);
    }, [notification.id, onRequestCloseToast]);

    const handleCloseToastButtonClick = () => {
        onRequestCloseToast(notification.id);
    };

    const toastCssClassName = `toast toast-${notification.type || 'info'}`;

    return (
        <div className={toastCssClassName} role="status">
            <span className="toast-message">{notification.message}</span>
            <button
                type="button"
                onClick={handleCloseToastButtonClick}
                className="toast-close-btn"
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    );
}

export default function ToastContainer() {
    const allActiveNotifications = useAppSelector(selectNotifications);

    const dispatchReduxAction = useAppDispatch();

    const handleToastRequestClose = (notificationIdToClose) => {
        dispatchReduxAction(removeNotification(notificationIdToClose));
    };

    if (allActiveNotifications.length === 0) return null;

    return (
        <div className="toast-container">
            {allActiveNotifications.map((oneNotification) => (
                <SingleToastItem
                    key={oneNotification.id}
                    notification={oneNotification}
                    onRequestCloseToast={handleToastRequestClose}
                />
            ))}
        </div>
    );
}
