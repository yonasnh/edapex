import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import CalendarPage from '../Calendar'
import { useCanvasQuery } from '../../hooks/useCanvasQuery'

const MOCK_EVENTS = [
  { id: 1, title: 'Assignment Due', start_at: '2026-06-01T23:59:00Z', end_at: '2026-06-01T23:59:00Z', type: 'assignment' }
]

vi.mock('@schoolapex/core', () => ({
  useAuth: () => ({ user: { id: '1', name: 'Test User' }, isAuthenticated: true }),
}))

vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
}))

vi.mock('../../hooks/useNotification', () => ({
  useNotification: vi.fn(() => ({
    showToast: vi.fn(),
    showConfirm: vi.fn(),
  })),
}))

describe('Calendar ICS sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(URL.createObjectURL).mockReturnValue('blob:mock-url')
    Object.assign(global.navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    vi.mocked(useCanvasQuery).mockImplementation((url: string, params?: any) => {
      if (url === '/api/v1/courses') {
        return { data: [{ id: 1, name: 'Test Course' }], isLoading: false, refetch: vi.fn() }
      }
      if (url === '/api/v1/calendar_events') {
        if (params?.type === 'assignment') {
          return { data: MOCK_EVENTS, isLoading: false, refetch: vi.fn() }
        }
        return { data: [], isLoading: false, refetch: vi.fn() }
      }
      return { data: [], isLoading: false, refetch: vi.fn() }
    })
  })

  it('renders calendar feed buttons', () => {
    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('button', { name: /Copy Calendar Feed URL/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Subscribe/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Export iCal/i })).toBeInTheDocument()
  })

  it('opens a webcal URL when Subscribe is clicked', async () => {
    vi.mocked(URL.createObjectURL).mockReturnValue('https://mock-calendar-url/classapex-calendar')

    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>
    )

    const subscribeBtn = screen.getByRole('button', { name: /Subscribe/i })
    fireEvent.click(subscribeBtn)

    await waitFor(() => {
      expect(vi.mocked(window.open)).toHaveBeenCalledWith(
        expect.stringContaining('webcal://'),
        '_blank'
      )
    })
  })

  it('copies calendar feed URL to clipboard when Copy button is clicked', async () => {
    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>
    )

    const copyBtn = screen.getByRole('button', { name: /Copy Calendar Feed URL/i })
    fireEvent.click(copyBtn)

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })
  })
})
