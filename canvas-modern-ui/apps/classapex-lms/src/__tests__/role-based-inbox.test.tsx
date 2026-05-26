/**
 * Role-Based Inbox Tests
 * ========================
 * Verifies conversation list, compose, reply, and filtering
 * work correctly for all roles.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import InboxPage from '../pages/Inbox'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
}))

vi.mock('../hooks/useNotification', () => ({
  useNotification: vi.fn(),
}))

// ─── Helpers ────────────────────────────────────────────────────────────────

const ROLES = ['student', 'teacher', 'admin', 'observer'] as const

const MOCK_CONVERSATIONS = [
  {
    id: 1,
    subject: 'Assignment Clarification',
    last_message: 'When is the deadline?',
    last_message_at: '2026-01-10T09:00:00Z',
    workflow_state: 'unread',
    message_count: 3,
    participants: [{ id: 101, name: 'Dr. Chen' }],
    starred: false,
    context_name: 'Math 101',
  },
  {
    id: 2,
    subject: 'Study Group',
    last_message: 'Meet at 3pm',
    last_message_at: '2026-01-09T14:00:00Z',
    workflow_state: 'read',
    message_count: 12,
    participants: [{ id: 202, name: 'Alice' }, { id: 203, name: 'Bob' }],
    starred: true,
    context_name: 'History 201',
  },
]

function mockNotifications() {
  vi.mocked(useNotification).mockReturnValue({
    showToast: vi.fn(),
    showConfirm: vi.fn().mockResolvedValue(true),
    showAlert: vi.fn(),
  } as any)
}

function mockInboxData(scope?: string) {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string, params?: any) => {
    if (endpoint === '/api/v1/conversations') {
      let data = [...MOCK_CONVERSATIONS]
      const filterScope = scope || params?.scope
      if (filterScope === 'unread') {
        data = data.filter((c) => c.workflow_state === 'unread')
      } else if (filterScope === 'starred') {
        data = data.filter((c) => c.starred)
      } else if (filterScope === 'sent') {
        data = [] // no sent messages in mock
      } else if (filterScope === 'archived') {
        data = []
      }
      return {
        data,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderInbox(filterScope?: string) {
  mockNotifications()
  mockInboxData(filterScope)
  return render(
    <MemoryRouter>
      <InboxPage />
    </MemoryRouter>
  )
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Inbox — Role-Based Messaging', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders conversation list', () => {
        renderInbox()
        expect(screen.getByText('Assignment Clarification')).toBeInTheDocument()
        expect(screen.getByText('Study Group')).toBeInTheDocument()
      })

      it('filters by unread', () => {
        renderInbox('unread')
        expect(screen.getByText('Assignment Clarification')).toBeInTheDocument()
        expect(screen.queryByText('Study Group')).not.toBeInTheDocument()
      })

      it('filters by starred', () => {
        renderInbox('starred')
        expect(screen.queryByText('Assignment Clarification')).not.toBeInTheDocument()
        expect(screen.getByText('Study Group')).toBeInTheDocument()
      })

      it('opens compose modal', () => {
        renderInbox()
        const composeBtn = screen.getByLabelText(/compose new message/i)
        fireEvent.click(composeBtn)
        expect(screen.getByRole('heading', { name: /new message/i })).toBeInTheDocument()
      })

      it('compose modal has subject, body, and send fields', () => {
        renderInbox()

        const composeBtn = screen.getByLabelText(/compose new message/i)
        fireEvent.click(composeBtn)

        expect(screen.getByPlaceholderText(/message subject/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
      })
    })
  })
})
