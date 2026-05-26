import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import StorageQuotasPage from '../StorageQuotas'

vi.mock('../../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
}))

vi.mock('../../../hooks/useNotification', () => ({
  useNotification: () => ({
    showToast: vi.fn(),
  }),
}))

import { useCanvasQuery, canvasFetch } from '../../../hooks/useCanvasQuery'

const mockedUseCanvasQuery = vi.mocked(useCanvasQuery)
const mockedCanvasFetch = vi.mocked(canvasFetch)

function renderPage(initialEntries = ['/admin/storage-quotas']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/admin/storage-quotas" element={<StorageQuotasPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('StorageQuotasPage', () => {
  beforeEach(() => {
    mockedUseCanvasQuery.mockReset()
    mockedCanvasFetch.mockReset()
  })

  it('renders loading state', () => {
    mockedUseCanvasQuery.mockReturnValue({ data: undefined, isLoading: true } as any)
    renderPage()
    expect(screen.getByText('Storage Quotas')).toBeInTheDocument()
    expect(document.querySelectorAll('.cx-skeleton').length).toBeGreaterThan(0)
  })

  it('renders form with account quotas', () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: {
        id: 1,
        name: 'Root Account',
        default_storage_quota_mb: 512,
        default_user_storage_quota_mb: 1024,
        default_group_storage_quota_mb: 256,
      },
      isLoading: false,
    } as any)
    renderPage()

    expect(screen.getByDisplayValue('512')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1024')).toBeInTheDocument()
    expect(screen.getByDisplayValue('256')).toBeInTheDocument()
  })

  it('calls canvasFetch on save with updated quotas', async () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: { id: 1, name: 'Root Account', default_storage_quota_mb: 512, default_user_storage_quota_mb: 1024, default_group_storage_quota_mb: 256 },
      isLoading: false,
    } as any)
    mockedCanvasFetch.mockResolvedValue({})
    renderPage()

    const courseInput = screen.getByTestId('course-quota')
    fireEvent.change(courseInput, { target: { value: '1024' } })

    fireEvent.click(screen.getByTestId('save-quotas'))
    await waitFor(() => {
      expect(mockedCanvasFetch).toHaveBeenCalledWith(
        '/api/v1/accounts/1',
        {
          method: 'PUT',
          body: {
            account: {
              default_storage_quota_mb: 1024,
              default_user_storage_quota_mb: 1024,
              default_group_storage_quota_mb: 256,
            },
          },
        }
      )
    })
  })

  it('resets form values when reset is clicked', () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: { id: 1, name: 'Root Account', default_storage_quota_mb: 512, default_user_storage_quota_mb: 1024, default_group_storage_quota_mb: 256 },
      isLoading: false,
    } as any)
    renderPage()

    const courseInput = screen.getByTestId('course-quota')
    fireEvent.change(courseInput, { target: { value: '999' } })
    expect(screen.getByDisplayValue('999')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Reset'))
    expect(screen.getByDisplayValue('512')).toBeInTheDocument()
  })
})
