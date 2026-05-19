import React, { memo, useEffect, useState } from 'react'
import { Button } from '@carbon/react'
import { 
  CheckmarkFilled, 
  ErrorFilled, 
  WarningFilled, 
  InformationFilled,
  Close 
} from '@carbon/icons-react'
import clsx from 'clsx'

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/**
 * Toast component props
 */
interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  actionText?: string
  onAction?: () => void
  onDismiss?: (id: string) => void
  className?: string
  'data-testid'?: string
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
export const Toast = memo<ToastProps>(
  ({
    id,
    type,
    title,
    message,
    duration = 5000,
    persistent = false,
    actionText,
    onAction,
    onDismiss,
    className,
    'data-testid': testId,
  }) => {
    const [isVisible, setIsVisible] = useState(true)
    const [isExiting, setIsExiting] = useState(false)

    useEffect(() => {
      if (!persistent && duration > 0) {
        const timer = setTimeout(() => {
          handleDismiss()
        }, duration)

        return () => clearTimeout(timer)
      }
      return undefined
    }, [duration, persistent])

    const handleDismiss = () => {
      setIsExiting(true)
      setTimeout(() => {
        setIsVisible(false)
        onDismiss?.(id)
      }, 300) // Animation duration
    }

    const getIcon = () => {
      switch (type) {
        case 'success':
          return <CheckmarkFilled size={20} />
        case 'error':
          return <ErrorFilled size={20} />
        case 'warning':
          return <WarningFilled size={20} />
        case 'info':
          return <InformationFilled size={20} />
        default:
          return <InformationFilled size={20} />
      }
    }

    const getAriaLabel = () => {
      const typeText = type.charAt(0).toUpperCase() + type.slice(1)
      return `${typeText} notification: ${title}${message ? `. ${message}` : ''}`
    }

    if (!isVisible) return null

    return (
      <div
        className={clsx(
          'toast',
          `toast--${type}`,
          {
            'toast--exiting': isExiting,
            'toast--persistent': persistent,
          },
          className
        )}
        data-testid={testId}
        role="alert"
        aria-label={getAriaLabel()}
        aria-live={type === 'error' ? 'assertive' : 'polite'}
      >
        <div className="toast__icon">
          {getIcon()}
        </div>

        <div className="toast__content">
          <div className="toast__title">
            {title}
          </div>
          
          {message && (
            <div className="toast__message">
              {message}
            </div>
          )}

          {actionText && onAction && (
            <div className="toast__action">
              <Button
                kind="ghost"
                size="sm"
                onClick={onAction}
                className="toast__action-button"
              >
                {actionText}
              </Button>
            </div>
          )}
        </div>

        <div className="toast__controls">
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Close}
            onClick={handleDismiss}
            aria-label="Dismiss notification"
            className="toast__close-button"
          />
        </div>

        {!persistent && duration > 0 && (
          <div 
            className="toast__progress"
            style={{
              animationDuration: `${duration}ms`,
              animationPlayState: isExiting ? 'paused' : 'running'
            }}
          />
        )}

        {/* Screen reader only content */}
        <div className="sr-only">
          {type.charAt(0).toUpperCase() + type.slice(1)} notification.
          {title}. {message && `${message}.`}
          {actionText && ` Action available: ${actionText}.`}
          {!persistent && ' This notification will auto-dismiss.'}
        </div>
      </div>
    )
  }
)

Toast.displayName = 'Toast'

/**
 * Toast Container component for managing multiple toasts
 */
interface ToastContainerProps {
  toasts: Array<Omit<ToastProps, 'onDismiss'>>
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  maxToasts?: number
  onDismiss?: (id: string) => void
  className?: string
}

export const ToastContainer = memo<ToastContainerProps>(
  ({
    toasts,
    position = 'top-right',
    maxToasts = 5,
    onDismiss,
    className,
  }) => {
    // Limit the number of visible toasts
    const visibleToasts = toasts.slice(0, maxToasts)

    if (visibleToasts.length === 0) return null

    return (
      <div
        className={clsx(
          'toast-container',
          `toast-container--${position}`,
          className
        )}
        aria-live="polite"
        aria-label="Notifications"
      >
        {visibleToasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={onDismiss}
          />
        ))}

        {/* Screen reader only content */}
        <div className="sr-only">
          Notification area. {visibleToasts.length} notifications currently displayed.
        </div>
      </div>
    )
  }
)

ToastContainer.displayName = 'ToastContainer'

/**
 * Hook for managing toast notifications
 */
export interface ToastHookReturn {
  toasts: Array<Omit<ToastProps, 'onDismiss'>>
  addToast: (toast: Omit<ToastProps, 'id' | 'onDismiss'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToasts = (): ToastHookReturn => {
  const [toasts, setToasts] = useState<Array<Omit<ToastProps, 'onDismiss'>>>([])

  const addToast = (toast: Omit<ToastProps, 'id' | 'onDismiss'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast = { ...toast, id }
    
    setToasts(prev => [newToast, ...prev])
    return id
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearToasts = () => {
    setToasts([])
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  }
}
