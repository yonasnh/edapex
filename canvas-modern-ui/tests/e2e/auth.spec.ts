import { test, expect } from '@playwright/test'

/**
 * Authentication E2E Tests
 * 
 * Tests the complete OAuth2 authentication flow with Canvas LMS,
 * including login, logout, token refresh, and error handling.
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/')
  })

  test('should display login button when not authenticated', async ({ page }) => {
    // Check if login button is visible
    const loginButton = page.getByRole('button', { name: /login|sign in/i })
    await expect(loginButton).toBeVisible()
    
    // Check that protected content is not visible
    const protectedContent = page.getByTestId('authenticated-content')
    await expect(protectedContent).not.toBeVisible()
  })

  test('should initiate OAuth2 flow when login button is clicked', async ({ page }) => {
    // Click login button
    const loginButton = page.getByRole('button', { name: /login|sign in/i })
    await loginButton.click()
    
    // Should redirect to Canvas OAuth2 authorization page
    await page.waitForURL(/oauth2\/auth/)
    
    // Check for Canvas authorization page elements
    await expect(page.getByText(/authorize/i)).toBeVisible()
    await expect(page.getByText(/schoolapex/i)).toBeVisible()
  })

  test('should handle OAuth2 callback successfully', async ({ page }) => {
    // Mock successful OAuth2 callback
    const mockCode = 'test-authorization-code'
    const mockState = 'test-state-parameter'
    
    // Navigate to callback URL with mock parameters
    await page.goto(`/auth/callback?code=${mockCode}&state=${mockState}`)
    
    // Should show loading state
    await expect(page.getByText(/authenticating/i)).toBeVisible()
    await expect(page.getByTestId('loading-spinner')).toBeVisible()
    
    // Should show authentication steps
    await expect(page.getByText(/canvas authorization received/i)).toBeVisible()
    await expect(page.getByText(/exchanging authorization code/i)).toBeVisible()
  })

  test('should handle OAuth2 errors gracefully', async ({ page }) => {
    // Navigate to callback URL with error parameters
    await page.goto('/auth/callback?error=access_denied&error_description=User%20denied%20access')
    
    // Should show error state
    await expect(page.getByText(/authentication failed/i)).toBeVisible()
    await expect(page.getByText(/user denied access/i)).toBeVisible()
    
    // Should provide retry option
    const retryButton = page.getByRole('button', { name: /try again/i })
    await expect(retryButton).toBeVisible()
    
    // Should provide return to app option
    const returnButton = page.getByRole('button', { name: /return to schoolapex/i })
    await expect(returnButton).toBeVisible()
  })

  test('should display user profile when authenticated', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      const mockToken = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
        created_at: Date.now(),
        integrity: 'mock-integrity-hash',
      }
      localStorage.setItem('schoolapex_canvas_token', JSON.stringify(mockToken))
    })
    
    await page.reload()
    
    // Should show authenticated content
    await expect(page.getByTestId('authenticated-content')).toBeVisible()
    await expect(page.getByText('Test User')).toBeVisible()
    
    // Should show logout option
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i })
    await expect(logoutButton).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      const mockToken = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
        created_at: Date.now(),
        integrity: 'mock-integrity-hash',
      }
      localStorage.setItem('schoolapex_canvas_token', JSON.stringify(mockToken))
    })
    
    await page.reload()
    
    // Click logout button
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i })
    await logoutButton.click()
    
    // Should clear authentication state
    await expect(page.getByTestId('authenticated-content')).not.toBeVisible()
    
    // Should show login button again
    const loginButton = page.getByRole('button', { name: /login|sign in/i })
    await expect(loginButton).toBeVisible()
    
    // Should clear localStorage
    const tokenInStorage = await page.evaluate(() => {
      return localStorage.getItem('schoolapex_canvas_token')
    })
    expect(tokenInStorage).toBeNull()
  })

  test('should handle expired tokens', async ({ page }) => {
    // Mock expired token
    await page.addInitScript(() => {
      const expiredToken = {
        access_token: 'expired-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
        created_at: Date.now() - (3600 * 1000 + 1), // Expired 1ms ago
        integrity: 'mock-integrity-hash',
      }
      localStorage.setItem('schoolapex_canvas_token', JSON.stringify(expiredToken))
    })
    
    await page.reload()
    
    // Should not show authenticated content
    await expect(page.getByTestId('authenticated-content')).not.toBeVisible()
    
    // Should show login button
    const loginButton = page.getByRole('button', { name: /login|sign in/i })
    await expect(loginButton).toBeVisible()
  })

  test('should validate token integrity', async ({ page }) => {
    // Mock token with invalid integrity
    await page.addInitScript(() => {
      const invalidToken = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
        created_at: Date.now(),
        integrity: 'invalid-integrity-hash',
      }
      localStorage.setItem('schoolapex_canvas_token', JSON.stringify(invalidToken))
    })
    
    await page.reload()
    
    // Should handle invalid token gracefully
    // Implementation depends on how integrity validation is handled
    // This test ensures the app doesn't crash with invalid tokens
    await expect(page.locator('body')).toBeVisible()
  })

  test('should maintain authentication across page refreshes', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      const mockToken = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
        created_at: Date.now(),
        integrity: 'mock-integrity-hash',
      }
      localStorage.setItem('schoolapex_canvas_token', JSON.stringify(mockToken))
    })
    
    await page.reload()
    
    // Should show authenticated content
    await expect(page.getByTestId('authenticated-content')).toBeVisible()
    
    // Refresh page
    await page.reload()
    
    // Should still show authenticated content
    await expect(page.getByTestId('authenticated-content')).toBeVisible()
    await expect(page.getByText('Test User')).toBeVisible()
  })

  test('should handle network errors during authentication', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/v1/users/self/profile', route => {
      route.abort('failed')
    })
    
    // Mock callback with valid parameters
    await page.goto('/auth/callback?code=test-code&state=test-state')
    
    // Should show error state
    await expect(page.getByText(/authentication failed/i)).toBeVisible()
    
    // Should provide retry option
    const retryButton = page.getByRole('button', { name: /try again/i })
    await expect(retryButton).toBeVisible()
  })
})

test.describe('Authentication Security', () => {
  test('should use HTTPS in production', async ({ page }) => {
    // Skip if not in production environment
    test.skip(process.env.NODE_ENV !== 'production', 'Only applicable in production')
    
    await page.goto('/')
    
    // Should be served over HTTPS
    expect(page.url()).toMatch(/^https:/)
  })

  test('should not expose sensitive data in console', async ({ page }) => {
    const consoleLogs: string[] = []
    
    page.on('console', msg => {
      consoleLogs.push(msg.text())
    })
    
    // Mock authentication flow
    await page.addInitScript(() => {
      const mockToken = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
        created_at: Date.now(),
        integrity: 'mock-integrity-hash',
      }
      localStorage.setItem('schoolapex_canvas_token', JSON.stringify(mockToken))
    })
    
    await page.reload()
    
    // Check that sensitive data is not logged
    const sensitivePatterns = [
      /access_token/i,
      /bearer\s+[a-zA-Z0-9]/i,
      /password/i,
      /secret/i,
    ]
    
    const exposedData = consoleLogs.filter(log => 
      sensitivePatterns.some(pattern => pattern.test(log))
    )
    
    expect(exposedData).toHaveLength(0)
  })

  test('should clear sensitive data on logout', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      const mockToken = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
        created_at: Date.now(),
        integrity: 'mock-integrity-hash',
      }
      localStorage.setItem('schoolapex_canvas_token', JSON.stringify(mockToken))
      sessionStorage.setItem('oauth2_state', 'test-state')
      sessionStorage.setItem('schoolapex_pkce_verifier', 'test-verifier')
    })
    
    await page.reload()
    
    // Logout
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i })
    await logoutButton.click()
    
    // Check that all sensitive data is cleared
    const storageData = await page.evaluate(() => {
      return {
        localStorage: localStorage.getItem('schoolapex_canvas_token'),
        sessionStorage: {
          state: sessionStorage.getItem('oauth2_state'),
          verifier: sessionStorage.getItem('schoolapex_pkce_verifier'),
        },
      }
    })
    
    expect(storageData.localStorage).toBeNull()
    expect(storageData.sessionStorage.state).toBeNull()
    expect(storageData.sessionStorage.verifier).toBeNull()
  })
})
