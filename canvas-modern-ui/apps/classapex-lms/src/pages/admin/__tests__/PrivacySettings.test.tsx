import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import PrivacySettingsPage from '../PrivacySettings'

vi.mock('../../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
}))

import { useCanvasQuery } from '../../../hooks/useCanvasQuery'

const mockedUseCanvasQuery = vi.mocked(useCanvasQuery)

function renderPage(initialEntries = ['/admin/privacy']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/admin/privacy" element={<PrivacySettingsPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PrivacySettingsPage', () => {
  beforeEach(() => {
    mockedUseCanvasQuery.mockReset()
  })

  it('renders loading state', () => {
    mockedUseCanvasQuery.mockReturnValue({ data: undefined, isLoading: true } as any)
    renderPage()
    expect(screen.getByText('Privacy & Security')).toBeInTheDocument()
    expect(document.querySelectorAll('.cx-skeleton').length).toBeGreaterThan(0)
  })

  it('shows configured terms and privacy links', () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: {
        id: 1,
        name: 'Root Account',
        terms_of_service_url: 'https://example.com/terms',
        privacy_policy_url: 'https://example.com/privacy',
      },
      isLoading: false,
    } as any)
    renderPage()

    expect(screen.getAllByText('Configured').length).toBe(2)
    expect(screen.getAllByText('View Terms').length).toBeGreaterThan(0)
    expect(screen.getAllByText('View Policy').length).toBeGreaterThan(0)
  })

  it('shows not configured when urls are missing', () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: { id: 1, name: 'Root Account' },
      isLoading: false,
    } as any)
    renderPage()

    const notConfigured = screen.getAllByText('Not configured')
    expect(notConfigured.length).toBe(2)
  })

  it('opens iframe when Open Canvas Settings is clicked', () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: { id: 1, name: 'Root Account' },
      isLoading: false,
    } as any)
    renderPage()

    fireEvent.click(screen.getByText('Open Canvas Settings'))
    expect(screen.getByTitle('Canvas Account Settings')).toBeInTheDocument()
  })
})
