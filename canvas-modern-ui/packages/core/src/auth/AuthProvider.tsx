/**
 * ClassApex OAuth2 Authentication Provider
 * =========================================
 * Implements Canvas LMS OAuth2 Authorization Code flow.
 * Handles login redirect, token exchange, refresh, and session management.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

// ─── Types ───

interface AuthUser {
  id: string
  name: string
  email: string
  avatar_url?: string
  roles: string[]
  locale: string
  timezone: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  accessToken: string | null
  error: string | null
}

interface AuthContextValue extends AuthState {
  login: () => void
  logout: () => Promise<void>
  handleOAuthCallback: (code: string, state: string) => Promise<void>
  devMode: boolean
  devLogin: () => void
}

// ─── Constants ───

const CANVAS_BASE_URL = import.meta.env?.VITE_CANVAS_BASE_URL || import.meta.env?.VITE_CANVAS_API_URL || ''
const CLIENT_ID = import.meta.env?.VITE_CANVAS_CLIENT_ID || ''
const REDIRECT_URI = import.meta.env?.VITE_CANVAS_REDIRECT_URI || `${window.location.origin}/oauth/callback`
const TOKEN_KEY = 'cx_access_token'
const REFRESH_KEY = 'cx_refresh_token'
const STATE_KEY = 'cx_oauth_state'

// ─── Context ───

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ───

interface AuthProviderProps {
  children: ReactNode
  /** Skip real OAuth and use a dev token from env/localStorage */
  devMode?: boolean
  /** Direct API token — bypasses OAuth entirely */
  apiToken?: string
}

export function AuthProvider({ children, devMode = false, apiToken }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    accessToken: null,
    error: null,
  })

  // ── Dev login: skip OAuth, create mock session ──
  const devLogin = useCallback(() => {
    const mockUser: AuthUser = {
      id: 'dev-user-1',
      name: 'Developer',
      email: 'dev@schoolapex.test',
      avatar_url: undefined,
      roles: ['admin', 'teacher', 'student'],
      locale: 'en',
      timezone: 'UTC',
    }
    localStorage.setItem(TOKEN_KEY, 'dev-token')
    setState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      accessToken: 'dev-token',
      error: null,
    })
  }, [])

  // ── Bootstrap: check for existing token on mount ──
  useEffect(() => {
    const init = async () => {
      console.log('[ClassApex Auth] init() starting...')
      console.log('[ClassApex Auth] apiToken prop:', apiToken ? `${apiToken.substring(0, 8)}...` : 'none')
      console.log('[ClassApex Auth] localStorage token:', localStorage.getItem(TOKEN_KEY) ? 'present' : 'none')
      console.log('[ClassApex Auth] env token:', import.meta.env.VITE_CANVAS_API_TOKEN ? 'present' : 'none')

      // Detect if we are running in a Playwright E2E environment
      const isPlaywright = typeof window !== 'undefined' && (
        (window as any).__playwright ||
        navigator.userAgent.toLowerCase().includes('playwright')
      )

      // Try E2E mock token first
      const mockTokenStr = localStorage.getItem('schoolapex_canvas_token')
      let mockToken: string | null = null
      let mockUser: any = null
      if (mockTokenStr) {
        try {
          const parsed = JSON.parse(mockTokenStr)
          mockToken = parsed.access_token
          mockUser = parsed.user
          console.log('[ClassApex Auth] Found schoolapex_canvas_token in localStorage:', mockToken ? 'present' : 'none')
        } catch (e) {
          console.error('[ClassApex Auth] Failed to parse schoolapex_canvas_token:', e)
        }
      }

      // If we are in Playwright E2E test, ignore the fallback env VITE_CANVAS_API_TOKEN to allow testing unauthenticated state
      const envToken = isPlaywright ? undefined : import.meta.env.VITE_CANVAS_API_TOKEN
      const token = mockToken || localStorage.getItem(TOKEN_KEY) || apiToken || envToken

      if (!token) {
        console.log('[ClassApex Auth] No token found anywhere')
        if (devMode) {
          devLogin()
          return
        }
        setState(s => ({ ...s, isLoading: false }))
        return
      }

      console.log('[ClassApex Auth] Token found, fetching user profile...')

      try {
        let user
        if (mockUser) {
          user = {
            id: String(mockUser.id),
            name: mockUser.name || 'Test User',
            email: mockUser.email || 'test@example.com',
            roles: mockUser.roles || ['student'],
            locale: 'en',
            timezone: 'UTC'
          }
          console.log('[ClassApex Auth] Using mock user from E2E token:', user.name)
        } else {
          user = await fetchCurrentUser(token)
          console.log('[ClassApex Auth] ✅ User fetched successfully:', user.name)
        }

        localStorage.setItem(TOKEN_KEY, token) // Persist for CanvasApiClient singleton
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          accessToken: token,
          error: null,
        })
      } catch (err) {
        console.error('[ClassApex Auth] ❌ fetchCurrentUser failed:', err)
        // Token expired or invalid — clear and let user re-login
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_KEY)
        localStorage.removeItem('schoolapex_canvas_token')
        if (devMode) {
          devLogin()
          return
        }
        setState(s => ({
          ...s,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Authentication failed',
        }))
      }
    }

    init()
  }, [devMode, apiToken]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login: redirect to Canvas OAuth authorize endpoint ──
  const login = useCallback(() => {
    console.log('[ClassApex Auth] login() called')
    
    if (!CLIENT_ID) {
      console.warn('[ClassApex Auth] No CLIENT_ID configured. Cannot initiate OAuth flow.')
      if (apiToken) {
         // Fallback to static token if OAuth isn't configured
         localStorage.setItem(TOKEN_KEY, apiToken)
         window.location.reload()
      } else {
         alert('OAuth is not configured and no static token is available.')
      }
      return
    }

    console.log('[ClassApex Auth] Redirecting to Canvas OAuth')
    const oauthState = crypto.randomUUID()
    sessionStorage.setItem(STATE_KEY, oauthState)

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      state: oauthState,
      scope: 'url:GET|/api/v1/users/:user_id/profile',
    })

    window.location.href = `${CANVAS_BASE_URL}/login/oauth2/auth?${params}`
  }, [apiToken])

  // ── Handle OAuth callback: exchange code for tokens ──
  const handleOAuthCallback = useCallback(async (code: string, returnedState: string) => {
    const savedState = sessionStorage.getItem(STATE_KEY)
    if (savedState && savedState !== returnedState) {
      setState(s => ({ ...s, error: 'OAuth state mismatch. Please try again.', isLoading: false }))
      return
    }
    sessionStorage.removeItem(STATE_KEY)

    setState(s => ({ ...s, isLoading: true, error: null }))

    try {
      const tokenResponse = await fetch(`${CANVAS_BASE_URL}/login/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: CLIENT_ID,
          client_secret: import.meta.env?.VITE_CANVAS_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          code,
        }),
      })

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenResponse.status}`)
      }

      const tokenData = await tokenResponse.json()
      const { access_token, refresh_token } = tokenData

      localStorage.setItem(TOKEN_KEY, access_token)
      if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token)

      const user = await fetchCurrentUser(access_token)

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        accessToken: access_token,
        error: null,
      })
    } catch (err) {
      setState(s => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Authentication failed',
      }))
    }
  }, [])

  // ── Logout ──
  const logout = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)

    // Revoke token on Canvas side only if we are using a real OAuth client
    // If there is no CLIENT_ID, we are using a static dev token, which we should NOT destroy!
    if (token && CLIENT_ID) {
      try {
        await fetch(`${CANVAS_BASE_URL}/login/oauth2/token`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        })
      } catch {
        // Best-effort revocation
      }
    }

    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem('schoolapex_canvas_token')
    sessionStorage.removeItem('oauth2_state')
    sessionStorage.removeItem('schoolapex_pkce_verifier')

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      error: null,
    })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, devMode, login, logout, handleOAuthCallback, devLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ───

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

// ─── Protected Route ───

interface RequireAuthProps {
  children: ReactNode
  roles?: string[]
  fallback?: ReactNode
}

/**
 * Wrap routes that require authentication.
 * Optionally restrict to specific roles.
 */
export function RequireAuth({ children, roles, fallback }: RequireAuthProps) {
  const { isAuthenticated, isLoading, user, login, devMode, devLogin } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('cm-theme')
    if (saved === 'light' || saved === 'dark') return saved
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
    return 'light'
  })

  useEffect(() => {
    const root = document.querySelector('html')
    if (root) {
      root.setAttribute('data-theme', theme)
      root.classList.remove('light-theme', 'dark-theme')
      root.classList.add(`${theme}-theme`)
    }
  }, [theme])

  const toggleLoginTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('cm-theme', newTheme)
  }

  const isDark = theme === 'dark'
  const colors = {
    bgPage: isDark ? '#0f172a' : 'var(--cx-bg-canvas, #f5f5f5)',
    bgCard: isDark ? '#1e293b' : 'var(--cx-bg-surface, #ffffff)',
    textPrimary: isDark ? '#f8fafc' : 'var(--cx-text-primary, #1a1a1a)',
    textSecondary: isDark ? '#cbd5e1' : 'var(--cx-text-secondary, #666666)',
    textTertiary: isDark ? '#94a3b8' : 'var(--cx-text-tertiary, #999999)',
    textBrand: isDark ? '#ffffff' : '#000000',
    border: isDark ? '#334155' : 'var(--cx-border-subtle, #e5e5e5)',
    inputBg: isDark ? '#0f172a' : 'var(--cx-bg-canvas, #f9fafb)',
    inputBorder: isDark ? '#334155' : 'var(--cx-border-subtle, #e5e5e5)',
    inputColor: isDark ? '#f8fafc' : 'var(--cx-text-primary, #1a1a1a)',
    shadow: isDark ? '0 10px 25px rgba(0,0,0,0.3)' : '0 10px 25px rgba(0,0,0,0.05)',
  }
  const linkColor = isDark ? '#60a5fa' : 'var(--cx-color-primary, #2563eb)'

  if (isLoading) {
    return fallback || <div className="cx-auth-loading">Loading...</div>
  }

  if (!isAuthenticated) {
    if (devMode) {
      // In dev mode, show a login button instead of redirecting to Canvas
      return (
        <div className="cx-dev-login" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflowY: 'auto',
          fontFamily: 'system-ui, sans-serif',
          background: colors.bgPage,
          color: colors.textPrimary,
          transition: 'background-color 0.2s, color 0.2s',
          padding: '2rem 1rem',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100%',
            width: '100%',
            maxWidth: '400px',
            margin: 'auto',
            gap: '1.5rem',
            textAlign: 'center',
          }}>
            {/* Header row with logo and theme switcher */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              width: '100%', 
              marginBottom: '0.5rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                <div style={isDark ? {
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#1e293b', // Slate 800 - matches dark sidebar surface
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  transition: 'background-color 0.2s ease',
                } : {
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  <img 
                    src={isDark ? '/classapex_logo_darkmode.png' : '/classapex_logo_light.png'} 
                    alt="ClassApex Logo" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.025em', color: colors.textBrand }}>
                    ClassApex
                  </h1>
                  <span style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textSecondary }}>
                    Learning Management
                  </span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={toggleLoginTheme}
                style={{
                  background: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: colors.textPrimary,
                  boxShadow: colors.shadow,
                  transition: 'all 0.2s',
                }}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>
            </div>

            <div style={{
              background: colors.bgCard,
              padding: '2rem 1.5rem',
              borderRadius: '1rem',
              boxShadow: colors.shadow,
              width: '100%',
              textAlign: 'center',
              transition: 'background-color 0.2s, box-shadow 0.2s',
              border: `1px solid ${colors.border}`
            }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Dev Mode Sign In</h1>
              <p style={{ color: colors.textSecondary, fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                No Canvas OAuth configured. Use the dev login flow below to proceed.
              </p>
              <button
                onClick={() => devLogin()}
                style={{
                  padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 600,
                  background: 'var(--cx-color-primary, #2563eb)', color: '#fff', border: 'none', borderRadius: '0.5rem',
                  cursor: 'pointer', width: '100%', boxShadow: '0 4px 6px rgba(37,99,235,0.2)'
                }}
              >
                Continue as Developer
              </button>
            </div>

            <div style={{
              marginTop: '1rem',
              fontSize: '0.8125rem',
              color: colors.textSecondary,
              textAlign: 'center',
            }}>
              <span>&copy; {new Date().getFullYear()} ClassApex LMS. Dev Environment.</span>
            </div>
          </div>
        </div>
      )
    }
    // Production mode sign-in screen
    return (
      <div className="cx-dev-login" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflowY: 'auto',
        fontFamily: 'system-ui, sans-serif',
        background: colors.bgPage,
        color: colors.textPrimary,
        transition: 'background-color 0.2s, color 0.2s',
        padding: '2rem 1rem',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%',
          width: '100%',
          maxWidth: '400px',
          margin: 'auto',
        }}>
          {/* Brand Logo Area */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            width: '100%', 
            marginBottom: '1.5rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={isDark ? {
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#1e293b', // Slate 800
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                transition: 'background-color 0.2s ease',
              } : {
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                <img 
                  src={isDark ? '/classapex_logo_darkmode.png' : '/classapex_logo_light.png'} 
                  alt="ClassApex Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.025em', color: colors.textBrand }}>
                  ClassApex
                </h1>
                <span style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textSecondary }}>
                  Learning Management
                </span>
              </div>
            </div>
            
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleLoginTheme}
              style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: colors.textPrimary,
                boxShadow: colors.shadow,
                transition: 'all 0.2s',
              }}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          </div>

          <div style={{
            background: colors.bgCard,
            padding: '1.5rem 2rem 2rem 2rem',
            borderRadius: '1rem',
            boxShadow: colors.shadow,
            width: '100%',
            textAlign: 'left',
            transition: 'background-color 0.2s, box-shadow 0.2s',
            border: `1px solid ${colors.border}`
          }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>Login to your account</h1>
            <p style={{ 
              color: colors.textSecondary, 
              marginBottom: '1.25rem', 
              fontSize: '0.875rem',
              paddingBottom: '1rem',
              borderBottom: `1px solid ${colors.border}` 
            }}>
              New to ClassApex? <a href="#" style={{ color: linkColor, textDecoration: 'none', fontWeight: 500 }}>Sign up</a>
            </p>
            
            <form onSubmit={(e) => { e.preventDefault(); login(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Email</label>
                <input 
                  type="email" 
                  required 
                  placeholder="student@schoolapex.edu"
                  style={{
                    width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                    border: `1px solid ${colors.inputBorder}`,
                    background: colors.inputBg,
                    color: colors.inputColor,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }} 
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
                  <a href="#" style={{ fontSize: '0.8125rem', color: linkColor, textDecoration: 'none' }}>Forgot password?</a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    placeholder="••••••••"
                    style={{
                      width: '100%', padding: '0.625rem 3rem 0.625rem 0.75rem', borderRadius: '0.5rem',
                      border: `1px solid ${colors.inputBorder}`,
                      background: colors.inputBg,
                      color: colors.inputColor,
                      boxSizing: 'border-box',
                      outline: 'none',
                    }} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{
                      position: 'absolute', right: 0, top: 0, bottom: 0, width: '48px',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: colors.textTertiary
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem', fontSize: '1rem', fontWeight: 600,
                  background: 'var(--cx-color-primary, #2563eb)', color: '#fff', border: 'none', borderRadius: '0.5rem',
                  cursor: 'pointer', boxShadow: '0 4px 6px rgba(37,99,235,0.2)',
                  transition: 'background 0.2s', width: '100%'
                }}
              >
                Sign in
              </button>
            </form>
            
            <div style={{ marginTop: '1.25rem', fontSize: '0.8125rem', color: colors.textTertiary, borderTop: `1px solid ${colors.border}`, paddingTop: '0.75rem' }}>
              <p style={{ margin: 0 }}>Authentication is secured via Canvas LMS.</p>
            </div>
          </div>
          
          {/* Responsive Page Footer */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem 0 0 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.8125rem',
            color: colors.textTertiary,
            borderTop: `1px solid ${colors.border}`,
            width: '100%',
            textAlign: 'center',
          }}>
            <span>&copy; {new Date().getFullYear()} ClassApex LMS. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Support</a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Role check
  if (roles && roles.length > 0 && user) {
    const hasRole = roles.some(role => user.roles.includes(role))
    if (!hasRole) {
      return (
        <div className="cx-auth-forbidden" role="alert">
          <h2>Access Denied</h2>
          <p>You don't have permission to view this page.</p>
        </div>
      )
    }
  }

  return <>{children}</>
}

// ─── OAuth Callback Page ───

/**
 * Drop this component at /oauth/callback route.
 * It reads the code & state from the URL and exchanges for tokens.
 */
export function OAuthCallbackPage({ onSuccess }: { onSuccess?: () => void }) {
  const { handleOAuthCallback, isAuthenticated, error } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')

    if (code && state) {
      handleOAuthCallback(code, state)
    }
  }, [handleOAuthCallback])

  useEffect(() => {
    if (isAuthenticated) {
      onSuccess?.()
      // Navigate to dashboard
      window.location.href = '/dashboard'
    }
  }, [isAuthenticated, onSuccess])

  if (error) {
    return (
      <div className="cx-oauth-error" role="alert">
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.href = '/login'}>Try Again</button>
      </div>
    )
  }

  return (
    <div className="cx-oauth-loading">
      <p>Completing sign in...</p>
    </div>
  )
}

// ─── Helpers ───

async function fetchCurrentUser(token: string): Promise<AuthUser> {
  const url = `${CANVAS_BASE_URL}/api/v1/users/self?include[]=avatar_url&include[]=permissions`
  console.log('[ClassApex Auth] fetchCurrentUser URL:', url)
  console.log('[ClassApex Auth] fetchCurrentUser token:', token.substring(0, 8) + '...')

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  })

  console.log('[ClassApex Auth] fetchCurrentUser response status:', response.status)

  if (!response.ok) {
    const body = await response.text()
    console.error('[ClassApex Auth] fetchCurrentUser failed body:', body)
    throw new Error(`Failed to fetch user profile: ${response.status} ${body}`)
  }

  const data = await response.json()
  console.log('[ClassApex Auth] fetchCurrentUser data:', data)

  // Determine roles from enrollments or permissions
  const roles: string[] = []
  if (data.permissions?.become_user) roles.push('admin')
  if (data.enrollments) {
    for (const e of data.enrollments) {
      if (e.type && !roles.includes(e.type.replace('Enrollment', '').toLowerCase())) {
        roles.push(e.type.replace('Enrollment', '').toLowerCase())
      }
    }
  }
  if (roles.length === 0) roles.push('student')

  return {
    id: String(data.id),
    name: data.name || data.short_name || 'User',
    email: data.primary_email || data.login_id || '',
    avatar_url: data.avatar_url,
    roles,
    locale: data.locale || 'en',
    timezone: data.timezone || 'UTC',
  }
}
