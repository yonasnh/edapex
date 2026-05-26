import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Inbox from '../pages/Inbox'

const MOCK_CONVERSATIONS = [
  {
    id: 1,
    subject: 'Assignment Help',
    participants: [{ id: 1, name: 'Alice' }],
    last_message: 'Can you help?',
    last_message_at: '2026-05-20T10:00:00Z',
    workflow_state: 'unread',
    message_count: 1,
    audience: [1],
    starred: false,
    properties: [],
  },
]

const MOCK_MESSAGES = [
  {
    id: 101,
    body: 'Can you help with question 3?',
    author_id: 1,
    created_at: '2026-05-20T10:00:00Z',
    attachments: [],
    generated: false,
  },
]

vi.mock('../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
}))

vi.mock('../hooks/useNotification', () => ({
  useNotification: vi.fn(),
}))

vi.mock('../contexts/RoleContext', () => ({
  useRole: vi.fn(),
}))

import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'
import { useRole } from '../contexts/RoleContext'

describe('Inbox Message Forwarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
    vi.mocked(useRole).mockReturnValue({ role: 'student' } as any)
    vi.mocked(useNotification).mockReturnValue({
      showToast: vi.fn(),
      showConfirm: vi.fn().mockResolvedValue(true),
      showAlert: vi.fn(),
    } as any)
  })

  const mockQueries = () => {
    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint === '/api/v1/conversations') {
        return {
          data: MOCK_CONVERSATIONS,
          isLoading: false,
          isError: false,
          error: null,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint.includes('/api/v1/conversations/')) {
        return {
          data: { ...MOCK_CONVERSATIONS[0], messages: MOCK_MESSAGES },
          isLoading: false,
          isError: false,
          error: null,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/users/self') {
        return {
          data: { id: 2 },
          isLoading: false,
          isError: false,
          error: null,
          refetch: vi.fn(),
        } as any
      }
      return { data: null, isLoading: false, isError: false, error: null, refetch: vi.fn() } as any
    })
  }

  it('forward button appears in message thread', () => {
    mockQueries()
    render(
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route path="/inbox" element={<Inbox />} />
        </Routes>
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Assignment Help'))

    expect(screen.getByLabelText('Forward conversation')).toBeInTheDocument()
  })

  it('clicking forward opens compose modal', () => {
    mockQueries()
    render(
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route path="/inbox" element={<Inbox />} />
        </Routes>
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Assignment Help'))
    fireEvent.click(screen.getByLabelText('Forward conversation'))

    expect(screen.getByRole('dialog', { name: /compose message/i })).toBeInTheDocument()
    expect(screen.getByText('Forward Message')).toBeInTheDocument()
  })

  it('compose modal has pre-filled subject "Fwd: ..."', () => {
    mockQueries()
    render(
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route path="/inbox" element={<Inbox />} />
        </Routes>
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Assignment Help'))
    fireEvent.click(screen.getByLabelText('Forward conversation'))

    const subjectInput = screen.getByPlaceholderText('Message subject') as HTMLInputElement
    expect(subjectInput.value).toBe('Fwd: Assignment Help')
  })

  it('compose modal has pre-filled body with original message', () => {
    mockQueries()
    render(
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route path="/inbox" element={<Inbox />} />
        </Routes>
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Assignment Help'))
    fireEvent.click(screen.getByLabelText('Forward conversation'))

    const bodyTextarea = screen.getByPlaceholderText('Type your message...') as HTMLTextAreaElement
    expect(bodyTextarea.value).toContain('--- Forwarded Message ---')
    expect(bodyTextarea.value).toContain('From: Alice')
    expect(bodyTextarea.value).toContain('Subject: Assignment Help')
    expect(bodyTextarea.value).toContain('Can you help with question 3?')
  })

  it('send button calls canvasFetch', async () => {
    vi.mocked(canvasFetch).mockImplementation(async (endpoint: string) => {
      if (typeof endpoint === 'string' && endpoint.includes('/api/v1/search/recipients')) {
        return [{ id: '2', name: 'Bob', type: 'user' }]
      }
      return { id: 999 }
    })

    mockQueries()
    render(
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route path="/inbox" element={<Inbox />} />
        </Routes>
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Assignment Help'))
    fireEvent.click(screen.getByLabelText('Forward conversation'))

    vi.useFakeTimers({ shouldAdvanceTime: true })

    const toInput = screen.getByPlaceholderText('Search for a person or course...')
    fireEvent.change(toInput, { target: { value: 'Bob' } })

    vi.advanceTimersByTime(400)

    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Bob'))

    await waitFor(() => {
      expect(screen.getByText('Send Message')).not.toBeDisabled()
    })

    fireEvent.click(screen.getByText('Send Message'))

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        '/api/v1/conversations',
        expect.objectContaining({ method: 'POST' })
      )
    })

    vi.useRealTimers()
  })
})
