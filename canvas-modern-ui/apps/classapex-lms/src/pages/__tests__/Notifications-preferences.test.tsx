import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Notifications from '../Notifications'

const MOCK_POLICIES = [
  { category: 'Due Date', channel_id: 1, frequency: 'immediately', notification: 'due_date' },
  { category: 'Grading', channel_id: 1, frequency: 'daily', notification: 'grading' },
  { category: 'Invitation', channel_id: 1, frequency: 'weekly', notification: 'invitation' },
  { category: 'Announcement', channel_id: 1, frequency: 'never', notification: 'announcement' },
]

const MOCK_CHANNELS = [
  { id: 1, address: 'user@example.com', type: 'email', workflow_state: 'active', position: 1 },
  { id: 2, address: '+1234567890', type: 'sms', workflow_state: 'active', position: 2 },
]

vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
}))

vi.mock('../../hooks/useNotification', () => ({
  useNotification: vi.fn(),
}))

import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery'
import { useNotification } from '../../hooks/useNotification'

describe('Notifications Preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNotification).mockReturnValue({
      showToast: vi.fn(),
      showConfirm: vi.fn().mockResolvedValue(true),
      showAlert: vi.fn(),
    } as any)

    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint === '/api/v1/users/self/activity_stream') {
        return { data: [], isLoading: false, isError: false, error: null, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/users/self/communication_channels') {
        return { data: MOCK_CHANNELS, isLoading: false, isError: false, error: null, refetch: vi.fn() } as any
      }
      return { data: null, isLoading: false, isError: false, error: null, refetch: vi.fn() } as any
    })

    vi.mocked(canvasFetch).mockImplementation(async (endpoint: string) => {
      if (typeof endpoint === 'string' && endpoint.includes('/notification_policies')) {
        return MOCK_POLICIES
      }
      return {}
    })
  })

  it('renders preference matrix rows', async () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Preferences'))

    await waitFor(() => {
      expect(screen.getByText('Due Date')).toBeInTheDocument()
      expect(screen.getByText('Grading')).toBeInTheDocument()
      expect(screen.getByText('Invitation')).toBeInTheDocument()
      expect(screen.getByText('Announcement')).toBeInTheDocument()
      expect(screen.getByText('Discussion')).toBeInTheDocument()
      expect(screen.getByText('Conversation')).toBeInTheDocument()
      expect(screen.getByText('Submission Comment')).toBeInTheDocument()
    })
  })

  it('renders channel columns', async () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Preferences'))

    await waitFor(() => {
      expect(screen.getByText('email')).toBeInTheDocument()
      expect(screen.getByText('user@example.com')).toBeInTheDocument()
      expect(screen.getByText('sms')).toBeInTheDocument()
      expect(screen.getByText('+1234567890')).toBeInTheDocument()
    })
  })

  it('frequency dropdowns are present', async () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Preferences'))

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox')
      expect(selects.length).toBeGreaterThan(0)
    })
  })

  it('changing dropdown updates the displayed frequency', async () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Preferences'))

    await waitFor(() => {
      expect(screen.getByText('Due Date')).toBeInTheDocument()
    })

    const selects = screen.getAllByRole('combobox')
    // First select should correspond to Due Date / email channel
    expect((selects[0] as HTMLSelectElement).value).toBe('immediately')

    fireEvent.change(selects[0], { target: { value: 'daily' } })

    expect((selects[0] as HTMLSelectElement).value).toBe('daily')
  })

  it('fetchPolicies calls canvasFetch to load policies', async () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Preferences'))

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        '/api/v1/users/self/communication_channels/1/notification_policies'
      )
      expect(canvasFetch).toHaveBeenCalledWith(
        '/api/v1/users/self/communication_channels/2/notification_policies'
      )
    })
  })

  it('save button triggers batch update via canvasFetch', async () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Preferences'))

    await waitFor(() => {
      expect(screen.getByText('Save Preferences')).toBeInTheDocument()
    })

    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], { target: { value: 'daily' } })

    fireEvent.click(screen.getByText('Save Preferences'))

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        expect.stringContaining('/notification_policies'),
        expect.objectContaining({ method: 'PUT' })
      )
    })
  })
})
