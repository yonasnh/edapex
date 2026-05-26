/**
 * Role-Based Discussions Tests
 * ==============================
 * Verifies discussion list rendering, creation, and moderation
 * capabilities across all roles.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import DiscussionsPage from '../pages/Discussions'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
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
      <button onClick={() => onSubmit('Reply body')}>Submit Reply</button>
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

// ─── Helpers ────────────────────────────────────────────────────────────────

const ROLES = ['student', 'teacher', 'admin', 'observer'] as const
const TEACHER_LIKE_ROLES = ['teacher', 'admin'] as const

const MOCK_COURSES = [
  { id: 10, name: 'Math 101' },
  { id: 20, name: 'History 201' },
]

const MOCK_DISCUSSIONS = [
  {
    id: '1',
    title: 'Week 1 Intro',
    message: 'Welcome to the course',
    author: { id: '101', name: 'Dr. Chen' },
    course: { id: '10', name: 'Math 101' },
    createdAt: '2026-01-01T00:00:00Z',
    replyCount: 5,
    viewCount: 120,
    likeCount: 3,
    isPinned: true,
    isLocked: false,
    isUnread: false,
    isSubscribed: true,
  },
  {
    id: '2',
    title: 'Homework Help',
    message: 'I need help with problem 3',
    author: { id: '202', name: 'Alice' },
    course: { id: '10', name: 'Math 101' },
    createdAt: '2026-01-02T00:00:00Z',
    replyCount: 2,
    viewCount: 45,
    likeCount: 1,
    isPinned: false,
    isLocked: false,
    isUnread: true,
    isSubscribed: false,
  },
]

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

function mockDiscussionData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('discussion_topics') && !endpoint.includes('entries')) {
      return {
        data: MOCK_DISCUSSIONS.map((d) => ({
          id: d.id,
          title: d.title,
          message: d.message,
          author: { id: d.author.id, display_name: d.author.name },
          posted_at: d.createdAt,
          discussion_subentry_count: d.replyCount,
          pinned: d.isPinned,
          locked: d.isLocked,
          unread_count: d.isUnread ? 1 : 0,
          subscribed: d.isSubscribed,
        })),
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    if (endpoint === '/api/v1/users/self/courses') {
      return { data: MOCK_COURSES, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderDiscussions(role: string) {
  mockRole(role)
  mockNotifications()
  mockDiscussionData()
  return render(
    <MemoryRouter>
      <DiscussionsPage />
    </MemoryRouter>
  )
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Discussions — Role-Based CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders discussion list', () => {
        renderDiscussions(role)
        expect(screen.getByText('Week 1 Intro')).toBeInTheDocument()
        expect(screen.getByText('Homework Help')).toBeInTheDocument()
      })

      it('filters discussions by search term', () => {
        renderDiscussions(role)
        const searchInput = screen.getByPlaceholderText(/search discussions/i)
        fireEvent.change(searchInput, { target: { value: 'Homework' } })
        expect(screen.queryByText('Week 1 Intro')).not.toBeInTheDocument()
        expect(screen.getByText('Homework Help')).toBeInTheDocument()
      })
    })
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role} — teacher capabilities`, () => {
      it('shows New Discussion button', () => {
        renderDiscussions(role)
        expect(screen.getByText(/New Discussion/i)).toBeInTheDocument()
      })

      it('opens create discussion modal', () => {
        renderDiscussions(role)
        fireEvent.click(screen.getByText(/New Discussion/i))
        expect(screen.getByRole('heading', { name: /Create Discussion/i })).toBeInTheDocument()
      })

      it('submits create discussion form via canvasFetch', async () => {
        vi.mocked(canvasFetch).mockResolvedValue({ id: '99', title: 'New Topic' })
        renderDiscussions(role)

        fireEvent.click(screen.getByText(/New Discussion/i))
        const titleInput = screen.getByPlaceholderText(/Week 4 Discussion Topic/i)
        fireEvent.change(titleInput, { target: { value: 'New Topic' } })
        fireEvent.click(screen.getByRole('button', { name: /Create Discussion/i }))

        await waitFor(() => {
          expect(canvasFetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/v1/courses/'),
            expect.objectContaining({ method: 'POST' })
          )
        })
      })
    })
  })
})
