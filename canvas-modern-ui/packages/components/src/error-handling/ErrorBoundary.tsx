import React, { Component, ErrorInfo, ReactNode } from 'react'
import clsx from 'clsx'

const WarningFilledIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2L2 28h28L16 2z" fill="currentColor" />
    <path d="M15 12h2v8h-2zm0 10h2v2h-2z" fill="var(--cm-bg-canvas, #FFFFFF)" />
  </svg>
)

const RestartIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 18A9 9 0 1 1 16 9" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M16 2v7l5-3.5L16 2z" fill="currentColor" />
  </svg>
)

const DebugIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 6h8v2h-8zm-2 4h12v2H10zm-2 4h16v2H8zm0 4h16v2H8zm2 4h12v2H10z" fill="currentColor" />
    <circle cx="16" cy="4" r="2" fill="currentColor" />
  </svg>
)

const ReportIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2h14l6 6v22H6V2z" fill="currentColor" />
    <path d="M8 4v24h16V9h-5V4H8z" fill="var(--cm-bg-canvas, #FFFFFF)" />
    <path d="M13 15h6v2h-6zm0-4h6v2h-6zm0 8h6v2h-6z" fill="currentColor" />
  </svg>
)

const ChevronDownIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 22L6 12l1.4-1.4L16 19.2l8.6-8.6L26 12l-10 10z" fill="currentColor" />
  </svg>
)

const ChevronUpIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 10l10 10-1.4 1.4L16 12.8 7.4 21.4 6 20l10-10z" fill="currentColor" />
  </svg>
)

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  showDetails: boolean
  errorId: string
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void
  enableReporting?: boolean
  showDetails?: boolean
  level?: 'page' | 'section' | 'component'
  className?: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorId: '',
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId,
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, enableReporting = true } = this.props
    const { errorId } = this.state

    this.setState({ errorInfo })

    if (onError) {
      onError(error, errorInfo, errorId)
    }

    if (enableReporting) {
      this.reportError(error, errorInfo, errorId)
    }

    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary Caught Error [${errorId}]`)
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo, errorId: string) => {
    try {
      const errorReport = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getCurrentUserId(),
        buildVersion: process.env.REACT_APP_VERSION || 'unknown',
      }

      console.log('Error reported:', errorReport)
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  private getCurrentUserId = (): string | null => {
    try {
      const token = localStorage.getItem('schoolapex_canvas_token')
      if (token) {
        const parsed = JSON.parse(token)
        return parsed.user?.id || null
      }
      return null
    } catch {
      return null
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        showDetails: false,
      })
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }))
  }

  private copyErrorDetails = async () => {
    const { error, errorInfo, errorId } = this.state
    
    const errorDetails = `
Error ID: ${errorId}
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `.trim()

    try {
      await navigator.clipboard.writeText(errorDetails)
      console.log('Error details copied to clipboard')
    } catch (err) {
      console.error('Failed to copy error details:', err)
    }
  }

  override render() {
    const { hasError, error, errorInfo, showDetails, errorId } = this.state
    const { 
      children, 
      fallback, 
      level = 'component',
      showDetails: showDetailsDefault = false,
      className 
    } = this.props

    if (hasError) {
      if (fallback) {
        return fallback
      }

      return (
        <div className={clsx('error-boundary', `error-boundary--${level}`, className)}>
          <div className="error-boundary__container">
            <div className="error-boundary__icon">
              <WarningFilledIcon size={level === 'page' ? 48 : 32} />
            </div>

            <div className="error-boundary__content">
              <h2 className="error-boundary__title">
                {level === 'page' ? 'Something went wrong' : 'Component Error'}
              </h2>
              
              <p className="error-boundary__message">
                {level === 'page' 
                  ? 'We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.'
                  : 'This component encountered an error and could not be displayed properly.'
                }
              </p>

              {process.env.NODE_ENV === 'development' && error && (
                <div className="error-boundary__dev-info">
                  <p className="error-boundary__error-message">
                    <strong>Error:</strong> {error.message}
                  </p>
                  <p className="error-boundary__error-id">
                    <strong>Error ID:</strong> {errorId}
                  </p>
                </div>
              )}

              <div className="error-boundary__actions">
                {this.retryCount < this.maxRetries && (
                  <button
                    className="cm-btn cm-btn--primary"
                    onClick={this.handleRetry}
                  >
                    <RestartIcon /> Try Again
                  </button>
                )}

                <button
                  className="cm-btn cm-btn--secondary"
                  onClick={this.handleReload}
                >
                  <RestartIcon /> Reload Page
                </button>

                {(showDetailsDefault || process.env.NODE_ENV === 'development') && (
                  <button
                    className="cm-btn cm-btn--ghost"
                    onClick={this.toggleDetails}
                  >
                    {showDetails ? <ChevronUpIcon /> : <ChevronDownIcon />} {showDetails ? 'Hide' : 'Show'} Details
                  </button>
                )}
              </div>

              {showDetails && (error || errorInfo) && (
                <div className="error-boundary__details">
                  <div className="error-boundary__details-header">
                    <h3>Error Details</h3>
                    <button
                      className="cm-btn cm-btn--ghost"
                      onClick={this.copyErrorDetails}
                    >
                      <DebugIcon /> Copy Details
                    </button>
                  </div>

                  {error && (
                    <div className="error-boundary__error-section">
                      <h4>Error Message</h4>
                      <pre className="error-boundary__code">
                        {error.message}
                      </pre>
                    </div>
                  )}

                  {error?.stack && (
                    <div className="error-boundary__error-section">
                      <h4>Stack Trace</h4>
                      <pre className="error-boundary__code">
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {errorInfo?.componentStack && (
                    <div className="error-boundary__error-section">
                      <h4>Component Stack</h4>
                      <pre className="error-boundary__code">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}

                  <div className="error-boundary__error-section">
                    <h4>Error ID</h4>
                    <code className="error-boundary__error-id-code">
                      {errorId}
                    </code>
                  </div>
                </div>
              )}

              {level === 'page' && (
                <div className="error-boundary__help">
                  <h3>What can you do?</h3>
                  <ul>
                    <li>Try refreshing the page</li>
                    <li>Check your internet connection</li>
                    <li>Clear your browser cache and cookies</li>
                    <li>Contact support with the error ID: <code>{errorId}</code></li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return children
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    throw error
  }
}
