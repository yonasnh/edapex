import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CanvasOAuth2Manager, OAuth2Config } from '../oauth2'

describe('CanvasOAuth2Manager', () => {
  let oauth2Manager: CanvasOAuth2Manager
  let mockConfig: OAuth2Config

  beforeEach(() => {
    mockConfig = {
      clientId: 'test-client-id',
      redirectUri: 'http://localhost:3000/auth/callback',
      canvasBaseUrl: 'https://canvas.example.com',
      scopes: ['url:GET|/api/v1/courses'],
    }
    oauth2Manager = new CanvasOAuth2Manager(mockConfig)
  })

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      expect(oauth2Manager).toBeInstanceOf(CanvasOAuth2Manager)
    })

    it('should validate config with Zod schema', () => {
      expect(() => {
        new CanvasOAuth2Manager({
          ...mockConfig,
          redirectUri: 'invalid-url',
        })
      }).toThrow()
    })
  })

  describe('isAuthenticated', () => {
    it('should return false when no token is stored', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null)
      expect(oauth2Manager.isAuthenticated()).toBe(false)
    })

    it('should return true when valid token is stored', () => {
      const validToken = {
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_in: 3600,
        created_at: Date.now(),
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
      }
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(validToken))
      expect(oauth2Manager.isAuthenticated()).toBe(true)
    })

    it('should return false when token is expired', () => {
      const expiredToken = {
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_in: 3600,
        created_at: Date.now() - 7200000, // 2 hours ago
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
      }
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(expiredToken))
      expect(oauth2Manager.isAuthenticated()).toBe(false)
    })
  })

  describe('getAccessToken', () => {
    it('should return null when not authenticated', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null)
      expect(oauth2Manager.getAccessToken()).toBeNull()
    })

    it('should return access token when authenticated', () => {
      const validToken = {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        created_at: Date.now(),
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
      }
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(validToken))
      expect(oauth2Manager.getAccessToken()).toBe('test-access-token')
    })
  })

  describe('startAuthFlow', () => {
    it('should redirect to Canvas authorization URL', async () => {
      const originalLocation = window.location
      delete (window as any).location
      window.location = { ...originalLocation, href: '' }

      await oauth2Manager.startAuthFlow()

      expect(window.location.href).toContain('https://canvas.example.com/login/oauth2/auth')
      expect(window.location.href).toContain('client_id=test-client-id')
      expect(window.location.href).toContain('response_type=code')
      expect(window.location.href).toContain('code_challenge_method=S256')

      window.location = originalLocation
    })

    it('should store PKCE code verifier in session storage', async () => {
      const originalLocation = window.location
      delete (window as any).location
      window.location = { ...originalLocation, href: '' }

      await oauth2Manager.startAuthFlow()

      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        'schoolapex_pkce_verifier',
        expect.any(String)
      )

      window.location = originalLocation
    })
  })

  describe('handleCallback', () => {
    beforeEach(() => {
      vi.mocked(sessionStorage.getItem).mockImplementation((key) => {
        if (key === 'oauth2_state') return 'test-state'
        if (key === 'schoolapex_pkce_verifier') return 'test-verifier'
        return null
      })
    })

    it('should exchange code for token successfully', async () => {
      const mockTokenResponse = {
        access_token: 'new-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'refresh-token',
      }

      const mockUserResponse = {
        id: 1,
        name: 'Test User',
        primary_email: 'test@example.com',
        avatar_url: 'https://example.com/avatar.jpg',
      }

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTokenResponse),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUserResponse),
        } as Response)

      const result = await oauth2Manager.handleCallback('test-code', 'test-state')

      expect(result).toMatchObject({
        access_token: 'new-access-token',
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
      })
      expect(localStorage.setItem).toHaveBeenCalled()
    })

    it('should throw error for invalid state', async () => {
      await expect(
        oauth2Manager.handleCallback('test-code', 'invalid-state')
      ).rejects.toThrow('Invalid state parameter')
    })

    it('should throw error when code verifier is missing', async () => {
      vi.mocked(sessionStorage.getItem).mockImplementation((key) => {
        if (key === 'oauth2_state') return 'test-state'
        return null // No verifier
      })

      await expect(
        oauth2Manager.handleCallback('test-code', 'test-state')
      ).rejects.toThrow('Missing code verifier')
    })
  })

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const currentToken = {
        access_token: 'old-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        created_at: Date.now() - 3000000, // Old token
        user: { id: 1, name: 'Test User', email: 'test@example.com' },
      }

      const newTokenResponse = {
        access_token: 'new-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }

      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(currentToken))
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(newTokenResponse),
      } as Response)

      const result = await oauth2Manager.refreshToken()

      expect(result).toMatchObject({
        access_token: 'new-access-token',
        user: currentToken.user,
      })
    })

    it('should return null when no refresh token available', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null)
      const result = await oauth2Manager.refreshToken()
      expect(result).toBeNull()
    })

    it('should handle refresh failure and logout', async () => {
      const currentToken = {
        access_token: 'old-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        created_at: Date.now(),
        user: { id: 1, name: 'Test User', email: 'test@example.com' },
      }

      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(currentToken))
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: 'invalid_grant' }),
      } as Response)

      const result = await oauth2Manager.refreshToken()

      expect(result).toBeNull()
      expect(localStorage.removeItem).toHaveBeenCalledWith('schoolapex_canvas_token')
    })
  })

  describe('logout', () => {
    it('should clear all stored tokens and session data', () => {
      oauth2Manager.logout()

      expect(localStorage.removeItem).toHaveBeenCalledWith('schoolapex_canvas_token')
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('schoolapex_pkce_verifier')
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('oauth2_state')
    })
  })
})
