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

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery, useCanvasMutation } from '../../hooks/useCanvasQuery'

export default function PrivacySettingsPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const resolvedAccountId = accountId || '1'
  const [showIframe, setShowIframe] = useState(false)

  const { data: account, isLoading, refetch } = useCanvasQuery<any>(
    `/api/v1/accounts/${resolvedAccountId}`
  )

  const { mutate: updateAccount, isLoading: saving } = useCanvasMutation<any, any>(
    `/api/v1/accounts/${resolvedAccountId}`,
    'PUT'
  )

  const [name, setName] = useState('')
  const [timeZone, setTimeZone] = useState('')
  const [storageQuota, setStorageQuota] = useState<number | ''>('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (account) {
      setName(account.name || '')
      setTimeZone(account.default_time_zone || '')
      setStorageQuota(account.default_storage_quota_mb ?? '')
    }
  }, [account])

  const termsUrl = account?.terms_of_service_url || ''
  const privacyUrl = account?.privacy_policy_url || ''

  const handleSave = async () => {
    setSaveSuccess(false)
    setSaveError('')

    const payload: any = {}
    if (name !== (account?.name || '')) payload.name = name
    if (timeZone !== (account?.default_time_zone || '')) payload.default_time_zone = timeZone
    if (storageQuota !== (account?.default_storage_quota_mb ?? '')) {
      payload.default_storage_quota_mb = Number(storageQuota)
    }

    if (Object.keys(payload).length === 0) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      return
    }

    const result = await updateAccount(payload)
    if (result) {
      setSaveSuccess(true)
      refetch()
      setTimeout(() => setSaveSuccess(false), 3000)
    } else {
      setSaveError('Failed to save account settings. Please try again.')
      setTimeout(() => setSaveError(''), 5000)
    }
  }

  const inpStyle: React.CSSProperties = {
    border: '1px solid var(--cx-border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '8px 12px',
    width: '100%',
    background: 'var(--cx-bg-surface)',
    color: 'var(--cx-text-primary)',
    fontFamily: 'inherit',
    fontSize: 'var(--cx-text-sm)',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'var(--cx-text-primary)',
    display: 'block',
    marginBottom: 4,
  }

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
          {[1, 2, 3].map(i => (
            <div key={i} className="cx-skeleton" style={{ height: 72, borderRadius: 10 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Editable Account Settings */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 10,
              background: 'var(--cx-bg-surface-elevated)',
              border: '1px solid var(--cx-border-subtle)',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cx-text-primary)', marginBottom: 12 }}>
              Account Settings
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Account Name</label>
                <input
                  type="text"
                  style={inpStyle}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div>
                <label style={labelStyle}>Default Time Zone</label>
                <input
                  type="text"
                  style={inpStyle}
                  value={timeZone}
                  onChange={e => setTimeZone(e.target.value)}
                  placeholder="America/New_York"
                  disabled={saving}
                />
              </div>
              <div>
                <label style={labelStyle}>Default Storage Quota (MB)</label>
                <input
                  type="number"
                  style={inpStyle}
                  min={0}
                  value={storageQuota}
                  onChange={e => setStorageQuota(e.target.value === '' ? '' : Number(e.target.value))}
                  disabled={saving}
                />
              </div>

              {saveSuccess && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--cx-color-success)' }}>
                  Account settings saved successfully.
                </div>
              )}
              {saveError && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--cx-color-danger)' }}>
                  {saveError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>

          {/* Read-only Legal URLs */}
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
