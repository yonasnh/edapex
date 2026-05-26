/**
 * AuthProviders — ClassApex LMS Admin
 * ====================================
 * Canvas REST API integration:
 *   GET  /api/v1/accounts/:accountId/authentication_providers
 *   DELETE /api/v1/accounts/:accountId/authentication_providers/:id
 *
 * Lists and manages authentication providers (SAML, OAuth, LDAP, etc.).
 * Creation and detailed editing are handled via iframe to Canvas native
 * authentication settings for security and completeness.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery'
import { useNotification } from '../../hooks/useNotification'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthProvider {
  id: number
  auth_type: string
  position: number
  [key: string]: any
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getProviderIcon(type: string) {
  const t = type.toLowerCase()
  if (t.includes('saml')) return '🛡️'
  if (t.includes('google')) return '🔍'
  if (t.includes('microsoft')) return '🔷'
  if (t.includes('ldap')) return '📁'
  if (t.includes('cas')) return '🔑'
  if (t.includes('facebook')) return '📘'
  if (t.includes('github')) return '🐙'
  if (t.includes('apple')) return '🍎'
  if (t.includes('openid')) return '🔓'
  if (t.includes('clever')) return '🎓'
  if (t === 'canvas') return '📋'
  return '🔐'
}

function getProviderLabel(type: string): string {
  const labels: Record<string, string> = {
    canvas: 'Canvas',
    saml: 'SAML 2.0',
    google: 'Google OAuth',
    microsoft: 'Microsoft OAuth',
    ldap: 'LDAP',
    cas: 'CAS',
    facebook: 'Facebook',
    github: 'GitHub',
    apple: 'Apple',
    openid_connect: 'OpenID Connect',
    clever: 'Clever',
  }
  return labels[type.toLowerCase()] || type
}

// ─── Canvas Native Settings Iframe ────────────────────────────────────────────

function AuthSettingsIframe({ accountId, onClose }: { accountId: string; onClose: () => void }) {
  const src = `/accounts/${accountId}/authentication_providers`

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', flexDirection: 'column', background: 'var(--cx-bg-surface, #fff)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'var(--cx-bg-surface)', borderBottom: '1px solid var(--cx-border-subtle)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Authentication Providers</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', background: 'var(--cx-bg-surface-sunken)', padding: '2px 8px', borderRadius: 4 }}>Canvas Native</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href={src} target="_blank" rel="noopener noreferrer" className="cx-btn cx-btn--ghost cx-btn--sm" style={{ textDecoration: 'none' }}>
            Open in Canvas
          </a>
          <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <iframe
          src={src}
          title="Canvas Authentication Settings"
          style={{ width: '100%', height: '100%', border: 'none', background: 'var(--cx-bg-surface)' }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  )
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AuthProvidersPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const resolvedAccountId = accountId || '1'
  const { showToast, showConfirm } = useNotification()

  const [showIframe, setShowIframe] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const {
    data: providers,
    isLoading,
    refetch,
  } = useCanvasQuery<AuthProvider[]>(
    `/api/v1/accounts/${resolvedAccountId}/authentication_providers`
  )

  const sorted = React.useMemo(() => {
    if (!Array.isArray(providers)) return []
    return [...providers].sort((a, b) => a.position - b.position)
  }, [providers])

  const handleDelete = async (provider: AuthProvider) => {
    const confirmed = await showConfirm({
      title: 'Delete Authentication Provider',
      message: `Are you sure you want to remove ${getProviderLabel(provider.auth_type)}? This may prevent users from logging in.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger',
    })
    if (!confirmed) return

    setDeletingId(provider.id)
    try {
      await canvasFetch(`/api/v1/accounts/${resolvedAccountId}/authentication_providers/${provider.id}`, {
        method: 'DELETE',
      })
      showToast({ title: 'Deleted', message: `${getProviderLabel(provider.auth_type)} has been removed.`, type: 'success' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Delete Failed', message: err?.message || 'Please try again.', type: 'error' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="cx-page">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)', flex: 1 }}>Authentication Providers</h2>
        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowIframe(true)}>
          + Add Provider
        </button>
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)', marginBottom: 16 }}>
        Manage how users sign in to Canvas. SAML, OAuth, LDAP, and other protocols are supported.
      </p>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="cx-skeleton" style={{ height: 72, borderRadius: 10 }} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>
          <div style={{ marginBottom: 12 }}>
            <svg width="48" height="48" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="10" r="8" />
              <path d="M7 10h6M10 7v6" />
            </svg>
          </div>
          <p>No authentication providers configured.</p>
          <button className="cx-btn cx-btn--primary" onClick={() => setShowIframe(true)} style={{ marginTop: 16 }}>
            Configure Authentication
          </button>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map(provider => (
            <li
              key={provider.id}
              data-testid={`provider-${provider.id}`}
              style={{
                padding: '14px 18px',
                borderRadius: 10,
                background: 'var(--cx-bg-surface-elevated)',
                border: '1px solid var(--cx-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{getProviderIcon(provider.auth_type)}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cx-text-primary)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {getProviderLabel(provider.auth_type)}
                  {provider.auth_type === 'canvas' && (
                    <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 10, background: 'rgba(16,185,129,0.12)', color: '#059669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Default</span>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)' }}>
                  Position {provider.position}
                  {provider.id && ` · ID ${provider.id}`}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button
                  className="cx-btn cx-btn--ghost cx-btn--sm"
                  onClick={() => setShowIframe(true)}
                >
                  Edit
                </button>
                {provider.auth_type !== 'canvas' && (
                  <button
                    className="cx-btn cx-btn--ghost cx-btn--sm"
                    onClick={() => handleDelete(provider)}
                    disabled={deletingId === provider.id}
                    data-testid={`delete-provider-${provider.id}`}
                  >
                    {deletingId === provider.id ? '…' : 'Delete'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)', marginTop: 12, textAlign: 'right' }}>
        {sorted.length} provider{sorted.length !== 1 ? 's' : ''}
      </p>

      {showIframe && (
        <AuthSettingsIframe
          accountId={resolvedAccountId}
          onClose={() => {
            setShowIframe(false)
            refetch()
          }}
        />
      )}
    </div>
  )
}
