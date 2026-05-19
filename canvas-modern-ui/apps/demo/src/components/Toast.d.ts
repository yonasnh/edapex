import React from 'react';
/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';
/**
 * Toast component props
 */
interface ToastProps {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    persistent?: boolean;
    actionText?: string;
    onAction?: () => void;
    onDismiss?: (id: string) => void;
    className?: string;
    'data-testid'?: string;
}
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
export declare const Toast: React.NamedExoticComponent<ToastProps>;
/**
 * Toast Container component for managing multiple toasts
 */
interface ToastContainerProps {
    toasts: Array<Omit<ToastProps, 'onDismiss'>>;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    maxToasts?: number;
    onDismiss?: (id: string) => void;
    className?: string;
}
export declare const ToastContainer: React.NamedExoticComponent<ToastContainerProps>;
/**
 * Hook for managing toast notifications
 */
export interface ToastHookReturn {
    toasts: Array<Omit<ToastProps, 'onDismiss'>>;
    addToast: (toast: Omit<ToastProps, 'id' | 'onDismiss'>) => string;
    removeToast: (id: string) => void;
    clearToasts: () => void;
}
export declare const useToasts: () => ToastHookReturn;
export {};
//# sourceMappingURL=Toast.d.ts.map