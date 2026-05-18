import React, { memo, useState } from 'react'
import { CanvasApiError } from '@schoolapex/core'
import clsx from 'clsx'

export type APIErrorType = 
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'rate_limit'
  | 'server'
  | 'validation'
  | 'not_found'
  | 'timeout'
  | 'unknown'

interface APIErrorHandlerProps {
  error: Error | CanvasApiError | null
  onRetry?: () => void
  onLogin?: () => void
  onDismiss?: () => void
  showDetails?: boolean
  className?: string
  'data-testid'?: string
}

const WarningFilledIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor">
    <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-3H7V4h2v6z"/>
  </svg>
)

const ErrorFilledIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor">
    <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm3.5 9.5l-1.4 1.4L8 9.4l-2.1 2.1-1.4-1.4L6.6 8 4.5 5.9l1.4-1.4L8 6.6l2.1-2.1 1.4 1.4L9.4 8z"/>
  </svg>
)

const InformationFilledIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor">
    <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm1 10H7V7h2v4zm0-5H7V4h2v2z"/>
  </svg>
)

const RestartIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor">
    <path d="M13 8c0 2.8-2.2 5-5 5S3 10.8 3 8 5.2 3 8 3h1V1.5l3.5 2.5L9 6.5V5H8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3h1z"/>
  </svg>
)

const LoginIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor">
    <path d="M11 2H5v2h6v8H5v2h6c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
    <path d="M2 8l4 4V9h4V7H6V4z"/>
  </svg>
)

const TimeIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor">
    <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm3 8H7V4h1v4h3v1z"/>
  </svg>
)

const DebugIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor">
    <path d="M6 2C4.9 2 4 2.9 4 4v2c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H6zm0 2h4v2H6V4zM6 10c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2H6zm0 2h4v2H6v-2z"/>
  </svg>
)

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" width={16} height={16} fill="currentColor">
    <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm3.5 9.5l-1.4 1.4L8 9.4l-2.1 2.1-1.4-1.4L6.6 8 4.5 5.9l1.4-1.4L8 6.6l2.1-2.1 1.4 1.4L9.4 8z"/>
  </svg>
)

export const APIErrorHandler = memo<APIErrorHandlerProps>(
  ({
    error,
    onRetry,
    onLogin,
    onDismiss,
    showDetails = false,
    className,
    'data-testid': testId,
  }) => {
    const [detailsVisible, setDetailsVisible] = useState(showDetails)

    if (!error) return null

    const errorType = categorizeError(error)
    const errorConfig = getErrorConfig(errorType, error)

    return (
      <div
        className={clsx('api-error-handler', className)}
        data-testid={testId}
      >
        <div className={`cx-notification cx-notification--${errorConfig.severity}`}>
          <div className="cx-notification__icon">
            {errorConfig.severity === 'error' ? (
              <ErrorFilledIcon size={20} />
            ) : errorConfig.severity === 'warning' ? (
              <WarningFilledIcon size={20} />
            ) : (
              <InformationFilledIcon size={20} />
            )}
          </div>
          <div className="cx-notification__content">
            <div className="cx-notification__title">{errorConfig.title}</div>
            <div className="cx-notification__subtitle">{errorConfig.message}</div>
          </div>
          {onDismiss && (
            <button className="cx-notification__close" onClick={onDismiss} aria-label="Dismiss">
              <CloseIcon />
            </button>
          )}
        </div>

        <div className="api-error-handler__content">
          <div className="api-error-handler__actions">
            {errorConfig.actions.map((action, index) => (
              <button
                key={index}
                className={`cx-btn cx-btn--${action.kind}`}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}

            {process.env.NODE_ENV === 'development' && (
              <button
                className="cx-btn cx-btn--ghost"
                onClick={() => setDetailsVisible(!detailsVisible)}
              >
                <DebugIcon size={16} />
                <span>{detailsVisible ? 'Hide' : 'Show'} Details</span>
              </button>
            )}
          </div>

          {detailsVisible && process.env.NODE_ENV === 'development' && (
            <div className="api-error-handler__details">
              <h4>Error Details</h4>
              <div className="api-error-details">
                <div className="api-error-details__section">
                  <strong>Type:</strong> {errorType}
                </div>
                <div className="api-error-details__section">
                  <strong>Message:</strong> {error.message}
                </div>
                {error instanceof CanvasApiError && (
                  <>
                    <div className="api-error-details__section">
                      <strong>Status:</strong> {error.status}
                    </div>
                    {error.details && (
                      <div className="api-error-details__section">
                        <strong>Details:</strong>
                        <pre>{JSON.stringify(error.details, null, 2)}</pre>
                      </div>
                    )}
                  </>
                )}
                {error.stack && (
                  <div className="api-error-details__section">
                    <strong>Stack:</strong>
                    <pre>{error.stack}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {errorConfig.helpText && (
            <div className="api-error-handler__help">
              <h4>What can you do?</h4>
              <ul>
                {errorConfig.helpText.map((text, index) => (
                  <li key={index}>{text}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    )
  }
)

APIErrorHandler.displayName = 'APIErrorHandler'

function categorizeError(error: Error | CanvasApiError): APIErrorType {
  if (error instanceof CanvasApiError) {
    if (error.status === 401 || error.status === 403) {
      return error.status === 401 ? 'authentication' : 'authorization'
    }
    
    if (error.status === 429) {
      return 'rate_limit'
    }

    switch (error.status) {
      case 404:
        return 'not_found'
      case 422:
        return 'validation'
      case 408:
      case 504:
        return 'timeout'
      default:
        if (error.status && error.status >= 500) {
          return 'server'
        }
    }
  }

  if (error.message.includes('fetch') || error.message.includes('network')) {
    return 'network'
  }

  if (error.message.includes('timeout')) {
    return 'timeout'
  }

  return 'unknown'
}

function getErrorConfig(
  errorType: APIErrorType, 
  error: Error | CanvasApiError
): {
  severity: 'error' | 'warning' | 'info'
  title: string
  message: string
  actions: Array<{
    label: string
    kind: 'primary' | 'secondary' | 'tertiary' | 'ghost'
    icon?: React.ReactNode
    onClick?: () => void
    disabled?: boolean
  }>
  helpText?: string[]
} {
  const configs = {
    network: {
      severity: 'error' as const,
      title: 'Network Error',
      message: 'Unable to connect to Canvas. Please check your internet connection.',
      actions: [
        {
          label: 'Retry',
          kind: 'primary' as const,
          icon: <RestartIcon size={16} />,
          onClick: () => window.location.reload(),
        },
      ],
      helpText: [
        'Check your internet connection',
        'Verify Canvas is accessible',
        'Try refreshing the page',
        'Contact your network administrator if the problem persists',
      ],
    },
    authentication: {
      severity: 'warning' as const,
      title: 'Authentication Required',
      message: 'Your session has expired. Please log in again.',
      actions: [
        {
          label: 'Log In',
          kind: 'primary' as const,
          icon: <LoginIcon size={16} />,
          onClick: () => {
            localStorage.removeItem('schoolapex_canvas_token')
            window.location.href = '/auth/login'
          },
        },
      ],
      helpText: [
        'Your Canvas session has expired',
        'Click "Log In" to authenticate again',
        'Make sure you have access to the Canvas instance',
      ],
    },
    authorization: {
      severity: 'error' as const,
      title: 'Access Denied',
      message: 'You do not have permission to access this resource.',
      actions: [],
      helpText: [
        'Contact your instructor or administrator',
        'Verify you are enrolled in the course',
        'Check if the resource is published',
      ],
    },
    rate_limit: {
      severity: 'warning' as const,
      title: 'Rate Limit Exceeded',
      message: 'Too many requests. Please wait a moment before trying again.',
      actions: [
        {
          label: 'Wait and Retry',
          kind: 'secondary' as const,
          icon: <TimeIcon size={16} />,
          onClick: () => {
            setTimeout(() => window.location.reload(), 5000)
          },
        },
      ],
      helpText: [
        'Canvas has rate limiting to protect the service',
        'Wait a few moments before making more requests',
        'The system will automatically retry shortly',
      ],
    },
    server: {
      severity: 'error' as const,
      title: 'Server Error',
      message: 'Canvas is experiencing technical difficulties. Please try again later.',
      actions: [
        {
          label: 'Retry',
          kind: 'secondary' as const,
          icon: <RestartIcon size={16} />,
          onClick: () => window.location.reload(),
        },
      ],
      helpText: [
        'Canvas servers are experiencing issues',
        'Try again in a few minutes',
        'Contact Canvas support if the problem persists',
      ],
    },
    validation: {
      severity: 'warning' as const,
      title: 'Invalid Data',
      message: 'The submitted data is invalid. Please check your input and try again.',
      actions: [],
      helpText: [
        'Check that all required fields are filled',
        'Verify data formats are correct',
        'Review any validation messages',
      ],
    },
    not_found: {
      severity: 'info' as const,
      title: 'Not Found',
      message: 'The requested resource could not be found.',
      actions: [],
      helpText: [
        'The resource may have been moved or deleted',
        'Check the URL for typos',
        'Contact your instructor if you expected this to exist',
      ],
    },
    timeout: {
      severity: 'warning' as const,
      title: 'Request Timeout',
      message: 'The request took too long to complete. Please try again.',
      actions: [
        {
          label: 'Retry',
          kind: 'primary' as const,
          icon: <RestartIcon size={16} />,
          onClick: () => window.location.reload(),
        },
      ],
      helpText: [
        'The request timed out',
        'Check your internet connection speed',
        'Try again with a better connection',
      ],
    },
    unknown: {
      severity: 'error' as const,
      title: 'Unexpected Error',
      message: 'An unexpected error occurred. Please try again or contact support.',
      actions: [
        {
          label: 'Retry',
          kind: 'secondary' as const,
          icon: <RestartIcon size={16} />,
          onClick: () => window.location.reload(),
        },
      ],
      helpText: [
        'An unexpected error occurred',
        'Try refreshing the page',
        'Contact support if the problem persists',
        'Include the error details when reporting',
      ],
    },
  }

  return configs[errorType]
}

export function useAPIErrorHandler() {
  const [error, setError] = useState<Error | CanvasApiError | null>(null)

  const handleError = (err: Error | CanvasApiError) => {
    console.error('API Error:', err)
    setError(err)
  }

  const clearError = () => {
    setError(null)
  }

  const retry = (retryFn: () => void) => {
    clearError()
    retryFn()
  }

  return {
    error,
    handleError,
    clearError,
    retry,
  }
}
