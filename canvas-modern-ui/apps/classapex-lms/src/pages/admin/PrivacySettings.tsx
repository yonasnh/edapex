/**
 * PrivacySettings — ClassApex LMS Admin
 * ======================================
 * Canvas native integration via iframe for account-level privacy,
 * terms of service, and data retention configuration.
 *
 * Canvas routes:
 *   /accounts/:accountId/settings#tab-tools
 *   /accounts/:accountId/terms
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery } from '../../hooks/useCanvasQuery'

interface LegalSetting {
  id: number
  name: string
  url: string
  type: 'terms_of_use' | 'privacy_policy'
}

export default function PrivacySettingsPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const resolvedAccountId = accountId || '1'
  const [showIframe, setShowIframe] = useState(false)

  const { data: account, isLoading } = useCanvasQuery<any>(
    `/api/v1/accounts/${resolvedAccountId}`
  )

  const termsUrl = account?.terms_of_service_url || ''
  const privacyUrl = account?.privacy_policy_url || ''

  return (
    <div className="cx-page">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)', flex: 1 }}>Privacy & Security</h2>
        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowIframe(true)}>
          Open Canvas Settings
        </button>
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)', marginBottom: 20 }}>
        Manage privacy policies, terms of service, and data retention settings for {account?.name || 'this account'}.
      </p>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2].map(i => (
            <div key={i} className="cx-skeleton" style={{ height: 72, borderRadius: 10 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 10,
              background: 'var(--cx-bg-surface-elevated)',
              border: '1px solid var(--cx-border-subtle)',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cx-text-primary)', marginBottom: 4 }}>
              Terms of Service
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)', marginBottom: 8 }}>
              {termsUrl ? 'Configured' : 'Not configured'}
            </div>
            {termsUrl && (
              <a href={termsUrl} target="_blank" rel="noopener noreferrer" className="cx-btn cx-btn--ghost cx-btn--sm" style={{ textDecoration: 'none' }}>
                View Terms
              </a>
            )}
          </div>

          <div
            style={{
              padding: '16px 20px',
              borderRadius: 10,
              background: 'var(--cx-bg-surface-elevated)',
              border: '1px solid var(--cx-border-subtle)',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cx-text-primary)', marginBottom: 4 }}>
              Privacy Policy
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)', marginBottom: 8 }}>
              {privacyUrl ? 'Configured' : 'Not configured'}
            </div>
            {privacyUrl && (
              <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="cx-btn cx-btn--ghost cx-btn--sm" style={{ textDecoration: 'none' }}>
                View Policy
              </a>
            )}
          </div>

          <div
            style={{
              padding: '16px 20px',
              borderRadius: 10,
              background: 'var(--cx-bg-surface-elevated)',
              border: '1px solid var(--cx-border-subtle)',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cx-text-primary)', marginBottom: 4 }}>
              Data Retention
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)' }}>
              Data retention and deletion policies are managed through Canvas native account settings.
              Use the "Open Canvas Settings" button to configure retention rules.
            </div>
          </div>
        </div>
      )}

      {showIframe && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', flexDirection: 'column', background: 'var(--cx-bg-surface, #fff)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'var(--cx-bg-surface)', borderBottom: '1px solid var(--cx-border-subtle)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Account Settings</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', background: 'var(--cx-bg-surface-sunken)', padding: '2px 8px', borderRadius: 4 }}>Canvas Native</span>
            </div>
            <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowIframe(false)}>
              Close
            </button>
          </div>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <iframe
              src={`/accounts/${resolvedAccountId}/settings`}
              title="Canvas Account Settings"
              style={{ width: '100%', height: '100%', border: 'none', background: 'var(--cx-bg-surface)' }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      )}
    </div>
  )
}
