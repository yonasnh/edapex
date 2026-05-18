/**
 * ClassApex OAuth2 Authentication Provider
 * =========================================
 * Implements Canvas LMS OAuth2 Authorization Code flow.
 * Handles login redirect, token exchange, refresh, and session management.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'

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

      const token = localStorage.getItem(TOKEN_KEY) || apiToken || import.meta.env.VITE_CANVAS_API_TOKEN

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
        const user = await fetchCurrentUser(token)
        console.log('[ClassApex Auth] ✅ User fetched successfully:', user.name)
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
    console.log('[ClassApex Auth] login() called — redirecting to Canvas OAuth')
    console.log('[ClassApex Auth] CLIENT_ID:', CLIENT_ID || '(empty!)')
    console.log('[ClassApex Auth] CANVAS_BASE_URL:', CANVAS_BASE_URL || '(empty)')

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
  }, [])

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

    // Revoke token on Canvas side
    if (token) {
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
  const hasRedirected = useRef(false)

  // Use useEffect for the redirect — NEVER redirect during render
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !devMode && !hasRedirected.current) {
      console.log('[ClassApex Auth] RequireAuth: not authenticated, triggering login redirect')
      hasRedirected.current = true
      login()
    }
  }, [isLoading, isAuthenticated, devMode, login])

  if (isLoading) {
    return fallback || <div className="cx-auth-loading">Loading...</div>
  }

  if (!isAuthenticated) {
    if (devMode) {
      // In dev mode, show a login button instead of redirecting to Canvas
      return (
        <div className="cx-dev-login" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100vh', fontFamily: 'system-ui, sans-serif', gap: '1rem',
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>ClassApex LMS — Dev Mode</h1>
          <p style={{ color: '#666' }}>No Canvas OAuth configured. Use dev login to continue.</p>
          <button
            onClick={() => devLogin()}
            style={{
              padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 500,
              background: '#2563eb', color: '#fff', border: 'none', borderRadius: '0.5rem',
              cursor: 'pointer',
            }}
          >
            Continue as Developer
          </button>
        </div>
      )
    }
    // Show loading while redirect is pending
    return fallback || <div className="cx-auth-loading">Redirecting to login...</div>
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
