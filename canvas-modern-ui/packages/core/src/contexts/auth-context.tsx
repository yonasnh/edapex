import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { CanvasOAuth2Manager, OAuth2Config, OAuth2Token, createOAuth2Manager } from '../auth/oauth2'
import { User } from '../types/canvas'

/**
 * Authentication state interface
 */
interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  token: OAuth2Token | null
  error: string | null
}

/**
 * Authentication context interface
 */
interface AuthContextType extends AuthState {
  login: () => Promise<void>
  logout: () => void
  refreshToken: () => Promise<boolean>
  handleCallback: (code: string, state: string) => Promise<void>
  clearError: () => void
}

/**
 * Authentication context
 */
const AuthContext = createContext<AuthContextType | null>(null)

/**
 * Authentication provider props
 */
interface AuthProviderProps {
  children: ReactNode
  config?: OAuth2Config // Made optional to use environment-based config
}

/**
 * Authentication Provider Component
 *
 * Provides authentication state and methods throughout the application.
 * Handles OAuth2 flow, token management, and user session persistence.
 * Uses environment-based configuration by default.
 */
export function AuthProvider({ children, config }: AuthProviderProps) {
  const [authManager] = useState(() => {
    try {
      return config ? new CanvasOAuth2Manager(config) : createOAuth2Manager()
    } catch (error) {
      console.error('Failed to initialize OAuth2 manager:', error)
      throw error
    }
  })
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null,
    error: null,
  })

  /**
   * Initialize authentication state on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        // Check if user is already authenticated
        if (authManager.isAuthenticated()) {
          const token = authManager.getStoredToken()
          const currentUser = authManager.getCurrentUser()

          if (token && currentUser) {
            // Convert OAuth2 user to full User type
            const user: User = {
              id: currentUser.id.toString(),
              name: currentUser.name,
              email: currentUser.email,
              avatar_url: currentUser.avatar_url,
              roles: ['student'], // Default role, will be updated from API
              locale: 'en',
              timezone: 'UTC',
              created_at: new Date(),
              updated_at: new Date(),
            }

            setState(prev => ({
              ...prev,
              isAuthenticated: true,
              user,
              token,
              isLoading: false,
            }))
            return
          }
        }

        // Try to refresh token if available
        const refreshedToken = await authManager.refreshToken()
        if (refreshedToken) {
          const currentUser = authManager.getCurrentUser()
          if (currentUser) {
            const user: User = {
              id: currentUser.id.toString(),
              name: currentUser.name,
              email: currentUser.email,
              avatar_url: currentUser.avatar_url,
              roles: ['student'],
              locale: 'en',
              timezone: 'UTC',
              created_at: new Date(),
              updated_at: new Date(),
            }

            setState(prev => ({
              ...prev,
              isAuthenticated: true,
              user,
              token: refreshedToken,
              isLoading: false,
            }))
            return
          }
        }

        // No valid authentication found
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
        }))
      } catch (error) {
        console.error('Auth initialization failed:', error)
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication initialization failed',
        }))
      }
    }

    initializeAuth()
  }, [authManager])

  /**
   * Start login flow
   */
  const login = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      await authManager.startAuthFlow()
    } catch (error) {
      console.error('Login failed:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }))
    }
  }, [authManager])

  /**
   * Handle OAuth2 callback
   */
  const handleCallback = useCallback(async (code: string, state: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      const token = await authManager.handleCallback(code, state)
      const currentUser = authManager.getCurrentUser()

      if (currentUser) {
        const user: User = {
          id: currentUser.id.toString(),
          name: currentUser.name,
          email: currentUser.email,
          avatar_url: currentUser.avatar_url,
          roles: ['student'],
          locale: 'en',
          timezone: 'UTC',
          created_at: new Date(),
          updated_at: new Date(),
        }

        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user,
          token,
          isLoading: false,
        }))
      } else {
        throw new Error('Failed to retrieve user information')
      }
    } catch (error) {
      console.error('Callback handling failed:', error)
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication callback failed',
      }))
    }
  }, [authManager])

  /**
   * Refresh authentication token
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const newToken = await authManager.refreshToken()
      if (newToken) {
        setState(prev => ({
          ...prev,
          token: newToken,
          error: null,
        }))
        return true
      }
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Token refresh failed',
      }))
      return false
    }
  }, [authManager])

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    authManager.logout()
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      error: null,
    })
  }, [authManager])

  /**
   * Clear authentication error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    handleCallback,
    clearError,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Hook to get authentication token for API calls
 */
export function useAuthToken(): string | null {
  const { token, isAuthenticated } = useAuth()
  return isAuthenticated ? token?.access_token || null : null
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(role: string): boolean {
  const { user } = useAuth()
  return user?.roles.includes(role as any) || false
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth(): AuthContextType {
  const auth = useAuth()
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      auth.login()
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.login])

  return auth
}

/**
 * Higher-order component to protect routes
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const auth = useRequireAuth()

    if (auth.isLoading) {
      return (
        <div className="auth-loading">
          <div className="auth-loading__spinner">Loading...</div>
          <p>Authenticating with Canvas...</p>
        </div>
      )
    }

    if (auth.error) {
      return (
        <div className="auth-error">
          <h2>Authentication Error</h2>
          <p>{auth.error}</p>
          <button onClick={auth.clearError}>Try Again</button>
        </div>
      )
    }

    if (!auth.isAuthenticated) {
      return (
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to access SchoolApex.</p>
          <button onClick={auth.login}>Log In with Canvas</button>
        </div>
      )
    }

    return <Component {...props} />
  }
}
