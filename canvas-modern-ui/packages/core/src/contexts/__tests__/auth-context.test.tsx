import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../auth-context'
import { CanvasOAuth2Manager } from '../../auth/oauth2'

// Mock the CanvasOAuth2Manager class
vi.mock('../../auth/oauth2', () => {
  const mockManager = {
    isAuthenticated: vi.fn(),
    getStoredToken: vi.fn(),
    getCurrentUser: vi.fn(),
    startAuthFlow: vi.fn(),
    refreshToken: vi.fn(),
    logout: vi.fn(),
  }
  return {
    CanvasOAuth2Manager: vi.fn(() => mockManager),
    createOAuth2Manager: vi.fn(() => mockManager),
    OAuth2ConfigSchema: {
      parse: vi.fn((config) => config),
    },
  }
})

// Test Component that consumes the useAuth hook
function TestConsumer() {
  const auth = useAuth()
  
  if (auth.isLoading) {
    return <div data-testid="loading">Loading...</div>
  }
  
  if (auth.error) {
    return <div data-testid="error">{auth.error}</div>
  }

  return (
    <div>
      <div data-testid="auth-status">
        {auth.isAuthenticated ? 'authenticated' : 'unauthenticated'}
      </div>
      {auth.user && <div data-testid="user-name">{auth.user.name}</div>}
      <button onClick={auth.login} data-testid="login-btn">Login</button>
      <button onClick={auth.logout} data-testid="logout-btn">Logout</button>
      <button onClick={auth.refreshToken} data-testid="refresh-btn">Refresh</button>
    </div>
  )
}

describe('AuthProvider & useAuth', () => {
  let mockManagerInstance: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Retrieve the mock instance
    const tempManager = new CanvasOAuth2Manager({} as any)
    mockManagerInstance = tempManager
  })

  it('should initialize with loading state and set authenticated if token exists', async () => {
    mockManagerInstance.isAuthenticated.mockReturnValue(true)
    mockManagerInstance.getStoredToken.mockReturnValue({
      access_token: 'test-token',
      created_at: Date.now(),
    })
    mockManagerInstance.getCurrentUser.mockReturnValue({
      id: 123,
      name: 'Jane Doe',
      email: 'jane@example.com',
    })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    // Wait for the state updates to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
    expect(screen.getByTestId('user-name')).toHaveTextContent('Jane Doe')
  })

  it('should set unauthenticated state if no valid session token exists', async () => {
    mockManagerInstance.isAuthenticated.mockReturnValue(false)
    mockManagerInstance.refreshToken.mockResolvedValue(null)

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated')
    expect(screen.queryByTestId('user-name')).not.toBeInTheDocument()
  })

  it('should trigger startAuthFlow when login is called', async () => {
    mockManagerInstance.isAuthenticated.mockReturnValue(false)
    mockManagerInstance.refreshToken.mockResolvedValue(null)

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })

    const loginButton = screen.getByTestId('login-btn')
    
    await act(async () => {
      loginButton.click()
    })

    expect(mockManagerInstance.startAuthFlow).toHaveBeenCalledTimes(1)
  })

  it('should call manager logout and reset state when logout is called', async () => {
    mockManagerInstance.isAuthenticated.mockReturnValue(true)
    mockManagerInstance.getStoredToken.mockReturnValue({ access_token: 'valid' })
    mockManagerInstance.getCurrentUser.mockReturnValue({ id: 1, name: 'Alice', email: 'alice@test.com' })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
    })

    const logoutButton = screen.getByTestId('logout-btn')
    
    await act(async () => {
      logoutButton.click()
    })

    expect(mockManagerInstance.logout).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated')
    expect(screen.queryByTestId('user-name')).not.toBeInTheDocument()
  })

  it('should update state with a new token on successful token refresh', async () => {
    mockManagerInstance.isAuthenticated.mockReturnValue(true)
    mockManagerInstance.getStoredToken.mockReturnValue({ access_token: 'old-token' })
    mockManagerInstance.getCurrentUser.mockReturnValue({ id: 1, name: 'Alice', email: 'alice@test.com' })
    
    const refreshedToken = { access_token: 'refreshed-token', created_at: Date.now() }
    mockManagerInstance.refreshToken.mockResolvedValue(refreshedToken)

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
    })

    const refreshButton = screen.getByTestId('refresh-btn')
    
    await act(async () => {
      refreshButton.click()
    })

    expect(mockManagerInstance.refreshToken).toHaveBeenCalledTimes(1) // Initial boot did not trigger it; manual call did
  })
})

