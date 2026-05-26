import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ZoomLtiPage from '../ZoomLtiPage'

vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
}))

import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery'

const mockedUseCanvasQuery = vi.mocked(useCanvasQuery)
const mockedCanvasFetch = vi.mocked(canvasFetch)

function renderPage(initialEntries = ['/courses/1/zoom']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/courses/:courseId/zoom" element={<ZoomLtiPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ZoomLtiPage', () => {
  beforeEach(() => {
    mockedUseCanvasQuery.mockReset()
    mockedCanvasFetch.mockReset()
  })

  it('shows loading state while checking tools', () => {
    mockedUseCanvasQuery.mockReturnValue({ data: undefined, isLoading: true } as any)
    renderPage()
    expect(screen.getByText('Checking for Zoom…')).toBeInTheDocument()
  })

  it('shows not configured message when Zoom is absent', () => {
    mockedUseCanvasQuery.mockReturnValue({ data: [{ id: 1, name: 'Some Other Tool' }], isLoading: false } as any)
    renderPage()
    expect(screen.getByText('Zoom is not configured')).toBeInTheDocument()
    expect(screen.getByText(/This course does not have the Zoom LTI tool installed/)).toBeInTheDocument()
  })

  it('fetches sessionless launch and renders iframe when Zoom is present', async () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: [{ id: 99, name: 'Zoom' }],
      isLoading: false,
    } as any)
    mockedCanvasFetch.mockResolvedValue({ url: 'https://zoom.us/lti/launch?token=abc' })
    renderPage()

    await waitFor(() => {
      expect(mockedCanvasFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/courses/1/external_tools/sessionless_launch')
      )
    })

    expect(screen.getByTitle('Zoom LTI')).toBeInTheDocument()
    const iframe = screen.getByTitle('Zoom LTI') as HTMLIFrameElement
    expect(iframe.src).toContain('https://zoom.us/lti/launch')
  })

  it('shows error when launch fails', async () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: [{ id: 99, name: 'Zoom' }],
      isLoading: false,
    } as any)
    mockedCanvasFetch.mockRejectedValue(new Error('Launch denied'))
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Could not launch Zoom')).toBeInTheDocument()
    })
    expect(screen.getByText('Launch denied')).toBeInTheDocument()
  })
})
