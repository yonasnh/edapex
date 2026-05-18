import { z } from 'zod'

/**
 * OAuth2 Configuration Schema
 */
export const OAuth2ConfigSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string().optional(), // Not used in PKCE flow
  redirectUri: z.string().url(),
  canvasBaseUrl: z.string().url(),
  scopes: z.array(z.string()).default([
    'url:GET|/api/v1/courses',
    'url:GET|/api/v1/users/:user_id/profile',
    'url:GET|/api/v1/courses/:course_id/assignments',
    'url:GET|/api/v1/courses/:course_id/discussion_topics',
    'url:GET|/api/v1/courses/:course_id/files',
    'url:GET|/api/v1/courses/:course_id/calendar_events',
    'url:GET|/api/v1/courses/:course_id/gradebook_history',
    'url:POST|/api/v1/courses/:course_id/assignments/:assignment_id/submissions',
    'url:PUT|/api/v1/courses/:course_id/assignments/:assignment_id/submissions/:user_id',
  ]),
})

export type OAuth2Config = z.infer<typeof OAuth2ConfigSchema>

/**
 * Environment-based OAuth2 configuration factory
 * Follows Canvas Modern UI implementation guidelines for environment management
 */
export const getOAuth2Config = (): OAuth2Config => {
  const baseUrl = import.meta.env.VITE_CANVAS_BASE_URL
  const clientId = import.meta.env.VITE_CANVAS_CLIENT_ID
  const redirectUri = import.meta.env.VITE_OAUTH2_REDIRECT_URI

  if (!baseUrl || !clientId || !redirectUri) {
    const missing = []
    if (!baseUrl) missing.push('VITE_CANVAS_BASE_URL')
    if (!clientId) missing.push('VITE_CANVAS_CLIENT_ID')
    if (!redirectUri) missing.push('VITE_OAUTH2_REDIRECT_URI')

    throw new Error(`Missing required OAuth2 environment variables: ${missing.join(', ')}`)
  }

  return {
    clientId,
    redirectUri,
    canvasBaseUrl: baseUrl,
    scopes: [
      // Core API access
      'url:GET|/api/v1/courses',
      'url:GET|/api/v1/courses/:course_id',
      'url:GET|/api/v1/users/self',
      'url:GET|/api/v1/users/:user_id/profile',

      // Course content
      'url:GET|/api/v1/courses/:course_id/assignments',
      'url:GET|/api/v1/courses/:course_id/students',
      'url:GET|/api/v1/courses/:course_id/enrollments',
      'url:GET|/api/v1/courses/:course_id/discussion_topics',
      'url:GET|/api/v1/courses/:course_id/files',
      'url:GET|/api/v1/calendar_events',

      // Analytics (if enabled)
      ...(import.meta.env.VITE_ENABLE_ANALYTICS === 'true' ? [
        'url:GET|/api/v1/courses/:course_id/analytics/assignments',
        'url:GET|/api/v1/courses/:course_id/analytics/student_summaries',
        'url:GET|/api/v1/courses/:course_id/analytics/activity',
      ] : []),

      // Gradebook (if enabled)
      ...(import.meta.env.VITE_ENABLE_GRADEBOOK === 'true' ? [
        'url:GET|/api/v1/courses/:course_id/gradebook_history',
        'url:GET|/api/v1/courses/:course_id/assignment_groups',
        'url:PUT|/api/v1/courses/:course_id/assignments/:assignment_id/submissions/:user_id',
      ] : []),
    ],
  }
}

/**
 * OAuth2 Token Schema
 */
export const OAuth2TokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string().default('Bearer'),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    avatar_url: z.string().url().optional(),
  }).optional(),
  created_at: z.number().default(() => Date.now()),
})

export type OAuth2Token = z.infer<typeof OAuth2TokenSchema>

/**
 * PKCE (Proof Key for Code Exchange) utilities for secure OAuth2 flow
 */
class PKCEUtils {
  /**
   * Generate a cryptographically random code verifier
   */
  static generateCodeVerifier(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return this.base64URLEncode(array)
  }

  /**
   * Generate code challenge from verifier using SHA256
   */
  static async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return this.base64URLEncode(new Uint8Array(digest))
  }

  /**
   * Base64 URL encode without padding
   */
  private static base64URLEncode(array: Uint8Array): string {
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }
}

/**
 * Create OAuth2 manager instance with environment-based configuration
 * Follows SchoolApex Modern UI implementation guidelines
 */
export const createOAuth2Manager = (config?: Partial<OAuth2Config>): CanvasOAuth2Manager => {
  try {
    const finalConfig = config ? { ...getOAuth2Config(), ...config } : getOAuth2Config()
    return new CanvasOAuth2Manager(finalConfig)
  } catch (error) {
    console.error('Failed to create OAuth2 manager:', error)
    throw new Error('OAuth2 configuration error. Please check environment variables.')
  }
}

/**
 * OAuth2 Authentication Manager for Canvas LMS
 *
 * Implements secure OAuth2 flow with PKCE for Canvas API authentication.
 * Handles token storage, refresh, and automatic renewal with security best practices.
 */
export class CanvasOAuth2Manager {
  private config: OAuth2Config
  private tokenStorageKey = 'schoolapex_canvas_token'
  private verifierStorageKey = 'schoolapex_pkce_verifier'
  private refreshPromise: Promise<OAuth2Token | null> | null = null
  private isRefreshing = false

  constructor(config: OAuth2Config) {
    this.config = OAuth2ConfigSchema.parse(config)

    // Validate security requirements
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' &&
        window.location.hostname !== 'localhost') {
      console.warn('OAuth2: HTTPS is required for production use')
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getStoredToken()
    if (!token) return false

    // Check if token is expired (with 5 minute buffer)
    if (token.expires_in) {
      const expiresAt = token.created_at + (token.expires_in * 1000)
      const now = Date.now()
      const buffer = 5 * 60 * 1000 // 5 minutes
      
      if (now >= (expiresAt - buffer)) {
        return false
      }
    }

    return true
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    if (!this.isAuthenticated()) return null
    const token = this.getStoredToken()
    return token?.access_token || null
  }

  /**
   * Get current user info from token
   */
  getCurrentUser(): OAuth2Token['user'] | null {
    if (!this.isAuthenticated()) return null
    const token = this.getStoredToken()
    return token?.user || null
  }

  /**
   * Start OAuth2 authorization flow
   */
  async startAuthFlow(): Promise<void> {
    try {
      // Generate PKCE parameters
      const codeVerifier = PKCEUtils.generateCodeVerifier()
      const codeChallenge = await PKCEUtils.generateCodeChallenge(codeVerifier)

      // Store code verifier for later use
      sessionStorage.setItem(this.verifierStorageKey, codeVerifier)

      // Build authorization URL
      const authUrl = new URL('/login/oauth2/auth', this.config.canvasBaseUrl)
      authUrl.searchParams.set('client_id', this.config.clientId)
      authUrl.searchParams.set('redirect_uri', this.config.redirectUri)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', this.config.scopes.join(' '))
      authUrl.searchParams.set('state', this.generateState())
      authUrl.searchParams.set('code_challenge', codeChallenge)
      authUrl.searchParams.set('code_challenge_method', 'S256')

      // Redirect to Canvas authorization
      window.location.href = authUrl.toString()
    } catch (error) {
      console.error('Failed to start OAuth2 flow:', error)
      throw new Error('Failed to initialize authentication')
    }
  }

  /**
   * Handle OAuth2 callback and exchange code for token
   */
  async handleCallback(code: string, state: string): Promise<OAuth2Token> {
    try {
      // Verify state parameter
      const storedState = sessionStorage.getItem('oauth2_state')
      if (state !== storedState) {
        throw new Error('Invalid state parameter')
      }

      // Get stored code verifier
      const codeVerifier = sessionStorage.getItem(this.verifierStorageKey)
      if (!codeVerifier) {
        throw new Error('Missing code verifier')
      }

      // Exchange code for token
      const tokenUrl = new URL('/login/oauth2/token', this.config.canvasBaseUrl)
      const response = await fetch(tokenUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.config.clientId,
          code,
          redirect_uri: this.config.redirectUri,
          code_verifier: codeVerifier,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Token exchange failed: ${errorData.error_description || response.statusText}`)
      }

      const tokenData = await response.json()
      const token = OAuth2TokenSchema.parse(tokenData)

      // Fetch user profile
      if (token.access_token) {
        try {
          const userProfile = await this.fetchUserProfile(token.access_token)
          token.user = userProfile
        } catch (error) {
          console.warn('Failed to fetch user profile:', error)
        }
      }

      // Store token securely
      this.storeToken(token)

      // Clean up session storage
      sessionStorage.removeItem(this.verifierStorageKey)
      sessionStorage.removeItem('oauth2_state')

      return token
    } catch (error) {
      console.error('OAuth2 callback handling failed:', error)
      throw error
    }
  }

  /**
   * Refresh access token using refresh token with queue to prevent multiple refresh attempts
   */
  async refreshToken(): Promise<OAuth2Token | null> {
    // If already refreshing, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    const currentToken = this.getStoredToken()
    if (!currentToken?.refresh_token) {
      return null
    }

    // Set refreshing state and create promise
    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh(currentToken)

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      // Reset refresh state
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performTokenRefresh(currentToken: OAuth2Token): Promise<OAuth2Token | null> {
    try {
      const tokenUrl = new URL('/login/oauth2/token', this.config.canvasBaseUrl)
      const response = await fetch(tokenUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.config.clientId,
          refresh_token: currentToken.refresh_token || '',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Token refresh failed: ${errorData.error_description || response.statusText}`)
      }

      const tokenData = await response.json()
      const newToken = OAuth2TokenSchema.parse({
        ...tokenData,
        user: currentToken.user, // Preserve user info
        created_at: Date.now(), // Update creation time
      })

      this.storeTokenSecurely(newToken)
      return newToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.secureLogout() // Clear invalid token securely
      return null
    }
  }

  /**
   * Logout and clear stored tokens securely
   */
  logout(): void {
    this.secureLogout()
  }

  /**
   * Secure logout with proper cleanup
   */
  private secureLogout(): void {
    try {
      // Clear all authentication-related storage
      localStorage.removeItem(this.tokenStorageKey)
      sessionStorage.removeItem(this.verifierStorageKey)
      sessionStorage.removeItem('oauth2_state')

      // Clear any cached data that might contain sensitive information
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('schoolapex') || name.includes('canvas')) {
              caches.delete(name)
            }
          })
        })
      }

      // Reset refresh state
      this.isRefreshing = false
      this.refreshPromise = null

    } catch (error) {
      console.error('Error during secure logout:', error)
    }
  }

  /**
   * Fetch user profile from Canvas API
   */
  private async fetchUserProfile(accessToken: string): Promise<OAuth2Token['user']> {
    const profileUrl = new URL('/api/v1/users/self/profile', this.config.canvasBaseUrl)
    const response = await fetch(profileUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Profile fetch failed: ${response.statusText}`)
    }

    const profile = await response.json()
    return {
      id: profile.id,
      name: profile.name,
      email: profile.primary_email || profile.email,
      avatar_url: profile.avatar_url,
    }
  }

  /**
   * Generate secure random state parameter
   */
  private generateState(): string {
    const state = PKCEUtils.generateCodeVerifier()
    sessionStorage.setItem('oauth2_state', state)
    return state
  }

  /**
   * Store token securely with additional security measures
   */
  private storeToken(token: OAuth2Token): void {
    this.storeTokenSecurely(token)
  }

  /**
   * Enhanced secure token storage
   */
  private storeTokenSecurely(token: OAuth2Token): void {
    try {
      // Sanitize token before storage (remove sensitive debug info)
      const sanitizedToken = {
        ...token,
        // Remove any debug or sensitive metadata
        debug: undefined,
        raw_response: undefined,
      }

      // Add integrity check
      const tokenWithIntegrity = {
        ...sanitizedToken,
        integrity: this.generateTokenIntegrity(sanitizedToken),
        stored_at: Date.now(),
      }

      localStorage.setItem(this.tokenStorageKey, JSON.stringify(tokenWithIntegrity))

      // Log token storage (without sensitive data)
      if (process.env.NODE_ENV === 'development') {
        console.log('Token stored successfully', {
          user_id: token.user?.id,
          expires_in: token.expires_in,
          stored_at: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error('Failed to store token:', error)
      throw new Error('Failed to store authentication token')
    }
  }

  /**
   * Generate token integrity hash for validation
   */
  private generateTokenIntegrity(token: OAuth2Token): string {
    // Simple integrity check - in production, use proper HMAC
    const tokenString = JSON.stringify({
      access_token: token.access_token?.substring(0, 10), // Only first 10 chars
      user_id: token.user?.id,
      created_at: token.created_at,
    })

    // Simple hash - replace with proper HMAC in production
    let hash = 0
    for (let i = 0; i < tokenString.length; i++) {
      const char = tokenString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  /**
   * Retrieve stored token from localStorage
   */
  getStoredToken(): OAuth2Token | null {
    try {
      const stored = localStorage.getItem(this.tokenStorageKey)
      if (!stored) return null

      const parsed = JSON.parse(stored)
      return OAuth2TokenSchema.parse(parsed)
    } catch (error) {
      console.error('Failed to parse stored token:', error)
      localStorage.removeItem(this.tokenStorageKey)
      return null
    }
  }
}

/**
 * Default OAuth2 configuration for development
 */
export const defaultOAuth2Config: Partial<OAuth2Config> = {
  redirectUri: `${window.location.origin}/auth/callback`,
  scopes: [
    'url:GET|/api/v1/courses',
    'url:GET|/api/v1/users/:user_id/profile',
    'url:GET|/api/v1/courses/:course_id/assignments',
    'url:GET|/api/v1/courses/:course_id/discussion_topics',
    'url:GET|/api/v1/courses/:course_id/files',
    'url:GET|/api/v1/courses/:course_id/calendar_events',
  ],
}


