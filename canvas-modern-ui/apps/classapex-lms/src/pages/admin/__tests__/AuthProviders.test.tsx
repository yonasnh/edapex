import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import AuthProvidersPage from '../AuthProviders'

vi.mock('../../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
}))

vi.mock('../../../hooks/useNotification', () => ({
  useNotification: () => ({
    showToast: vi.fn(),
    showConfirm: vi.fn().mockResolvedValue(true),
  }),
}))

import { useCanvasQuery, canvasFetch } from '../../../hooks/useCanvasQuery'

const mockedUseCanvasQuery = vi.mocked(useCanvasQuery)
const mockedCanvasFetch = vi.mocked(canvasFetch)

function renderPage(initialEntries = ['/admin/auth-providers']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/admin/auth-providers" element={<AuthProvidersPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AuthProvidersPage', () => {
  beforeEach(() => {
    mockedUseCanvasQuery.mockReset()
    mockedCanvasFetch.mockReset()
  })

  it('renders loading state', () => {
    mockedUseCanvasQuery.mockReturnValue({ data: undefined, isLoading: true } as any)
    renderPage()
    expect(screen.getByText('Authentication Providers')).toBeInTheDocument()
    expect(document.querySelectorAll('.cx-skeleton').length).toBeGreaterThan(0)
  })

  it('renders empty state with configure button', () => {
    mockedUseCanvasQuery.mockReturnValue({ data: [], isLoading: false } as any)
    renderPage()
    expect(screen.getByText('No authentication providers configured.')).toBeInTheDocument()
    expect(screen.getByTestId('configure-auth-btn')).toBeInTheDocument()
  })

  it('renders providers sorted by position', () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: [
        { id: 2, auth_type: 'google', position: 2 },
        { id: 1, auth_type: 'canvas', position: 1 },
        { id: 3, auth_type: 'saml', position: 3 },
      ],
      isLoading: false,
    } as any)
    renderPage()

    expect(screen.getByTestId('provider-1')).toHaveTextContent('Canvas')
    expect(screen.getByTestId('provider-2')).toHaveTextContent('Google OAuth')
    expect(screen.getByTestId('provider-3')).toHaveTextContent('SAML 2.0')

    // Verify DOM order by checking all provider items
    const items = screen.getAllByTestId(/^provider-/)
    expect(items.map(el => el.getAttribute('data-testid'))).toEqual([
      'provider-1', 'provider-2', 'provider-3'
    ])
  })

  it('shows default badge for canvas provider', () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: [{ id: 1, auth_type: 'canvas', position: 1 }],
      isLoading: false,
    } as any)
    renderPage()
    expect(screen.getByText('Default')).toBeInTheDocument()
  })

  it('deletes non-canvas provider after confirmation', async () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: [{ id: 2, auth_type: 'google', position: 2 }],
      isLoading: false,
    } as any)
    mockedCanvasFetch.mockResolvedValue({})
    renderPage()

    fireEvent.click(screen.getByTestId('delete-provider-2'))
    await waitFor(() => {
      expect(mockedCanvasFetch).toHaveBeenCalledWith(
        '/api/v1/accounts/1/authentication_providers/2',
        { method: 'DELETE' }
      )
    })
  })

  it('does not show delete button for canvas provider', () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: [{ id: 1, auth_type: 'canvas', position: 1 }],
      isLoading: false,
    } as any)
    renderPage()
    expect(screen.queryByTestId('delete-provider-1')).not.toBeInTheDocument()
  })

  it('opens native form when Add Provider is clicked', () => {
    mockedUseCanvasQuery.mockReturnValue({ data: [], isLoading: false } as any)
    renderPage()
    fireEvent.click(screen.getByTestId('add-provider-btn'))
    expect(screen.getByTestId('auth-provider-form-modal')).toBeInTheDocument()
    expect(screen.getByText('Add Authentication Provider')).toBeInTheDocument()
  })

  it('opens native form when Configure Authentication is clicked in empty state', () => {
    mockedUseCanvasQuery.mockReturnValue({ data: [], isLoading: false } as any)
    renderPage()
    fireEvent.click(screen.getByTestId('configure-auth-btn'))
    expect(screen.getByTestId('auth-provider-form-modal')).toBeInTheDocument()
  })

  it('opens iframe when Advanced Settings is clicked', () => {
    mockedUseCanvasQuery.mockReturnValue({ data: [], isLoading: false } as any)
    renderPage()
    fireEvent.click(screen.getByText('Advanced Settings'))
    expect(screen.getByTitle('Canvas Authentication Settings')).toBeInTheDocument()
  })

  it('opens edit form with provider data pre-filled', () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: [{ id: 2, auth_type: 'saml', position: 1, idp_entity_id: 'test-idp', log_in_url: 'https://example.com/login' }],
      isLoading: false,
    } as any)
    renderPage()

    fireEvent.click(screen.getByTestId('edit-provider-2'))
    expect(screen.getByTestId('auth-provider-form-modal')).toBeInTheDocument()
    expect(screen.getByText('Edit Authentication Provider')).toBeInTheDocument()
  })

  it('creates a SAML provider via native form', async () => {
    mockedUseCanvasQuery.mockReturnValue({ data: [], isLoading: false } as any)
    mockedCanvasFetch.mockResolvedValue({})
    renderPage()

    fireEvent.click(screen.getByTestId('add-provider-btn'))

    fireEvent.change(screen.getByTestId('field-idp_entity_id'), { target: { value: 'https://idp.example.com' } })
    fireEvent.change(screen.getByTestId('field-log_in_url'), { target: { value: 'https://idp.example.com/sso' } })
    fireEvent.change(screen.getByTestId('field-certificate_fingerprint'), { target: { value: 'AA:BB:CC:DD:EE' } })

    fireEvent.click(screen.getByTestId('save-provider'))

    await waitFor(() => {
      expect(mockedCanvasFetch).toHaveBeenCalledWith(
        '/api/v1/accounts/1/authentication_providers',
        {
          method: 'POST',
          body: {
            authentication_provider: {
              auth_type: 'saml',
              idp_entity_id: 'https://idp.example.com',
              log_in_url: 'https://idp.example.com/sso',
              certificate_fingerprint: 'AA:BB:CC:DD:EE',
              identifier_format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
            },
          },
        }
      )
    })
  })

  it('creates an OpenID Connect provider via native form', async () => {
    mockedUseCanvasQuery.mockReturnValue({ data: [], isLoading: false } as any)
    mockedCanvasFetch.mockResolvedValue({})
    renderPage()

    fireEvent.click(screen.getByTestId('add-provider-btn'))
    fireEvent.change(screen.getByTestId('auth-type-select'), { target: { value: 'openid_connect' } })

    fireEvent.change(screen.getByTestId('field-client_id'), { target: { value: 'my-client' } })
    fireEvent.change(screen.getByTestId('field-client_secret'), { target: { value: 'my-secret' } })
    fireEvent.change(screen.getByTestId('field-authorize_url'), { target: { value: 'https://oidc.example.com/auth' } })
    fireEvent.change(screen.getByTestId('field-token_url'), { target: { value: 'https://oidc.example.com/token' } })

    fireEvent.click(screen.getByTestId('save-provider'))

    await waitFor(() => {
      expect(mockedCanvasFetch).toHaveBeenCalledWith(
        '/api/v1/accounts/1/authentication_providers',
        {
          method: 'POST',
          body: {
            authentication_provider: {
              auth_type: 'openid_connect',
              client_id: 'my-client',
              client_secret: 'my-secret',
              authorize_url: 'https://oidc.example.com/auth',
              token_url: 'https://oidc.example.com/token',
            },
          },
        }
      )
    })
  })

  it('creates an LDAP provider via native form', async () => {
    mockedUseCanvasQuery.mockReturnValue({ data: [], isLoading: false } as any)
    mockedCanvasFetch.mockResolvedValue({})
    renderPage()

    fireEvent.click(screen.getByTestId('add-provider-btn'))
    fireEvent.change(screen.getByTestId('auth-type-select'), { target: { value: 'ldap' } })

    fireEvent.change(screen.getByTestId('field-auth_host'), { target: { value: 'ldap.example.com' } })
    fireEvent.change(screen.getByTestId('field-auth_port'), { target: { value: '636' } })
    fireEvent.change(screen.getByTestId('field-auth_base'), { target: { value: 'dc=example,dc=com' } })
    fireEvent.change(screen.getByTestId('field-auth_filter'), { target: { value: '(uid={{uid}})' } })

    fireEvent.click(screen.getByTestId('save-provider'))

    await waitFor(() => {
      expect(mockedCanvasFetch).toHaveBeenCalledWith(
        '/api/v1/accounts/1/authentication_providers',
        {
          method: 'POST',
          body: {
            authentication_provider: {
              auth_type: 'ldap',
              auth_host: 'ldap.example.com',
              auth_port: 636,
              auth_base: 'dc=example,dc=com',
              auth_filter: '(uid={{uid}})',
            },
          },
        }
      )
    })
  })

  it('updates an existing provider via native form', async () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: [{ id: 5, auth_type: 'google', position: 2, client_id: 'old-client' }],
      isLoading: false,
    } as any)
    mockedCanvasFetch.mockResolvedValue({})
    renderPage()

    fireEvent.click(screen.getByTestId('edit-provider-5'))

    fireEvent.change(screen.getByTestId('field-client_id'), { target: { value: 'new-client' } })
    fireEvent.change(screen.getByTestId('field-client_secret'), { target: { value: 'new-secret' } })

    fireEvent.click(screen.getByTestId('save-provider'))

    await waitFor(() => {
      expect(mockedCanvasFetch).toHaveBeenCalledWith(
        '/api/v1/accounts/1/authentication_providers/5',
        {
          method: 'PUT',
          body: {
            authentication_provider: {
              auth_type: 'google',
              client_id: 'new-client',
              client_secret: 'new-secret',
            },
          },
        }
      )
    })
  })

  it('closes native form modal on cancel', () => {
    mockedUseCanvasQuery.mockReturnValue({ data: [], isLoading: false } as any)
    renderPage()

    fireEvent.click(screen.getByTestId('add-provider-btn'))
    expect(screen.getByTestId('auth-provider-form-modal')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('close-form-modal'))
    expect(screen.queryByTestId('auth-provider-form-modal')).not.toBeInTheDocument()
  })
})
