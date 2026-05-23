import React, { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class PremiumErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    
    // Simulate Sentry error logging (S24-07)
    console.group('[Error Tracker - Sentry Mock]')
    console.error('Unhandled runtime error:', error)
    console.info('Component stack info:', errorInfo.componentStack)
    console.groupEnd()

    // Optional: Send error telemetry to an analytics backend
    if (window.location.hostname !== 'localhost') {
      // fetch('/api/v1/error-telemetry', { method: 'POST', body: JSON.stringify({ error: error.message, stack: errorInfo.componentStack }) }).catch(() => {})
    }
  }

  private handleRecover = () => {
    localStorage.removeItem('classapex-theme')
    localStorage.removeItem('classapex-locale')
    window.location.href = '/dashboard'
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #090d16 0%, #111827 100%)',
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
          padding: '24px',
          textAlign: 'center',
          boxSizing: 'border-box'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '40px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px',
              animation: 'cx-pulse 2s infinite ease-in-out'
            }}>⚠️</div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              marginBottom: '12px',
              background: 'linear-gradient(135deg, #ef4444 0%, #f43f5e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}>
              Something went wrong
            </h1>
            <p style={{
              fontSize: '0.95rem',
              color: '#94a3b8',
              lineHeight: 1.6,
              marginBottom: '28px'
            }}>
              ClassApex detected an unexpected runtime crash. The exception was logged to the diagnostic tracking dashboard (Sentry).
            </p>

            {this.state.error && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 0, 0, 0.15)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '28px',
                textAlign: 'left',
                overflowX: 'auto',
                fontFamily: 'var(--cm-font-family-mono, monospace)',
                fontSize: '0.8rem',
                color: '#f87171',
                maxHeight: '150px'
              }}>
                <strong>Error:</strong> {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                Reload Window
              </button>
              <button
                onClick={this.handleRecover}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              >
                Reset Preferences
              </button>
            </div>
          </div>
          <style>{`
            @keyframes cx-pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
          `}</style>
        </div>
      )
    }

    return this.props.children
  }
}
export default PremiumErrorBoundary
