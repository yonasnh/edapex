/**
 * AuthProviders — ClassApex LMS Admin
 * ====================================
 * Canvas REST API integration:
 *   GET  /api/v1/accounts/:accountId/authentication_providers
 *   POST /api/v1/accounts/:accountId/authentication_providers
 *   PUT  /api/v1/accounts/:accountId/authentication_providers/:id
 *   DELETE /api/v1/accounts/:accountId/authentication_providers/:id
 *
 * Lists and manages authentication providers (SAML, OAuth, LDAP, etc.).
 * Creation and editing are handled via native React forms; an iframe fallback
 * to Canvas native settings is available for advanced/native-only options.
 */

import React, { useState, useEffect } from 'react'
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

type AuthType = 'saml' | 'openid_connect' | 'google' | 'microsoft' | 'ldap'

interface SamlFormData {
  idp_entity_id: string
  log_in_url: string
  log_out_url: string
  certificate_fingerprint: string
  identifier_format: string
  requested_authn_context: string
}

interface OauthFormData {
  client_id: string
  client_secret: string
  authorize_url: string
  token_url: string
  scope: string
}

interface LdapFormData {
  auth_host: string
  auth_port: string
  auth_base: string
  auth_filter: string
  auth_username: string
  auth_password: string
  identifier_format: string
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

function isOauthType(type: string): boolean {
  return ['openid_connect', 'google', 'microsoft'].includes(type)
}

// ─── Form Helpers ─────────────────────────────────────────────────────────────

const AUTH_TYPE_OPTIONS: { value: AuthType; label: string }[] = [
  { value: 'saml', label: 'SAML 2.0' },
  { value: 'google', label: 'Google OAuth' },
  { value: 'microsoft', label: 'Microsoft OAuth' },
  { value: 'openid_connect', label: 'OpenID Connect' },
  { value: 'ldap', label: 'LDAP' },
]

const defaultIdentifierFormat = 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'

function getInitialFormState(type: AuthType): Record<string, string> {
  switch (type) {
    case 'saml':
      return {
        idp_entity_id: '',
        log_in_url: '',
        log_out_url: '',
        certificate_fingerprint: '',
        identifier_format: defaultIdentifierFormat,
        requested_authn_context: '',
      }
    case 'openid_connect':
      return {
        client_id: '',
        client_secret: '',
        authorize_url: '',
        token_url: '',
        scope: '',
      }
    case 'google':
    case 'microsoft':
      return {
        client_id: '',
        client_secret: '',
        scope: '',
      }
    case 'ldap':
      return {
        auth_host: '',
        auth_port: '389',
        auth_base: '',
        auth_filter: '',
        auth_username: '',
        auth_password: '',
        identifier_format: '',
      }
    default:
      return {}
  }
}

function providerToFormState(provider: AuthProvider): Record<string, string> {
  const type = provider.auth_type as AuthType
  const state = getInitialFormState(type)
  Object.keys(state).forEach((key) => {
    if (provider[key] !== undefined && provider[key] !== null) {
      state[key] = String(provider[key])
    }
  })
  return state
}

// ─── Form Input ───────────────────────────────────────────────────────────────

function FormField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string
  name: string
  value: string
  onChange: (val: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>
        {label}
        {required && <span style={{ color: 'var(--cx-color-danger, #ef4444)', marginLeft: 4 }}>*</span>}
      </label>
      <input
        type={type}
        className="cx-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        data-testid={`field-${name}`}
      />
    </div>
  )
}

// ─── Auth Provider Form Modal ─────────────────────────────────────────────────

function AuthProviderForm({
  accountId,
  provider,
  onClose,
  onSaved,
}: {
  accountId: string
  provider?: AuthProvider | null
  onClose: () => void
  onSaved: () => void
}) {
  const { showToast } = useNotification()
  const isEditing = !!provider
  const [authType, setAuthType] = useState<AuthType>(provider?.auth_type as AuthType || 'saml')
  const [fields, setFields] = useState<Record<string, string>>(() =>
    provider ? providerToFormState(provider) : getInitialFormState('saml')
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (provider) {
      setAuthType(provider.auth_type as AuthType)
      setFields(providerToFormState(provider))
    }
  }, [provider])

  const updateField = (name: string, value: string) => {
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  const handleAuthTypeChange = (type: AuthType) => {
    setAuthType(type)
    setFields(getInitialFormState(type))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const body: Record<string, any> = { auth_type: authType }

    Object.entries(fields).forEach(([key, value]) => {
      if (value !== '') {
        if (key === 'auth_port') {
          body[key] = Number(value)
        } else {
          body[key] = value
        }
      }
    })

    try {
      if (isEditing && provider) {
        await canvasFetch(`/api/v1/accounts/${accountId}/authentication_providers/${provider.id}`, {
          method: 'PUT',
          body: { authentication_provider: body },
        })
        showToast({ title: 'Updated', message: `${getProviderLabel(authType)} provider updated.`, type: 'success' })
      } else {
        await canvasFetch(`/api/v1/accounts/${accountId}/authentication_providers`, {
          method: 'POST',
          body: { authentication_provider: body },
        })
        showToast({ title: 'Created', message: `${getProviderLabel(authType)} provider added.`, type: 'success' })
      }
      onSaved()
    } catch (err: any) {
      showToast({ title: 'Save Failed', message: err?.message || 'Please try again.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const renderFields = () => {
    switch (authType) {
      case 'saml':
        return (
          <>
            <FormField label="IdP Entity ID" name="idp_entity_id" value={fields.idp_entity_id || ''} onChange={(v) => updateField('idp_entity_id', v)} required />
            <FormField label="Login URL" name="log_in_url" value={fields.log_in_url || ''} onChange={(v) => updateField('log_in_url', v)} required />
            <FormField label="Logout URL" name="log_out_url" value={fields.log_out_url || ''} onChange={(v) => updateField('log_out_url', v)} placeholder="Optional" />
            <FormField label="Certificate Fingerprint" name="certificate_fingerprint" value={fields.certificate_fingerprint || ''} onChange={(v) => updateField('certificate_fingerprint', v)} required />
            <FormField label="Identifier Format" name="identifier_format" value={fields.identifier_format || ''} onChange={(v) => updateField('identifier_format', v)} placeholder={defaultIdentifierFormat} />
            <FormField label="Requested Authn Context" name="requested_authn_context" value={fields.requested_authn_context || ''} onChange={(v) => updateField('requested_authn_context', v)} placeholder="Optional" />
          </>
        )
      case 'openid_connect':
        return (
          <>
            <FormField label="Client ID" name="client_id" value={fields.client_id || ''} onChange={(v) => updateField('client_id', v)} required />
            <FormField label="Client Secret" name="client_secret" value={fields.client_secret || ''} onChange={(v) => updateField('client_secret', v)} required />
            <FormField label="Authorize URL" name="authorize_url" value={fields.authorize_url || ''} onChange={(v) => updateField('authorize_url', v)} required />
            <FormField label="Token URL" name="token_url" value={fields.token_url || ''} onChange={(v) => updateField('token_url', v)} required />
            <FormField label="Scope" name="scope" value={fields.scope || ''} onChange={(v) => updateField('scope', v)} placeholder="Optional" />
          </>
        )
      case 'google':
      case 'microsoft':
        return (
          <>
            <FormField label="Client ID" name="client_id" value={fields.client_id || ''} onChange={(v) => updateField('client_id', v)} required />
            <FormField label="Client Secret" name="client_secret" value={fields.client_secret || ''} onChange={(v) => updateField('client_secret', v)} required />
            <FormField label="Scope" name="scope" value={fields.scope || ''} onChange={(v) => updateField('scope', v)} placeholder="Optional" />
          </>
        )
      case 'ldap':
        return (
          <>
            <FormField label="Host" name="auth_host" value={fields.auth_host || ''} onChange={(v) => updateField('auth_host', v)} required />
            <FormField label="Port" name="auth_port" value={fields.auth_port || ''} onChange={(v) => updateField('auth_port', v)} type="number" required />
            <FormField label="Base DN" name="auth_base" value={fields.auth_base || ''} onChange={(v) => updateField('auth_base', v)} required />
            <FormField label="Filter" name="auth_filter" value={fields.auth_filter || ''} onChange={(v) => updateField('auth_filter', v)} required />
            <FormField label="Username" name="auth_username" value={fields.auth_username || ''} onChange={(v) => updateField('auth_username', v)} placeholder="Optional" />
            <FormField label="Password" name="auth_password" value={fields.auth_password || ''} onChange={(v) => updateField('auth_password', v)} type="password" placeholder="Optional" />
            <FormField label="Identifier Format" name="identifier_format" value={fields.identifier_format || ''} onChange={(v) => updateField('identifier_format', v)} placeholder="Optional" />
          </>
        )
      default:
        return null
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10, 10, 10, 0.6)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
      data-testid="auth-provider-form-modal"
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--cx-bg-surface, #fff)',
          border: '1px solid var(--cx-border-subtle)',
          borderRadius: 12,
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--cx-border-subtle)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--cx-text-primary)' }}>
            {isEditing ? 'Edit Authentication Provider' : 'Add Authentication Provider'}
          </span>
          <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={onClose} data-testid="close-form-modal">
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Provider Type</label>
            <select
              className="cx-select"
              value={authType}
              onChange={(e) => handleAuthTypeChange(e.target.value as AuthType)}
              disabled={isEditing}
              data-testid="auth-type-select"
            >
              {AUTH_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {renderFields()}

          <div style={{ display: 'flex', gap: 10, marginTop: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="cx-btn cx-btn--secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="cx-btn cx-btn--primary" disabled={saving} data-testid="save-provider">
              {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Provider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
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
  const [showForm, setShowForm] = useState(false)
  const [editingProvider, setEditingProvider] = useState<AuthProvider | null>(null)
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

  const handleOpenCreate = () => {
    setEditingProvider(null)
    setShowForm(true)
  }

  const handleOpenEdit = (provider: AuthProvider) => {
    setEditingProvider(provider)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingProvider(null)
  }

  const handleSaved = () => {
    handleCloseForm()
    refetch()
  }

  return (
    <div className="cx-page">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)', flex: 1 }}>Authentication Providers</h2>
        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => setShowIframe(true)}>
          Advanced Settings
        </button>
        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={handleOpenCreate} data-testid="add-provider-btn">
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
          <button className="cx-btn cx-btn--primary" onClick={handleOpenCreate} style={{ marginTop: 16 }} data-testid="configure-auth-btn">
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
                  onClick={() => handleOpenEdit(provider)}
                  data-testid={`edit-provider-${provider.id}`}
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

      {showForm && (
        <AuthProviderForm
          accountId={resolvedAccountId}
          provider={editingProvider}
          onClose={handleCloseForm}
          onSaved={handleSaved}
        />
      )}

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
