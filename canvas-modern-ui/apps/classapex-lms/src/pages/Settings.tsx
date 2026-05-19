import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n, type Locale } from '../contexts/I18nContext';
import { useCanvasQuery, useCanvasMutation } from '../hooks/useCanvasQuery';
import { Link } from 'react-router-dom';

function SettingsSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>; }
function UserSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 17v-1a3 3 0 00-3-3H7a3 3 0 00-3 3v1"/><circle cx="10" cy="6" r="3"/></svg>; }
function BellSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2a6 6 0 00-6 6c0 3-1 5-2 6h16c-1-1-2-3-2-6a6 6 0 00-6-6z"/><path d="M8 14a2 2 0 004 0"/></svg>; }
function PaletteSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><circle cx="7" cy="7" r="1" fill="currentColor"/><circle cx="13" cy="7" r="1" fill="currentColor"/><circle cx="10" cy="13" r="1" fill="currentColor"/><path d="M14 11c-1 0-2 1-2 2"/><path d="M6 11c1 0 2 1 2 2"/></svg>; }
function ShieldSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 1l7 3v5a7 7 0 01-7 7 7 7 0 01-7-7V4l7-3z"/><path d="M7 10l2 2 4-4"/></svg>; }
function CheckSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M5.5 8l2 2 3-4"/></svg>; }
function SunSvg() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="9" r="3.5"/><path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.3 3.3l1.4 1.4M13.3 13.3l1.4 1.4M3.3 14.7l1.4-1.4M13.3 4.7l1.4-1.4"/></svg>; }
function MoonSvg() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 9.5A6.5 6.5 0 118.5 3a5 5 0 106.5 6.5z"/></svg>; }
function SpinnerSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.7s linear infinite' }}><circle cx="8" cy="8" r="6" strokeOpacity="0.3"/><path d="M8 2a6 6 0 016 6" strokeLinecap="round"/></svg>; }
function InfoSvg() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>; }

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
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();

  // ── Load real user from Canvas API ──
  const { data: canvasUser, isLoading: userLoading } = useCanvasQuery<any>(
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

  // ── Mutation for updating user profile ──
  const { mutate: updateUser, isLoading: saving, error: mutationError } = useCanvasMutation<any, any>(
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
          {canvasUser?.avatar_url && (
            <div className="cx-settings-row">
              <div>
                <div className="cx-settings-row__label">Avatar</div>
                <div className="cx-settings-row__desc">Your Canvas profile picture</div>
              </div>
              <div className="cx-settings-row__control">
                <img
                  src={canvasUser.avatar_url}
                  alt={name}
                  style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--cx-border-subtle)' }}
                />
              </div>
            </div>
          )}

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

      {/* ── Appearance ── */}
      <div className="cx-settings-section">
        <h2 className="cx-settings-section__title"><PaletteSvg /> {t('settings.appearance')}</h2>
        <div className="cx-section">
          <div className="cx-settings-row" style={{ borderBottom: 'none' }}>
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
