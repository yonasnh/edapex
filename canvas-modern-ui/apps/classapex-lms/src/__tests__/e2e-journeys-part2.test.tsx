/**
 * E2E Journey Tests — Part 2
 * ==========================
 * Simulates real user workflows across multiple pages in ClassApex LMS.
 * Tests use Vitest + React Testing Library + jsdom with MemoryRouter.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom'

// ─── Pages ──────────────────────────────────────────────────────────────────

import DashboardV2 from '../pages/DashboardV2'
import CourseHome from '../pages/CourseHome'
import AssignmentList from '../pages/AssignmentList'
import AssignmentDetail from '../pages/AssignmentDetail'
import GradesPage from '../pages/Grades'
import GradebookPage from '../pages/Gradebook'
import AnnouncementsPage from '../pages/Announcements'
import DiscussionsPage from '../pages/Discussions'
import InboxPage from '../pages/Inbox'
import QuizzesPage from '../pages/Quizzes'
import QuizBuilderPage from '../pages/QuizBuilder'
import QuizResultsPage from '../pages/QuizResults'
import FilesPage from '../pages/Files'
import ModulesPage from '../pages/Modules'
import CalendarPage from '../pages/Calendar'
import SettingsPage from '../pages/Settings'
import ObserverDashboard from '../pages/ObserverDashboard'
import AdminDashboardPage from '../pages/admin/AdminDashboard'
import AdminCourseManagementPage from '../pages/admin/CourseManagement'
import AdminUsersPage from '../pages/admin/Users'
import AdminTermsPage from '../pages/admin/Terms'

// ─── Hooks ──────────────────────────────────────────────────────────────────

import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

// ─── Module Mocks ───────────────────────────────────────────────────────────

vi.mock('../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
  useCanvasMutation: () => ({ mutate: vi.fn(), isLoading: false, error: null, data: null }),
}))

vi.mock('../contexts/RoleContext', () => ({
  useRole: vi.fn(),
}))

vi.mock('../hooks/useNotification', () => ({
  useNotification: vi.fn(),
}))

vi.mock('../contexts/TenantContext', () => ({
  useTenant: () => ({ config: { ui: { dashboardLayout: 'cards' } } }),
}))

vi.mock('../contexts/I18nContext', () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useI18n: () => ({ locale: 'en', setLocale: vi.fn(), t: (k: string) => k }),
}))

vi.mock('@schoolapex/core', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn(), accentColor: '#6366f1', setAccentColor: vi.fn() }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  RequireAuth: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  OAuthCallbackPage: () => <div>OAuth</div>,
  useAuth: () => ({ token: 'test-token', isAuthenticated: true }),
}))

vi.mock('../widgets/SubmissionForm', () => ({
  SubmissionForm: ({ onSubmit }: any) => (
    <div data-testid="submission-form">
      <textarea data-testid="submission-body" placeholder="Type your submission..." />
      <button
        onClick={() =>
          onSubmit?.({ type: 'online_text_entry', body: 'My homework answer' })
        }
      >
        Submit Assignment
      </button>
    </div>
  ),
}))

vi.mock('../widgets/SubmissionStatus', () => ({
  SubmissionStatus: ({ status }: any) => (
    <span data-testid="submission-status">{status}</span>
  ),
}))

vi.mock('../pages/AssignmentEditModal', () => ({
  __esModule: true,
  default: ({ onClose, onSaved }: any) => (
    <div data-testid="edit-modal">
      <input data-testid="assignment-title" placeholder="Assignment title" />
      <input data-testid="assignment-points" placeholder="Points" />
      <button
        onClick={() => {
          onSaved?.()
          onClose?.()
        }}
      >
        Save
      </button>
    </div>
  ),
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

vi.mock('../widgets/ReplyEditor', () => ({
  __esModule: true,
  default: ({ onSubmit }: any) => (
    <div data-testid="reply-editor">
      <textarea data-testid="reply-body" placeholder="Write a reply..." />
      <button onClick={() => onSubmit('Reply body text')}>Post Reply</button>
    </div>
  ),
}))

vi.mock('../widgets/VirtualList', () => ({
  __esModule: true,
  default: ({ items, itemHeight, children }: any) => (
    <div data-testid="virtual-list">
      {items.map((item: any) => (
        <div key={item.id} style={{ height: itemHeight }}>
          {children(item)}
        </div>
      ))}
    </div>
  ),
}))

vi.mock('../widgets/ModuleList', () => ({
  ModuleList: () => <div data-testid="module-list">Modules</div>,
}))

vi.mock('../widgets/PeopleList', () => ({
  PeopleList: () => <div data-testid="people-list">People</div>,
}))

vi.mock('../widgets/MediaLibrary', () => ({
  MediaLibrary: () => <div data-testid="media-library">Media Library</div>,
}))

vi.mock('../widgets/CourseSidebar', () => ({
  CourseSidebar: () => (
    <div data-testid="course-sidebar">
      <Link to="/courses/1/assignments">Assignments</Link>
      <Link to="/courses/1/announcements">Announcements</Link>
      <Link to="/courses/1/quizzes">Quizzes</Link>
      <Link to="/grades?courseId=1">My Grades</Link>
      <Link to="/courses/1/gradebook">Gradebook</Link>
    </div>
  ),
}))

// ─── Helpers ────────────────────────────────────────────────────────────────

const mockShowToast = vi.fn()
const mockShowConfirm = vi.fn().mockResolvedValue(true)

function mockRole(role: string) {
  vi.mocked(useRole).mockReturnValue({ role, masqueradeAs: vi.fn() } as any)
}

function mockNotifications() {
  vi.mocked(useNotification).mockReturnValue({
    showToast: mockShowToast,
    showConfirm: mockShowConfirm,
    showAlert: vi.fn(),
  } as any)
}

function mockCanvasFetchSuccess() {
  vi.mocked(canvasFetch).mockResolvedValue({ id: 999, success: true })
}

function mockFetchSuccess() {
  ;(global.fetch as any).mockResolvedValue({ ok: true })
}

// ─── Journey 7: File submission workflow ────────────────────────────────────

describe('Journey 7: File submission workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRole('student')
    mockNotifications()
    mockCanvasFetchSuccess()
    mockFetchSuccess()
  })

  it('flows Files → upload → AssignmentDetail → submit', async () => {
    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint === '/api/v1/users/self/folders') {
        return {
          data: [{ id: 1, name: 'course files', full_name: 'course files', parent_folder_id: 10 }],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/users/self/files') {
        return {
          data: [{ id: 101, display_name: 'essay.pdf', size: 1024, content_type: 'application/pdf', mime_class: 'pdf' }],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/users/self/folders/root') {
        return { data: { id: 10 }, isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/courses') {
        return { data: [{ id: 1, name: 'Math 101' }], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/courses/1/assignments/101') {
        return {
          data: {
            id: 101,
            name: 'Homework 1',
            description: '<p>Submit your work</p>',
            points_possible: 10,
            due_at: '2026-06-01T23:59:59Z',
            submission_types: ['online_text_entry'],
            submission: null,
          },
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
    })

    const { unmount } = render(
      <MemoryRouter initialEntries={['/files']}>
        <Routes>
          <Route path="/files" element={<FilesPage />} />
          <Route path="/courses/:courseId/assignments/:assignmentId" element={<AssignmentDetail />} />
        </Routes>
      </MemoryRouter>
    )

    // 1. Student opens Files page
    await waitFor(() => {
      expect(screen.getByText('essay.pdf')).toBeInTheDocument()
    })

    // 2. Clicks Upload button → modal opens
    fireEvent.click(screen.getByText('Upload'))
    await waitFor(() => {
      expect(screen.getByText('Upload Files')).toBeInTheDocument()
    })

    // 3. Mock upload succeeds by clicking Done
    fireEvent.click(screen.getByText('Done'))
    await waitFor(() => {
      expect(screen.queryByText('Upload Files')).not.toBeInTheDocument()
    })

    // 4. Navigate to AssignmentDetail
    unmount()
    render(
      <MemoryRouter initialEntries={['/courses/1/assignments/101']}>
        <Routes>
          <Route path="/courses/:courseId/assignments/:assignmentId" element={<AssignmentDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Submit your work')).toBeInTheDocument()
    })

    // 5. Starts submission and submits
    fireEvent.click(screen.getByText('Start Submission'))
    expect(screen.getByTestId('submission-form')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Submit Assignment'))
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('submitted'),
          type: 'success',
        })
      )
    })
  })
})

// ─── Journey 8: Module progress tracking ────────────────────────────────────

describe('Journey 8: Module progress tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRole('student')
    mockNotifications()
    mockCanvasFetchSuccess()
    mockFetchSuccess()
  })

  it('shows modules with items and completion requirements for students', async () => {
    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint === '/api/v1/courses/1/modules') {
        return {
          data: [
            {
              id: 1,
              name: 'Week 1',
              position: 1,
              workflow_state: 'active',
              published: true,
              prerequisite_module_ids: [],
              items: [
                { id: 101, title: 'Intro Page', type: 'Page', position: 1, published: true, completion_requirement: { type: 'must_view' } },
                { id: 102, title: 'Homework 1', type: 'Assignment', position: 2, published: true, completion_requirement: { type: 'must_submit' } },
              ],
            },
          ],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/courses/1/assignments') {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
    })

    render(
      <MemoryRouter initialEntries={['/courses/1/modules']}>
        <Routes>
          <Route path="/courses/:courseId/modules" element={<ModulesPage />} />
        </Routes>
      </MemoryRouter>
    )

    // 1. Student opens Modules page
    await waitFor(() => {
      expect(screen.getByText('Week 1')).toBeInTheDocument()
    })

    // 2. Sees module items
    expect(screen.getByText('Intro Page')).toBeInTheDocument()
    expect(screen.getByText('Homework 1')).toBeInTheDocument()

    // 3. Completion requirements are visible
    expect(screen.getByText(/Must must_view/i)).toBeInTheDocument()
    expect(screen.getByText(/Must must_submit/i)).toBeInTheDocument()
  })
})

// ─── Journey 9: Grade dispute via messaging ─────────────────────────────────

describe('Journey 9: Grade dispute via messaging', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNotifications()
    mockCanvasFetchSuccess()
    mockFetchSuccess()
  })

  it('student sees low grade, messages teacher, teacher replies', async () => {
    mockRole('student')

    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint === '/api/v1/users/self/courses') {
        return {
          data: [{ id: 1, name: 'Math 101' }],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/courses/1/students/submissions') {
        return {
          data: [
            {
              id: 1001,
              assignment: { id: 101, name: 'Essay', points_possible: 20, is_quiz_assignment: false },
              score: 5,
              workflow_state: 'graded',
              submitted_at: '2026-05-20T10:00:00Z',
              graded_at: '2026-05-21T10:00:00Z',
              late: false,
              missing: false,
              excused: false,
            },
          ],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/conversations') {
        return {
          data: [
            {
              id: 1,
              subject: 'Re: Essay Grade',
              last_message: 'Can you explain my grade?',
              last_message_at: '2026-05-20T10:00:00Z',
              workflow_state: 'read',
              message_count: 1,
              participants: [{ id: 101, name: 'Dr. Chen' }],
              starred: false,
              context_name: 'Math 101',
              messages: [
                { id: 1, author_id: 1, body: 'Can you explain my grade?', created_at: '2026-05-20T10:00:00Z', generated: false },
              ],
            },
          ],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/users/self') {
        return { data: { id: 1 }, isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint.startsWith('/api/v1/conversations/1')) {
        return {
          data: {
            id: 1,
            subject: 'Re: Essay Grade',
            last_message: 'Teacher reply here',
            last_message_at: '2026-05-20T11:00:00Z',
            workflow_state: 'read',
            message_count: 2,
            participants: [{ id: 101, name: 'Dr. Chen' }],
            starred: false,
            context_name: 'Math 101',
            messages: [
              { id: 1, author_id: 1, body: 'Can you explain my grade?', created_at: '2026-05-20T10:00:00Z', generated: false },
              { id: 2, author_id: 101, body: 'Teacher reply here', created_at: '2026-05-20T11:00:00Z', generated: false },
            ],
          },
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
    })

    const { unmount } = render(
      <MemoryRouter initialEntries={['/grades']}>
        <Routes>
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/inbox" element={<InboxPage />} />
        </Routes>
      </MemoryRouter>
    )

    // 1. Student opens Grades page, sees low score
    await waitFor(() => {
      expect(screen.getByText('Essay')).toBeInTheDocument()
    })
    expect(screen.getByText('5/20')).toBeInTheDocument()

    // 2. Navigate to Inbox
    unmount()
    render(
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route path="/inbox" element={<InboxPage />} />
        </Routes>
      </MemoryRouter>
    )

    // 3. Student sees grade dispute message
    await waitFor(() => {
      expect(screen.getByText('Re: Essay Grade')).toBeInTheDocument()
    })

    // 4. Clicks compose and sends a new message
    fireEvent.click(screen.getByLabelText(/compose new message/i))
    expect(screen.getByRole('heading', { name: /New Message/i })).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText(/search for a person/i)
    fireEvent.change(searchInput, { target: { value: 'Dr' } })

    const modal = screen.getByRole('dialog', { name: /compose message/i })
    await waitFor(() => {
      const lists = modal.querySelectorAll('ul')
      expect(lists.length).toBeGreaterThan(0)
    })
    const searchResultsList = modal.querySelector('ul')!
    const recipientItem = searchResultsList.querySelector('li')!
    expect(recipientItem.textContent).toContain('Dr. Chen')
    fireEvent.click(recipientItem)

    await waitFor(() => {
      expect(modal.textContent).toContain('Dr. Chen')
    })

    fireEvent.change(screen.getByPlaceholderText(/message subject/i), {
      target: { value: 'Question about Essay Grade' },
    })
    fireEvent.change(screen.getByPlaceholderText(/type your message/i), {
      target: { value: 'I got 5/20 and I do not understand why.' },
    })

    const sendBtn = screen.getByRole('button', { name: /send message/i })
    expect(sendBtn).not.toBeDisabled()
    fireEvent.click(sendBtn)

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        '/api/v1/conversations',
        expect.objectContaining({ method: 'POST' })
      )
    })
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Message Sent', type: 'success' })
    )

    // Close compose modal if still open
    const cancelBtn = screen.queryByText('Cancel')
    if (cancelBtn) fireEvent.click(cancelBtn)

    // 5. Switch to Teacher role and open Inbox
    unmount()
    mockRole('teacher')

    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint === '/api/v1/conversations') {
        return {
          data: [
            {
              id: 1,
              subject: 'Re: Essay Grade',
              last_message: 'Can you explain my grade?',
              last_message_at: '2026-05-20T10:00:00Z',
              workflow_state: 'read',
              message_count: 1,
              participants: [{ id: 1, name: 'Student' }],
              starred: false,
              context_name: 'Math 101',
              messages: [
                { id: 1, author_id: 1, body: 'Can you explain my grade?', created_at: '2026-05-20T10:00:00Z', generated: false },
              ],
            },
          ],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/users/self') {
        return { data: { id: 101 }, isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint.startsWith('/api/v1/conversations/1')) {
        return {
          data: {
            id: 1,
            subject: 'Re: Essay Grade',
            last_message: 'Teacher reply here',
            last_message_at: '2026-05-20T11:00:00Z',
            workflow_state: 'read',
            message_count: 2,
            participants: [{ id: 1, name: 'Student' }],
            starred: false,
            context_name: 'Math 101',
            messages: [
              { id: 1, author_id: 1, body: 'Can you explain my grade?', created_at: '2026-05-20T10:00:00Z', generated: false },
              { id: 2, author_id: 101, body: 'Teacher reply here', created_at: '2026-05-20T11:00:00Z', generated: false },
            ],
          },
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
    })

    render(
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route path="/inbox" element={<InboxPage />} />
        </Routes>
      </MemoryRouter>
    )

    // 6. Teacher sees the grade dispute message
    await waitFor(() => {
      expect(screen.queryAllByText('Re: Essay Grade').length).toBeGreaterThan(0)
    })

    // 7. Teacher opens conversation and replies
    fireEvent.click(screen.getAllByText('Re: Essay Grade')[0])
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/type a reply/i)).toBeInTheDocument()
    })

    const replyInput = screen.getByPlaceholderText(/type a reply/i)
    fireEvent.change(replyInput, { target: { value: 'Teacher reply here' } })
    fireEvent.click(screen.getByText('Send'))

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        expect.stringContaining('/add_message'),
        expect.objectContaining({ method: 'POST' })
      )
    })

    // 8. Reply appears in thread
    await waitFor(() => {
      expect(screen.getByText('Teacher reply here')).toBeInTheDocument()
    })
  })
})

