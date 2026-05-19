import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useEffect, useState } from 'react';
import { Button } from '@carbon/react';
import { CheckmarkFilled, ErrorFilled, WarningFilled, InformationFilled, Close } from '@carbon/icons-react';
import clsx from 'clsx';
/**
 * SchoolApex Toast component
 *
 * Displays temporary notification messages with different types and actions.
 * Supports auto-dismiss, persistent notifications, and custom actions.
 *
 * @example
 * ```tsx
 * <Toast
 *   id="success-1"
 *   type="success"
 *   title="Assignment submitted"
 *   message="Your assignment has been successfully submitted."
 *   onDismiss={handleDismiss}
 * />
 * ```
 */
export const Toast = memo(({ id, type, title, message, duration = 5000, persistent = false, actionText, onAction, onDismiss, className, 'data-testid': testId, }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    useEffect(() => {
        if (!persistent && duration > 0) {
            const timer = setTimeout(() => {
                handleDismiss();
            }, duration);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [duration, persistent]);
    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onDismiss?.(id);
        }, 300); // Animation duration
    };
    const getIcon = () => {
        switch (type) {
            case 'success':
                return _jsx(CheckmarkFilled, { size: 20 });
            case 'error':
                return _jsx(ErrorFilled, { size: 20 });
            case 'warning':
                return _jsx(WarningFilled, { size: 20 });
            case 'info':
                return _jsx(InformationFilled, { size: 20 });
            default:
                return _jsx(InformationFilled, { size: 20 });
        }
    };
    const getAriaLabel = () => {
        const typeText = type.charAt(0).toUpperCase() + type.slice(1);
        return `${typeText} notification: ${title}${message ? `. ${message}` : ''}`;
    };
    if (!isVisible)
        return null;
    return (_jsxs("div", { className: clsx('toast', `toast--${type}`, {
            'toast--exiting': isExiting,
            'toast--persistent': persistent,
        }, className), "data-testid": testId, role: "alert", "aria-label": getAriaLabel(), "aria-live": type === 'error' ? 'assertive' : 'polite', children: [_jsx("div", { className: "toast__icon", children: getIcon() }), _jsxs("div", { className: "toast__content", children: [_jsx("div", { className: "toast__title", children: title }), message && (_jsx("div", { className: "toast__message", children: message })), actionText && onAction && (_jsx("div", { className: "toast__action", children: _jsx(Button, { kind: "ghost", size: "sm", onClick: onAction, className: "toast__action-button", children: actionText }) }))] }), _jsx("div", { className: "toast__controls", children: _jsx(Button, { kind: "ghost", size: "sm", renderIcon: Close, onClick: handleDismiss, "aria-label": "Dismiss notification", className: "toast__close-button" }) }), !persistent && duration > 0 && (_jsx("div", { className: "toast__progress", style: {
                    animationDuration: `${duration}ms`,
                    animationPlayState: isExiting ? 'paused' : 'running'
                } })), _jsxs("div", { className: "sr-only", children: [type.charAt(0).toUpperCase() + type.slice(1), " notification.", title, ". ", message && `${message}.`, actionText && ` Action available: ${actionText}.`, !persistent && ' This notification will auto-dismiss.'] })] }));
});
Toast.displayName = 'Toast';
export const ToastContainer = memo(({ toasts, position = 'top-right', maxToasts = 5, onDismiss, className, }) => {
    // Limit the number of visible toasts
    const visibleToasts = toasts.slice(0, maxToasts);
    if (visibleToasts.length === 0)
        return null;
    return (_jsxs("div", { className: clsx('toast-container', `toast-container--${position}`, className), "aria-live": "polite", "aria-label": "Notifications", children: [visibleToasts.map((toast) => (_jsx(Toast, { ...toast, onDismiss: onDismiss }, toast.id))), _jsxs("div", { className: "sr-only", children: ["Notification area. ", visibleToasts.length, " notifications currently displayed."] })] }));
});
ToastContainer.displayName = 'ToastContainer';
export const useToasts = () => {
    const [toasts, setToasts] = useState([]);
    const addToast = (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newToast = { ...toast, id };
        setToasts(prev => [newToast, ...prev]);
        return id;
    };
    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };
    const clearToasts = () => {
        setToasts([]);
    };
    return {
        toasts,
        addToast,
        removeToast,
        clearToasts,
    };
};
//# sourceMappingURL=Toast.js.map