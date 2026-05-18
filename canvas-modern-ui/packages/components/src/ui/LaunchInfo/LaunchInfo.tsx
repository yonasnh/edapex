import React from 'react'
import { useLTI, useCanvasAPI, isInstructor, isStudent, isAdmin } from '@schoolapex/core'

export interface LaunchInfoProps {
  className?: string
}

const CheckmarkIcon = ({ size = 16, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" style={style}>
    <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm-1 10.3l-3.5-3.5 1.4-1.4 2.1 2.1 4.1-4.1 1.4 1.4-5.5 5.5z"/>
  </svg>
)

const ErrorIcon = ({ size = 16, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" style={style}>
    <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm3.5 9.5l-1.4 1.4L8 9.4l-2.1 2.1-1.4-1.4L6.6 8 4.5 5.9l1.4-1.4L8 6.6l2.1-2.1 1.4 1.4L9.4 8z"/>
  </svg>
)

const InformationIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor">
    <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm1 10H7V7h2v4zm0-5H7V4h2v2z"/>
  </svg>
)

const SpinnerIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" className="cx-spinner">
    <path d="M8 2v2c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4H2c0 3.3 2.7 6 6 6s6-2.7 6-6-2.7-6-6-6z"/>
  </svg>
)

export function LaunchInfo({ className }: LaunchInfoProps) {
  const lti = useLTI()
  const canvasApi = useCanvasAPI()

  if (lti.isLoading) {
    return (
      <div className={className}>
        <div className="cx-card">
          <div className="cx-inline-loading">
            <SpinnerIcon size={16} />
            <span>Loading LTI context...</span>
          </div>
        </div>
      </div>
    )
  }

  if (lti.error) {
    return (
      <div className={className}>
        <div className="cx-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ErrorIcon size={20} />
            <h3>LTI Context Error</h3>
          </div>
          <p style={{ marginBottom: '16px' }}>{lti.error}</p>
          <button className="cx-btn cx-btn--primary" onClick={lti.refreshBootstrap}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  const userRoles = lti.user?.roles || []
  const roleInfo = {
    isInstructor: isInstructor(userRoles),
    isStudent: isStudent(userRoles),
    isAdmin: isAdmin(userRoles)
  }

  return (
    <div className={className}>
      <div className="cx-grid">
        <div className="cx-col-lg-8 cx-col-md-6 cx-col-sm-4">
          <div className="cx-card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              {lti.isLTILaunch ? (
                <>
                  <CheckmarkIcon size={20} />
                  <h3>LTI Launch Active</h3>
                  <span className="cx-badge cx-badge--blue cx-badge--sm">LTI 1.3</span>
                </>
              ) : (
                <>
                  <InformationIcon size={20} />
                  <h3>Mock Mode</h3>
                  <span className="cx-badge cx-badge--gray cx-badge--sm">Demo</span>
                </>
              )}
            </div>
            
            <table className="cx-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Environment</td>
                  <td>
                    <span className={`cx-badge cx-badge--${lti.environment === 'production' ? 'red' : 'green'} cx-badge--sm`}>
                      {lti.environment}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Session ID</td>
                  <td>
                    <code>{lti.sessionId ? `${lti.sessionId.substring(0, 8)}...` : 'None'}</code>
                  </td>
                </tr>
                <tr>
                  <td>Locale</td>
                  <td>{lti.locale}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {lti.user && (
            <div className="cx-card" style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '16px' }}>User Information</h4>
              <table className="cx-table">
                <tbody>
                  <tr>
                    <td>User ID</td>
                    <td>
                      <code>{lti.user.id.substring(0, 12)}...</code>
                    </td>
                  </tr>
                  <tr>
                    <td>Name</td>
                    <td>{lti.user.name || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td>Email</td>
                    <td>{lti.user.email || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td>Role Summary</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {roleInfo.isInstructor && <span className="cx-badge cx-badge--blue cx-badge--sm">Instructor</span>}
                        {roleInfo.isStudent && <span className="cx-badge cx-badge--green cx-badge--sm">Student</span>}
                        {roleInfo.isAdmin && <span className="cx-badge cx-badge--red cx-badge--sm">Admin</span>}
                        {!roleInfo.isInstructor && !roleInfo.isStudent && !roleInfo.isAdmin && (
                          <span className="cx-badge cx-badge--gray cx-badge--sm">Other</span>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {lti.context && (
            <div className="cx-card" style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '16px' }}>Context Information</h4>
              <table className="cx-table">
                <tbody>
                  <tr>
                    <td>Context ID</td>
                    <td>
                      <code>{lti.context.id}</code>
                    </td>
                  </tr>
                  <tr>
                    <td>Title</td>
                    <td>{lti.context.title || 'Not provided'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="cx-col-lg-8 cx-col-md-6 cx-col-sm-4">
          <div className="cx-card" style={{ marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '16px' }}>Feature Flags</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(lti.featureFlags).map(([flag, enabled]) => (
                <div key={flag} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{flag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  <span className={`cx-badge cx-badge--${enabled ? 'green' : 'gray'} cx-badge--sm`}>
                    {enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {lti.user && (
            <div className="cx-card" style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '16px' }}>Raw Roles</h4>
              <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                {lti.user.roles.map((role, index) => (
                  <div key={index} style={{ marginBottom: '4px' }}>
                    <div className="cx-code-snippet">
                      <code>{role}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="cx-card">
            <h4 style={{ marginBottom: '16px' }}>Canvas API Integration</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              {canvasApi ? (
                <>
                  <CheckmarkIcon size={16} style={{ color: 'var(--cm-status-success-text)' }} />
                  <span>Canvas API Client Available</span>
                </>
              ) : (
                <>
                  <ErrorIcon size={16} style={{ color: 'var(--cm-status-danger-text)' }} />
                  <span>Canvas API Client Not Available</span>
                </>
              )}
            </div>

            {canvasApi && (
              <div style={{ marginTop: '12px' }}>
                <button
                  className="cx-btn cx-btn--tertiary"
                  onClick={async () => {
                    try {
                      const result = await canvasApi.testTokenExchange()
                      console.log('OBO Token Exchange Test:', result)
                      alert('OBO token exchange successful! Check console for details.')
                    } catch (error) {
                      console.error('OBO Token Exchange Failed:', error)
                      alert('OBO token exchange failed. Check console for details.')
                    }
                  }}
                >
                  Test Canvas API Connection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
