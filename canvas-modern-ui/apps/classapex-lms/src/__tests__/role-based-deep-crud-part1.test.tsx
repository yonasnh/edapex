/**
 * Role-Based Deep CRUD Tests — Part 1
 * ====================================
 * Verifies deep, observable CRUD interactions:
 *   - Gradebook inline editing (teacher)
 *   - Inbox compose + reply (student)
 *   - Discussions reply to thread + nested entry (student)
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import GradebookPage from '../pages/Gradebook'
import InboxPage from '../pages/Inbox'
import DiscussionsPage from '../pages/Discussions'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
  useCanvasMutation: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
}))

vi.mock('../contexts/RoleContext', () => ({
  useRole: vi.fn(),
}))

vi.mock('../hooks/useNotification', () => ({
  useNotification: vi.fn(),
}))

vi.mock('../widgets/ReplyEditor', () => ({
  __esModule: true,
  default: ({ onSubmit }: any) => (
    <div data-testid="reply-editor">
      <textarea data-testid="reply-textarea" />
      <button onClick={() => onSubmit('Test reply')}>Submit Reply</button>
    </div>
  ),
}))

vi.mock('../widgets/MediaLibrary', () => ({
  MediaLibrary: () => <div data-testid="media-library">Media Library</div>,
}))

vi.mock('../components/RichEditor', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }: any) => (
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-testid="rich-editor"
    />
  ),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...(actual as any),
    useNavigate: () => mockNavigate,
  }
})

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockRole(role: string) {
  vi.mocked(useRole).mockReturnValue({ role } as any)
}

function mockNotifications() {
  vi.mocked(useNotification).mockReturnValue({
    showToast: vi.fn(),
    showConfirm: vi.fn().mockResolvedValue(true),
    showAlert: vi.fn(),
  } as any)
}

function mockGradebookData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/users')) {
      return {
        data: [{ id: 1, name: 'Alice', sortable_name: 'Alice A.' }],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    if (endpoint.includes('/assignments') && !endpoint.includes('/submissions')) {
      return {
        data: [{ id: 10, name: 'Homework 1', points_possible: 100 }],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    if (endpoint.includes('/students/submissions')) {
      return {
        data: [{ user_id: 1, assignment_id: 10, score: 85, grade: 'B' }],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    if (endpoint.includes('/assignment_groups')) {
      return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderGradebook() {
  mockNotifications()
  mockGradebookData()
  return render(
    <MemoryRouter initialEntries={['/courses/42/gradebook']}>
      <Routes>
        <Route path="/courses/:courseId/gradebook" element={<GradebookPage />} />
      </Routes>
    </MemoryRouter>
  )
}

const MOCK_CONVERSATIONS = [
  {
    id: 1,
    subject: 'Assignment Clarification',
    last_message: 'When is the deadline?',
    last_message_at: '2026-01-10T09:00:00Z',
    workflow_state: 'read' as const,
    message_count: 3,
    participants: [{ id: 101, name: 'Dr. Chen' }],
    audience: [101],
    starred: false,
    context_name: 'Math 101',
    properties: [],
    messages: [
      { id: 1, author_id: 101, body: 'When is the deadline?', created_at: '2026-01-10T09:00:00Z', generated: false },
    ],
  },
]

function mockInboxData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/conversations') {
      return {
        data: MOCK_CONVERSATIONS,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    if (endpoint === '/api/v1/users/self') {
      return { data: { id: 999 }, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/conversations/1')) {
      return {
        data: MOCK_CONVERSATIONS[0],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderInbox() {
  mockNotifications()
  mockInboxData()
  return render(
    <MemoryRouter>
      <InboxPage />
    </MemoryRouter>
  )
}

const MOCK_COURSES = [{ id: 10, name: 'Math 101' }]

const MOCK_DISCUSSIONS = [
  {
    id: '1',
    title: 'Week 1 Intro',
    message: 'Welcome to the course',
    author: { id: '101', display_name: 'Dr. Chen' },
    posted_at: '2026-01-01T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    discussion_subentry_count: 1,
    pinned: false,
    locked: false,
    unread_count: 0,
    subscribed: true,
  },
]

const MOCK_ENTRIES = [
  {
    id: '100',
    message: '<p>Great topic!</p>',
    created_at: '2026-01-02T00:00:00Z',
    user: { display_name: 'Alice', id: 1 },
    user_name: 'Alice',
    recent_replies: [],
  },
]

function mockDiscussionData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/users/self/courses') {
      return { data: MOCK_COURSES, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('discussion_topics') && !endpoint.includes('entries')) {
      return {
        data: MOCK_DISCUSSIONS,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    if (endpoint.includes('entries')) {
      return {
        data: MOCK_ENTRIES,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderDiscussions() {
  mockNotifications()
  mockDiscussionData()
  return render(
    <MemoryRouter>
      <DiscussionsPage />
    </MemoryRouter>
  )
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Gradebook — Inline Editing (Teacher)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
    mockRole('teacher')
  })

  it('teacher can click a grade cell, change the value, and blur to trigger save', async () => {
    vi.mocked(canvasFetch).mockResolvedValue({ score: 95, grade: 'A' })
    renderGradebook()

    const cell = screen.getByDisplayValue('85') as HTMLInputElement
    fireEvent.change(cell, { target: { value: '95' } })
    fireEvent.blur(cell)

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        '/api/v1/courses/42/assignments/10/submissions/1',
        expect.objectContaining({
          method: 'PUT',
          body: { submission: { posted_grade: '95' } },
        })
      )
    })
  })

  it('cell shows "…" while saving', async () => {
    let resolveSave: (value: any) => void
    const savePromise = new Promise((resolve) => {
      resolveSave = resolve
    })
    vi.mocked(canvasFetch).mockReturnValue(savePromise as any)

    renderGradebook()

    const cell = screen.getByDisplayValue('85') as HTMLInputElement
    fireEvent.change(cell, { target: { value: '95' } })
    fireEvent.blur(cell)

    await waitFor(() => {
      expect(screen.getByText('…')).toBeInTheDocument()
    })

    resolveSave!({ score: 95, grade: 'A' })
  })

  it('cell border turns green after saved', async () => {
    vi.mocked(canvasFetch).mockResolvedValue({ score: 95, grade: 'A' })
    renderGradebook()

    const cell = screen.getByDisplayValue('85') as HTMLInputElement
    fireEvent.change(cell, { target: { value: '95' } })
    fireEvent.blur(cell)

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalled()
    })

    // After successful save, the cell gets a green border via borderColor style
    // We verify by re-querying and checking the style attribute contains the success color
    const savedCell = screen.getByDisplayValue('95') as HTMLInputElement
    expect(savedCell.style.borderColor).toContain('success')
  })
})

describe('Inbox — Actual Send & Reply', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('student can compose and send a message', async () => {
    vi.mocked(canvasFetch).mockImplementation(async (endpoint: string, options?: any) => {
      if (typeof endpoint === 'string' && endpoint.includes('search/recipients')) {
        return [{ id: 'user_202', name: 'Bob', type: 'user' }]
      }
      return { id: 99 }
    })

    renderInbox()

    // Open compose modal
    fireEvent.click(screen.getByLabelText(/compose new message/i))
    expect(screen.getByRole('heading', { name: /new message/i })).toBeInTheDocument()

    // Type in To field and select recipient from search results
    const toInput = screen.getByPlaceholderText(/search for a person or course/i)
    fireEvent.change(toInput, { target: { value: 'Bob' } })

    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Bob'))

    // Fill subject and body
    const subjectInput = screen.getByPlaceholderText(/message subject/i)
    fireEvent.change(subjectInput, { target: { value: 'Hello' } })

    const bodyInput = screen.getByPlaceholderText(/type your message/i)
    fireEvent.change(bodyInput, { target: { value: 'This is a test message' } })

    // Click Send Message
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        '/api/v1/conversations',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      )
    })

    // Verify FormData contents
    const [, options] = vi.mocked(canvasFetch).mock.calls.find(
      ([ep]) => ep === '/api/v1/conversations'
    )!
    const formData = options.body as FormData
    expect(formData.get('body')).toBe('This is a test message')
    expect(formData.get('subject')).toBe('Hello')
    expect(formData.get('recipients[]')).toBe('user_user_202')
  })

  it('student can reply to a conversation', async () => {
    vi.mocked(canvasFetch).mockResolvedValue({ id: 1 })
    renderInbox()

    // Select a conversation
    fireEvent.click(screen.getByText('Assignment Clarification'))

    await waitFor(() => {
      // Message bubble appears in detail panel; list preview also has same text
      expect(screen.getAllByText('When is the deadline?').length).toBeGreaterThanOrEqual(1)
    })

    // Type reply text
    const replyInput = screen.getByPlaceholderText(/type a reply/i)
    fireEvent.change(replyInput, { target: { value: 'My reply text' } })

    // Click Send Reply
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }))

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        '/api/v1/conversations/1/add_message',
        expect.objectContaining({
          method: 'POST',
          body: expect.objectContaining({ body: 'My reply text' }),
        })
      )
    })
  })
})

describe('Discussions — Reply to Thread', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('student can reply to a discussion', async () => {
    vi.mocked(canvasFetch).mockResolvedValue({ id: 'new-entry' })
    renderDiscussions()

    // Select a discussion
    fireEvent.click(screen.getByText('Week 1 Intro'))

    await waitFor(() => {
      // Content appears both in card excerpt and modal body
      expect(screen.getAllByText('Welcome to the course').length).toBeGreaterThanOrEqual(1)
    })

    // Click main Reply button on discussion (primary styled)
    const replyBtns = screen.getAllByRole('button', { name: /reply/i })
    fireEvent.click(replyBtns[0])

    // ReplyEditor appears
    await waitFor(() => {
      expect(screen.getByTestId('reply-editor')).toBeInTheDocument()
    })

    // Submit reply
    fireEvent.click(screen.getByRole('button', { name: /submit reply/i }))

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        '/api/v1/courses/10/discussion_topics/1/entries',
        expect.objectContaining({
          method: 'POST',
          body: { message: 'Test reply' },
        })
      )
    })
  })

  it('student can reply to a nested entry', async () => {
    vi.mocked(canvasFetch).mockResolvedValue({ id: 'nested-reply' })
    renderDiscussions()

    // Select a discussion with entries
    fireEvent.click(screen.getByText('Week 1 Intro'))

    await waitFor(() => {
      // Content appears both in card excerpt and modal body
      expect(screen.getAllByText('Welcome to the course').length).toBeGreaterThanOrEqual(1)
    })

    // Click Reply on an entry (ghost styled, second in DOM)
    const entryReplyBtn = screen.getAllByRole('button', { name: /^reply$/i })
    fireEvent.click(entryReplyBtn[1])

    // ReplyEditor appears below that entry
    await waitFor(() => {
      expect(screen.getAllByTestId('reply-editor').length).toBeGreaterThanOrEqual(1)
    })

    // Submit reply
    fireEvent.click(screen.getByRole('button', { name: /submit reply/i }))

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        '/api/v1/courses/10/discussion_topics/1/entries/100/replies',
        expect.objectContaining({
          method: 'POST',
          body: { message: 'Test reply' },
        })
      )
    })
  })
})
