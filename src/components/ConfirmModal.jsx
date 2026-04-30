export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
    if (!isOpen) return null;

    const handleConfirmButtonClick = () => {
        onConfirm();
    };

    const handleCancelButtonClick = () => {
        onCancel();
    };

    const handleBackdropOverlayClick = () => {
        onCancel();
    };

    const handleModalBoxClick = (clickEvent) => {
        clickEvent.stopPropagation();
    };

    return (
        <div
            className="confirm-modal-overlay"
            onClick={handleBackdropOverlayClick}
            role="dialog"
            aria-modal="true"
        >

            <div className="confirm-modal-box" onClick={handleModalBoxClick}>
                <p className="confirm-modal-message">{message}</p>
                <div className="confirm-modal-actions">
                    <button
                        type="button"
                        onClick={handleCancelButtonClick}
                        className="confirm-modal-cancel-btn"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirmButtonClick}
                        className="confirm-modal-confirm-btn"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
