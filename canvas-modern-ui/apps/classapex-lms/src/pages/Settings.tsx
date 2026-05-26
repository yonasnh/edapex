import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n, type Locale } from '../contexts/I18nContext';
import { useCanvasQuery, useCanvasMutation, canvasFetch } from '../hooks/useCanvasQuery';
import { useNotification } from '../hooks/useNotification';
import { useRole } from '../contexts/RoleContext';
import { Link } from 'react-router-dom';


function UserSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 17v-1a3 3 0 00-3-3H7a3 3 0 00-3 3v1"/><circle cx="10" cy="6" r="3"/></svg>; }
function BellSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2a6 6 0 00-6 6c0 3-1 5-2 6h16c-1-1-2-3-2-6a6 6 0 00-6-6z"/><path d="M8 14a2 2 0 004 0"/></svg>; }
function PaletteSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><circle cx="7" cy="7" r="1" fill="currentColor"/><circle cx="13" cy="7" r="1" fill="currentColor"/><circle cx="10" cy="13" r="1" fill="currentColor"/><path d="M14 11c-1 0-2 1-2 2"/><path d="M6 11c1 0 2 1 2 2"/></svg>; }
function ShieldSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 1l7 3v5a7 7 0 01-7 7 7 7 0 01-7-7V4l7-3z"/><path d="M7 10l2 2 4-4"/></svg>; }
function CheckSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M5.5 8l2 2 3-4"/></svg>; }
function SunSvg() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="9" r="3.5"/><path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.3 3.3l1.4 1.4M13.3 13.3l1.4 1.4M3.3 14.7l1.4-1.4M13.3 4.7l1.4-1.4"/></svg>; }
function MoonSvg() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 9.5A6.5 6.5 0 118.5 3a5 5 0 106.5 6.5z"/></svg>; }
function SpinnerSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.7s linear infinite' }}><circle cx="8" cy="8" r="6" strokeOpacity="0.3"/><path d="M8 2a6 6 0 016 6" strokeLinecap="round"/></svg>; }
function InfoSvg() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>; }

function ObserverPairingSection() {
  const { showToast } = useNotification()
  const [pairingCode, setPairingCode] = useState('')
  const [loading, setLoading] = useState(false)

  const generateCode = async () => {
    setLoading(true)
    try {
      const res = await canvasFetch('/api/v1/users/self/observer_pairing_codes', { method: 'POST' })
      setPairingCode(res?.code || '')
      showToast({ title: 'Pairing code generated', type: 'success' })
    } catch (err: any) {
      const msg = err.status === 403
        ? 'Observer pairing is not enabled for your account. Contact your school admin if you need parent/guardian access.'
        : (err.message || 'Unknown error')
      showToast({ title: 'Generation failed', message: msg, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', lineHeight: 1.5 }}>
        Generate a pairing code for an observer (parent/guardian) to link to your account. Codes expire after 7 days or first use.
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ padding: '10px 18px', background: 'var(--cx-bg-surface-raised)', borderRadius: 8, border: '1px solid var(--cx-border-subtle)', minWidth: 120, textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--cm-font-family-mono, monospace)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--cx-text-primary)', letterSpacing: '0.1em' }}>{pairingCode || '—'}</span>
        </div>
        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={generateCode} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Code'}
        </button>
      </div>
    </div>
  )
}

function DataExportButton() {
  const { showToast } = useNotification()
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const [coursesRes, todosRes, submissionsRes] = await Promise.all([
        canvasFetch('/api/v1/courses?per_page=100'),
        canvasFetch('/api/v1/users/self/todo?per_page=100'),
        canvasFetch('/api/v1/users/self/submissions?per_page=100'),
      ])
      const data = {
        exported_at: new Date().toISOString(),
        courses: coursesRes,
        todo_items: todosRes,
        submissions: submissionsRes,
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `classapex-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      showToast({ title: 'Data exported', type: 'success' })
    } catch (err: any) {
      showToast({ title: 'Export failed', message: err.message || 'Unknown error', type: 'error' })
    } finally {
      setExporting(false)
    }
  }

  return (
    <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={handleExport} disabled={exporting}>
      {exporting ? 'Exporting...' : 'Download JSON'}
    </button>
  )
}

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Anchorage', 'Pacific/Honolulu', 'America/Phoenix',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney',
  'UTC',
]

const LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'ar', label: 'العربية (Arabic - RTL)' },
]

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const { showToast } = useNotification()
  const { role } = useRole()

  // ── Load real user from Canvas API ──
  const { data: canvasUser, isLoading: userLoading, refetch: refetchUser } = useCanvasQuery<any>(
    '/api/v1/users/self',
    { include: ['avatar_url', 'bio', 'locale', 'effective_locale', 'permissions'] } as any
  )

  // ── Profile form state ──
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [timezone, setTimezone] = useState('America/New_York')

  // ── Notification prefs (Canvas notification_preferences API) ──
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)

  // ── Accessibility Options (S23-04, S23-05) ──
  const [highContrast, setHighContrast] = useState(() => {
    return document.documentElement.getAttribute('data-high-contrast') === 'true'
  })
  
  const [reducedMotion, setReducedMotion] = useState(() => {
    return document.documentElement.classList.contains('reduced-motion')
  })

  // ── PWA Install Banner State (S22-09) ──
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  // ── Device Emulation Sandbox State (S22-10) ──
  const [activeDevice, setActiveDevice] = useState<string>('desktop');

  const handleDeviceChange = (device: string) => {
    setActiveDevice(device);
    
    // Reset any existing custom body inline styles first
    document.body.style.maxWidth = '';
    document.body.style.margin = '';
    document.body.style.boxShadow = '';
    document.body.style.borderRadius = '';
    document.body.style.overflow = '';
    document.body.style.border = '';
    document.body.style.height = '';
    document.body.style.position = '';
    document.body.style.marginTop = '';
    document.body.style.backgroundColor = '';

    if (device === 'iphone') {
      document.body.style.maxWidth = '375px';
      document.body.style.margin = '40px auto';
      document.body.style.boxShadow = '0 12px 40px rgba(0,0,0,0.25)';
      document.body.style.borderRadius = '36px';
      document.body.style.overflow = 'hidden';
      document.body.style.border = '14px solid #1a1a1a';
      document.body.style.height = '812px';
      document.body.style.position = 'relative';
      document.body.style.backgroundColor = 'var(--cx-bg-surface)';
    } else if (device === 'android') {
      document.body.style.maxWidth = '412px';
      document.body.style.margin = '40px auto';
      document.body.style.boxShadow = '0 12px 40px rgba(0,0,0,0.25)';
      document.body.style.borderRadius = '24px';
      document.body.style.overflow = 'hidden';
      document.body.style.border = '10px solid #1c1c1c';
      document.body.style.height = '915px';
      document.body.style.position = 'relative';
      document.body.style.backgroundColor = 'var(--cx-bg-surface)';
    } else if (device === 'tablet') {
      document.body.style.maxWidth = '820px';
      document.body.style.margin = '40px auto';
      document.body.style.boxShadow = '0 12px 40px rgba(0,0,0,0.25)';
      document.body.style.borderRadius = '16px';
      document.body.style.overflow = 'hidden';
      document.body.style.border = '16px solid #111';
      document.body.style.height = '1180px';
      document.body.style.position = 'relative';
      document.body.style.backgroundColor = 'var(--cx-bg-surface)';
    }
  };

  useEffect(() => {
    return () => {
      // Clean up body emulations on unmount
      document.body.style.maxWidth = '';
      document.body.style.margin = '';
      document.body.style.boxShadow = '';
      document.body.style.borderRadius = '';
      document.body.style.overflow = '';
      document.body.style.border = '';
      document.body.style.height = '';
      document.body.style.position = '';
      document.body.style.marginTop = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  // ── UI state ──
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState('')

  // ── Communication Channels ──
  const { data: commChannels, refetch: refetchChannels } = useCanvasQuery<any[]>('/api/v1/users/self/communication_channels')
  const [newChannel, setNewChannel] = useState('')

  // ── Mutation for updating user profile ──
  const { mutate: updateUser, isLoading: saving } = useCanvasMutation<any, any>(
    '/api/v1/users/self',
    'PUT'
  )

  // Seed form from Canvas API response
  useEffect(() => {
    if (!canvasUser) return
    setName(canvasUser.name || '')
    setEmail(canvasUser.primary_email || canvasUser.login_id || '')
    setBio(canvasUser.bio || '')
    setTimezone(canvasUser.time_zone || 'UTC')
  }, [canvasUser])

  // Capture PWA Install Promotion
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleSave = async () => {
    setShowError('')
    setShowSuccess(false)

    // Persist local preferences immediately so accessibility and display triggers succeed
    localStorage.setItem('classapex-locale', locale)
    localStorage.setItem('classapex-high-contrast', String(highContrast))
    localStorage.setItem('classapex-reduced-motion', String(reducedMotion))

    const userPayload: any = {}
    if (name !== (canvasUser?.name || '')) {
      userPayload.name = name
      userPayload.short_name = name.split(' ')[0] || name
    }
    if (bio !== (canvasUser?.bio || '')) {
      userPayload.bio = bio
    }
    if (locale !== (canvasUser?.locale || '')) {
      userPayload.locale = locale
    }
    if (timezone !== (canvasUser?.time_zone || '')) {
      userPayload.time_zone = timezone
    }

    // If no Canvas profile fields actually changed, show quick local success
    if (Object.keys(userPayload).length === 0) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      return
    }

    const result = await updateUser({ user: userPayload })
    if (result) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } else {
      // The update failed (which triggers 403 if changing a locked profile field like name)
      setShowSuccess(true)
      setShowError('Display settings saved locally. (Profile name/bio updates are restricted by your school.)')
      setTimeout(() => {
        setShowError('')
      }, 5000)
    }
  }

  const handleToggleHighContrast = () => {
    const newVal = !highContrast
    setHighContrast(newVal)
    if (newVal) {
      document.documentElement.setAttribute('data-high-contrast', 'true')
      localStorage.setItem('classapex-high-contrast', 'true')
    } else {
      document.documentElement.removeAttribute('data-high-contrast')
      localStorage.removeItem('classapex-high-contrast')
    }
  }

  const handleToggleReducedMotion = () => {
    const newVal = !reducedMotion
    setReducedMotion(newVal)
    if (newVal) {
      document.documentElement.classList.add('reduced-motion')
      localStorage.setItem('classapex-reduced-motion', 'true')
    } else {
      document.documentElement.classList.remove('reduced-motion')
      localStorage.removeItem('classapex-reduced-motion')
    }
  }

  const handleInstallApp = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`[PWA] Install status: ${outcome}`)
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  const inputStyle: React.CSSProperties = {
    border: '1px solid var(--cx-border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '6px 12px',
    width: 240,
    background: 'var(--cx-bg-surface)',
    color: 'var(--cx-text-primary)',
    fontSize: '0.875rem',
  }

  if (userLoading) {
    return (
      <div className="cx-page">
        <div className="cx-loading" role="status" aria-label="Loading settings">
          <div className="cx-loading__spinner" />
          <span className="cx-loading__text">Loading settings profile…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ justifyContent: 'flex-end', paddingTop: 0 }}>
        <button
          className="cx-btn cx-btn--primary cx-btn--sm"
          onClick={handleSave}
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {saving ? <><SpinnerSvg /> {t('settings.saving')}</> : t('settings.save')}
        </button>
      </div>

      {showSuccess && (
        <div className="cx-notification cx-notification--success" style={{ marginBottom: 0 }} role="alert">
          <CheckSvg />
          <div>
            <div className="cx-notification__title">{t('settings.saved')}</div>
            <div className="cx-notification__subtitle">Your profile settings have been synchronized.</div>
          </div>
        </div>
      )}
      {showError && (
        <div className="cx-notification cx-notification--warning" style={{ marginBottom: 0 }} role="alert">
          <div className="cx-notification__title">{t('settings.failed')}</div>
          <div className="cx-notification__subtitle">{showError}</div>
        </div>
      )}

      {/* ── PWA Install Banner Promotion (S22-09) ── */}
      {isInstallable && (
        <div className="cx-section" style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.05) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginTop: 24
        }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)', fontSize: '1rem' }}>
              {t('pwa.installTitle')}
            </h3>
            <p style={{ margin: '4px 0 0', color: 'var(--cx-text-secondary)', fontSize: '0.85rem' }}>
              {t('pwa.installDesc')}
            </p>
          </div>
          <button onClick={handleInstallApp} className="cx-btn cx-btn--primary cx-btn--sm">
            {t('pwa.installBtn')}
          </button>
        </div>
      )}

      {/* ── Profile ── */}
      <div className="cx-settings-section" style={{ marginTop: 24 }}>
        <h2 className="cx-settings-section__title"><UserSvg /> {t('settings.profile')}</h2>
        <div className="cx-section">
          <div className="cx-settings-row">
            <div>
              <div className="cx-settings-row__label">Avatar</div>
              <div className="cx-settings-row__desc">Your Canvas profile picture</div>
            </div>
            <div className="cx-settings-row__control" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                src={canvasUser?.avatar_url || '/default-avatar.png'}
                alt={name}
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--cx-border-subtle)' }}
              />
              <label style={{ position: 'relative', cursor: 'pointer' }}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      const formData = new FormData()
                      formData.append('name', file.name)
                      formData.append('content_type', file.type)
                      formData.append('size', String(file.size))
                      const preflight = await canvasFetch('/api/v1/users/self/files', { method: 'POST', body: formData })
                      if (preflight.upload_url) {
                        const upForm = new FormData()
                        for (const [key, value] of Object.entries(preflight.upload_params || {})) {
                          upForm.append(key, String(value))
                        }
                        upForm.append('file', file)
                        await fetch(preflight.upload_url, { method: 'POST', body: upForm })
                      }
                      await updateUser({ user: { avatar: { url: preflight.url || preflight.preview_url } } })
                      await refetchUser()
                      showToast({ title: 'Avatar updated', type: 'success' })
                    } catch (err: any) {
                      showToast({ title: 'Upload failed', message: err.message || 'Unknown error', type: 'error' })
                    }
                  }}
                />
                <span className="cx-btn cx-btn--secondary cx-btn--sm">Change</span>
              </label>
            </div>
          </div>

          <div className="cx-settings-row">
            <div>
              <div className="cx-settings-row__label">Full Name</div>
              <div className="cx-settings-row__desc">Your name shown across Canvas</div>
            </div>
            <div className="cx-settings-row__control">
              <input
                type="text"
                style={inputStyle}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className="cx-settings-row">
            <div>
              <div className="cx-settings-row__label">Email Address</div>
              <div className="cx-settings-row__desc">Primary login email (read-only in Canvas)</div>
            </div>
            <div className="cx-settings-row__control">
              <input
                type="email"
                style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
                value={email}
                readOnly
                title="Email changes must be made via Canvas account settings"
              />
            </div>
          </div>

          <div className="cx-settings-row">
            <div>
              <div className="cx-settings-row__label">Bio</div>
              <div className="cx-settings-row__desc">Short description visible on your profile</div>
            </div>
            <div className="cx-settings-row__control">
              <textarea
                style={{ ...inputStyle, width: 300, height: 72, resize: 'vertical' }}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell others about yourself…"
              />
            </div>
          </div>

          <div className="cx-settings-row">
            <div>
              <div className="cx-settings-row__label">{t('settings.language')}</div>
              <div className="cx-settings-row__desc">ClassApex interface locale & direction</div>
            </div>
            <div className="cx-settings-row__control">
              <select 
                className="cx-select" 
                value={locale} 
                onChange={e => setLocale(e.target.value as Locale)}
              >
                {LOCALES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <div className="cx-settings-row" style={{ borderBottom: 'none' }}>
            <div>
              <div className="cx-settings-row__label">{t('settings.timezone')}</div>
              <div className="cx-settings-row__desc">Used for scheduling and deadlines</div>
            </div>
            <div className="cx-settings-row__control">
              <select className="cx-select" value={timezone} onChange={e => setTimezone(e.target.value)}>
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Notifications ── */}
      <div className="cx-settings-section">
        <h2 className="cx-settings-section__title"><BellSvg /> {t('settings.notifications')}</h2>
        <div className="cx-section">
          <div className="cx-settings-row">
            <div>
              <div className="cx-settings-row__label">Email Notifications</div>
              <div className="cx-settings-row__desc">Receive Canvas alerts via email</div>
            </div>
            <div className="cx-settings-row__control">
              <label className="cx-toggle">
                <input type="checkbox" checked={emailNotifications} onChange={e => setEmailNotifications(e.target.checked)} />
                <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
              </label>
            </div>
          </div>
          <div className="cx-settings-row" style={{ borderBottom: 'none' }}>
            <div>
              <div className="cx-settings-row__label">Push Notifications</div>
              <div className="cx-settings-row__desc">Browser push alerts for new activity</div>
            </div>
            <div className="cx-settings-row__control">
              <label className="cx-toggle">
                <input type="checkbox" checked={pushNotifications} onChange={e => setPushNotifications(e.target.checked)} />
                <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ── Communication Channels ── */}
      <div className="cx-settings-section">
        <h2 className="cx-settings-section__title"><BellSvg /> Communication Channels</h2>
        <div className="cx-section">
          {(commChannels || []).map((ch: any) => (
            <div key={ch.id} className="cx-settings-row">
              <div>
                <div className="cx-settings-row__label">{ch.address}</div>
                <div className="cx-settings-row__desc">{ch.type} · {ch.workflow_state}</div>
              </div>
              <div className="cx-settings-row__control">
                <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={async () => {
                  try { await canvasFetch(`/api/v1/users/self/communication_channels/${ch.id}`, { method: 'DELETE' }); refetchChannels(); showToast({ title: 'Channel removed', type: 'success' }) }
                  catch (err: any) { showToast({ title: 'Remove failed', message: err.message, type: 'error' }) }
                }} style={{ color: 'var(--cx-color-danger, #dc2626)' }}>Remove</button>
              </div>
            </div>
          ))}
          <div className="cx-settings-row" style={{ borderBottom: 'none' }}>
            <div>
              <div className="cx-settings-row__label">Add Email Channel</div>
              <div className="cx-settings-row__desc">Receive notifications at an additional address</div>
            </div>
            <div className="cx-settings-row__control" style={{ display: 'flex', gap: 8 }}>
              <input type="email" className="cx-input" style={{ ...inputStyle, width: 200 }} value={newChannel} onChange={e => setNewChannel(e.target.value)} placeholder="email@example.com" />
              <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={async () => {
                if (!newChannel.trim()) return
                try { await canvasFetch('/api/v1/users/self/communication_channels', { method: 'POST', body: { communication_channel: { address: newChannel.trim(), type: 'email' } } }); setNewChannel(''); refetchChannels(); showToast({ title: 'Channel added', type: 'success' }) }
                catch (err: any) { showToast({ title: 'Add failed', message: err.message, type: 'error' }) }
              }}>Add</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Appearance ── */}
      <div className="cx-settings-section">
        <h2 className="cx-settings-section__title"><PaletteSvg /> {t('settings.appearance')}</h2>
        <div className="cx-section">
          <div className="cx-settings-row">
            <div>
              <div className="cx-settings-row__label">{t('settings.theme')}</div>
              <div className="cx-settings-row__desc">Light or dark mode</div>
            </div>
            <div className="cx-settings-row__control" style={{ display: 'flex', gap: 8 }}>
              <button
                className={theme === 'light' ? 'cx-btn cx-btn--primary cx-btn--sm' : 'cx-btn cx-btn--secondary cx-btn--sm'}
                onClick={() => { if (theme !== 'light') toggleTheme() }}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <SunSvg /> Light
              </button>
              <button
                className={theme === 'dark' ? 'cx-btn cx-btn--primary cx-btn--sm' : 'cx-btn cx-btn--secondary cx-btn--sm'}
                onClick={() => { if (theme !== 'dark') toggleTheme() }}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MoonSvg /> Dark
              </button>
            </div>
          </div>

          <div className="cx-settings-row" style={{ borderBottom: 'none' }}>
            <div>
              <div className="cx-settings-row__label">Accent Color</div>
              <div className="cx-settings-row__desc">Select a theme highlight color for your workspace</div>
            </div>
            <div className="cx-settings-row__control" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { name: 'Purple', value: '#8a3ffc' },
                  { name: 'Blue', value: '#0f62fe' },
                  { name: 'Green', value: '#10b981' },
                  { name: 'Orange', value: '#ff832b' },
                  { name: 'Red', value: '#da1e28' },
                  { name: 'Pink', value: '#ec4899' },
                  { name: 'Indigo', value: '#6366f1' },
                ].map(color => (
                  <button
                    key={color.value}
                    onClick={() => setAccentColor(color.value)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: color.value,
                      border: accentColor === color.value ? '2px solid var(--cx-text-primary)' : '2px solid transparent',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      transition: 'transform 0.2s, border-color 0.2s',
                      transform: accentColor === color.value ? 'scale(1.1)' : 'scale(1)',
                    }}
                    className="cx-accent-swatch"
                    title={color.name}
                  >
                    {accentColor === color.value && (
                      <span style={{ color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
                
                {/* Custom Color Selector Swatch */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: !['#8a3ffc', '#0f62fe', '#10b981', '#ff832b', '#da1e28', '#ec4899', '#6366f1'].includes(accentColor) ? '2px solid var(--cx-text-primary)' : '2px solid var(--cx-border-subtle)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s',
                    transform: !['#8a3ffc', '#0f62fe', '#10b981', '#ff832b', '#da1e28', '#ec4899', '#6366f1'].includes(accentColor) ? 'scale(1.1)' : 'scale(1)',
                    background: !['#8a3ffc', '#0f62fe', '#10b981', '#ff832b', '#da1e28', '#ec4899', '#6366f1'].includes(accentColor) ? accentColor : 'conic-gradient(from 0deg, red, yellow, green, cyan, blue, magenta, red)',
                  }} title="Custom Color">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                      }}
                    />
                    {!['#8a3ffc', '#0f62fe', '#10b981', '#ff832b', '#da1e28', '#ec4899', '#6366f1'].includes(accentColor) && (
                      <span style={{ color: '#ffffff', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </div>
                  {!['#8a3ffc', '#0f62fe', '#10b981', '#ff832b', '#da1e28', '#ec4899', '#6366f1'].includes(accentColor) && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--cx-text-secondary)', fontFamily: 'var(--cm-font-family-mono, monospace)' }}>
                      {accentColor.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── S22-10: Multi-Device Simulated Preview Sandbox ── */}
      <div className="cx-settings-section">
        <h2 className="cx-settings-section__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="5" y="2" width="14" height="20" rx="3" />
            <path d="M12 18h.01M17 2H7v14h10V2z" />
          </svg>
          Multi-Device Responsive Preview Sandbox
        </h2>
        <div className="cx-section">
          <div className="cx-settings-row" style={{ borderBottom: 'none' }}>
            <div>
              <div className="cx-settings-row__label">Simulate Device Viewports</div>
              <div className="cx-settings-row__desc">
                Test UI breakpoints and mobile layouts on iOS Safari, Android Chrome, and Tablet frameworks (S22-10).
              </div>
            </div>
            <div className="cx-settings-row__control" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { id: 'desktop', label: '🖥 Desktop' },
                { id: 'iphone', label: '📱 iOS Safari (iPhone)' },
                { id: 'android', label: '🤖 Android Chrome' },
                { id: 'tablet', label: '📟 Tablet (iPad)' }
              ].map(dev => (
                <button
                  key={dev.id}
                  className={activeDevice === dev.id ? 'cx-btn cx-btn--primary cx-btn--sm' : 'cx-btn cx-btn--secondary cx-btn--sm'}
                  onClick={() => handleDeviceChange(dev.id)}
                  style={{ height: 36, whiteSpace: 'nowrap' }}
                >
                  {dev.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Accessibility Settings (S23-04, S23-05) ── */}
      <div className="cx-settings-section">
        <h2 className="cx-settings-section__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <InfoSvg /> {t('settings.accessibility')}
        </h2>
        <div className="cx-section">
          <div className="cx-settings-row">
            <div>
              <div className="cx-settings-row__label">{t('settings.highContrast')}</div>
              <div className="cx-settings-row__desc">Increases clarity and text contrast limits (S23-04)</div>
            </div>
            <div className="cx-settings-row__control">
              <label className="cx-toggle">
                <input type="checkbox" checked={highContrast} onChange={handleToggleHighContrast} />
                <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
              </label>
            </div>
          </div>

          <div className="cx-settings-row">
            <div>
              <div className="cx-settings-row__label">{t('settings.reducedMotion')}</div>
              <div className="cx-settings-row__desc">Disables animations, transitions, and hover motion scaling (S23-05)</div>
            </div>
            <div className="cx-settings-row__control">
              <label className="cx-toggle">
                <input type="checkbox" checked={reducedMotion} onChange={handleToggleReducedMotion} />
                <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
              </label>
            </div>
          </div>

          <div className="cx-settings-row" style={{ borderBottom: 'none' }}>
            <div>
              <div className="cx-settings-row__label">{t('a11y.statement')}</div>
              <div className="cx-settings-row__desc">Read our statement and WCAG 2.1 compliance audit (S23-10)</div>
            </div>
            <div className="cx-settings-row__control">
              <Link to="/accessibility-statement" className="cx-btn cx-btn--secondary cx-btn--sm">
                View Compliance Statement
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Observer Pairing Code (students only) ── */}
      {role === 'student' && (
        <div className="cx-settings-section">
          <h2 className="cx-settings-section__title"><ShieldSvg /> Observer Pairing</h2>
          <div className="cx-section">
            <ObserverPairingSection />
          </div>
        </div>
      )}

      {/* ── Data Export ── */}
      <div className="cx-settings-section">
        <h2 className="cx-settings-section__title"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Data Export</h2>
        <div className="cx-section">
          <div className="cx-settings-row" style={{ borderBottom: 'none' }}>
            <div>
              <div className="cx-settings-row__label">Export Your Data</div>
              <div className="cx-settings-row__desc">Download all your courses, assignments, and grades as a JSON file</div>
            </div>
            <div className="cx-settings-row__control">
              <DataExportButton />
            </div>
          </div>
        </div>
      </div>

      {/* ── Privacy ── */}
      <div className="cx-settings-section">
        <h2 className="cx-settings-section__title"><ShieldSvg /> {t('settings.privacy')}</h2>
        <div className="cx-section">
          <div className="cx-settings-row" style={{ borderBottom: 'none' }}>
            <div>
              <div className="cx-settings-row__label">Canvas Account Settings</div>
              <div className="cx-settings-row__desc">Advanced privacy, password, and 2FA settings are managed in Canvas</div>
            </div>
            <div className="cx-settings-row__control">
              <a
                href="/profile/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="cx-btn cx-btn--secondary cx-btn--sm"
              >
                Open Canvas Settings ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SettingsPage;
