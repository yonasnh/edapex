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
    expect(screen.getByText('Configure Authentication')).toBeInTheDocument()
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

  it('opens iframe when Add Provider is clicked', () => {
    mockedUseCanvasQuery.mockReturnValue({ data: [], isLoading: false } as any)
    renderPage()
    fireEvent.click(screen.getByText('+ Add Provider'))
    expect(screen.getByTitle('Canvas Authentication Settings')).toBeInTheDocument()
  })
})
