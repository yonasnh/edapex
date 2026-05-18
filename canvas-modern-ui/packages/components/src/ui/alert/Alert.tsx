import React, { useState, useEffect, useCallback, type ReactNode } from 'react'
import clsx from 'clsx'
import { InfoIcon, CheckIcon, WarningIcon, AlertTriangleIcon, CloseIcon } from '../icon/Icon'
import './Alert.css'

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

export interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  icon?: ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
  role?: string
}

const DEFAULT_ICONS: Record<AlertVariant, ReactNode> = {
  info: <InfoIcon size={16} />,
  success: <CheckIcon size={16} />,
  warning: <WarningIcon size={16} />,
  danger: <AlertTriangleIcon size={16} />,
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  dismissible = false,
  onDismiss,
  className,
  role = 'alert',
}) => {
  const [dismissed, setDismissed] = useState(false)

  const handleDismiss = useCallback(() => {
    setDismissed(true)
    onDismiss?.()
  }, [onDismiss])

  if (dismissed) return null

  return (
    <div
      className={clsx('cm-alert', `cm-alert--${variant}`, dismissible && 'cm-alert--dismissible', className)}
      role={role}
      aria-live="polite"
    >
      <span className="cm-alert__icon" aria-hidden="true">
        {icon ?? DEFAULT_ICONS[variant]}
      </span>
      <div className="cm-alert__body">
        {title && <div className="cm-alert__title">{title}</div>}
        <div className="cm-alert__message">{children}</div>
      </div>
      {dismissible && (
        <button
          className="cm-alert__close"
          onClick={handleDismiss}
          aria-label="Dismiss alert"
          type="button"
        >
          <CloseIcon size={16} />
        </button>
      )}
    </div>
  )
}

Alert.displayName = 'Alert'

export interface ToastProps extends AlertProps {
  duration?: number
  onClose?: () => void
}

export const Toast: React.FC<ToastProps> = ({
  duration = 4000,
  onClose,
  variant = 'info',
  children,
  title,
  className,
  ...props
}) => {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (duration <= 0) return
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onClose?.(), 200)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = useCallback(() => {
    setExiting(true)
    setTimeout(() => onClose?.(), 200)
  }, [onClose])

  return (
    <div
      className={clsx(
        'cm-toast',
        `cm-toast--${variant}`,
        exiting && 'cm-toast--exiting',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="cm-toast__content">
        {title && <div className="cm-toast__title">{title}</div>}
        <div className="cm-toast__message">{children}</div>
      </div>
      <button className="cm-toast__close" onClick={handleClose} aria-label="Dismiss" type="button">
        <CloseIcon size={16} />
      </button>
    </div>
  )
}

Toast.displayName = 'Toast'
