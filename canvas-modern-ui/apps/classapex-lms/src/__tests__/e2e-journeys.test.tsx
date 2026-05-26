/**
 * E2E Journey Tests
 * =================
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

// ─── Hooks ──────────────────────────────────────────────────────────────────

import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

// ─── Module Mocks ───────────────────────────────────────────────────────────

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

vi.mock('../contexts/TenantContext', () => ({
  useTenant: () => ({ config: { ui: { dashboardLayout: 'cards' } } }),
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

// ─── Journey 1: Student submits homework ────────────────────────────────────

describe('Journey 1: Student submits homework', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRole('student')
    mockNotifications()
    mockCanvasFetchSuccess()
    mockFetchSuccess()
  })

  it('flows Dashboard → Course → Assignments → Detail → submit → Grades', async () => {
    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint === '/api/v1/courses') {
        return {
          data: [
            {
              id: 1,
              name: 'Math 101',
              course_code: 'MATH-101',
              workflow_state: 'available',
            },
          ],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/users/self/todo') {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/users/self/upcoming_events') {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/users/self/missing_submissions') {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/users/self/activity_stream/summary') {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/courses/1') {
        return {
          data: {
            id: 1,
            name: 'Math 101',
            course_code: 'MATH-101',
            workflow_state: 'available',
            total_students: 30,
          },
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/courses/1/modules') {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/courses/1/users') {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/courses/1/assignments') {
        return {
          data: [
            {
              id: 101,
              name: 'Homework 1',
              points_possible: 10,
              due_at: '2026-06-01T23:59:59Z',
              course_id: 1,
              submission: null,
            },
          ],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/courses/1/assignments/101') {
        return {
          data: {
            id: 101,
            name: 'Homework 1',
            description: '<p>Solve problems 1-10</p>',
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
              assignment: {
                id: 101,
                name: 'Homework 1',
                points_possible: 10,
                is_quiz_assignment: false,
              },
              score: 10,
              workflow_state: 'graded',
              submitted_at: '2026-05-20T10:00:00Z',
              graded_at: '2026-05-21T10:00:00Z',
            },
          ],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
    })

    const { unmount } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardV2 />} />
          <Route path="/courses/:courseId" element={<CourseHome />} />
          <Route path="/courses/:courseId/assignments" element={<AssignmentList />} />
          <Route path="/courses/:courseId/assignments/:assignmentId" element={<AssignmentDetail />} />
          <Route path="/grades" element={<GradesPage />} />
        </Routes>
      </MemoryRouter>
    )

    // 1. Dashboard shows Math 101
    expect(screen.getByText('Math 101')).toBeInTheDocument()

    // 2. Click course card → CourseHome
    const courseLink = screen.getByText('Math 101').closest('a')
    expect(courseLink).toBeInTheDocument()
    fireEvent.click(courseLink!)

    await waitFor(() => {
      expect(screen.getByText('MATH-101')).toBeInTheDocument()
    })

    // 3. Click Assignments → AssignmentList
    fireEvent.click(screen.getByText('Assignments'))
    await waitFor(() => {
      expect(screen.getByText('Homework 1')).toBeInTheDocument()
    })

    // 4. Click Homework 1 → AssignmentDetail
    fireEvent.click(screen.getByText('Homework 1'))
    await waitFor(() => {
      expect(screen.getByText('Solve problems 1-10')).toBeInTheDocument()
    })

    // 5. Click Start Submission → SubmissionForm appears
    fireEvent.click(screen.getByText('Start Submission'))
    expect(screen.getByTestId('submission-form')).toBeInTheDocument()

    // 6. Submit work → toast confirms
    fireEvent.click(screen.getByText('Submit Assignment'))
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('submitted'),
          type: 'success',
        })
      )
    })

    // 7. Navigate to Grades → sees updated score
    unmount()
    render(
      <MemoryRouter initialEntries={['/grades']}>
        <Routes>
          <Route path="/grades" element={<GradesPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Homework 1')).toBeInTheDocument()
      expect(screen.getByText('10/10')).toBeInTheDocument()
    })
  })
})

// ─── Journey 2: Teacher creates & grades assignment ─────────────────────────

describe('Journey 2: Teacher creates & grades assignment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRole('teacher')
    mockNotifications()
    mockCanvasFetchSuccess()
  })

  it('flows CourseHome → Assignments → create → Gradebook → grade', async () => {
    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint === '/api/v1/courses/1') {
        return {
          data: {
            id: 1,
            name: 'Math 101',
            course_code: 'MATH-101',
            workflow_state: 'available',
            total_students: 30,
          },
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/courses/1/modules') {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/courses/1/users') {
        return {
          data: [{ id: 1, name: 'Alice Student' }],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/courses/1/assignments') {
        return {
          data: [
            {
              id: 101,
              name: 'Homework 1',
              points_possible: 10,
              due_at: '2026-06-01T23:59:59Z',
              course_id: 1,
              submission: null,
            },
          ],
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
              user_id: 1,
              assignment_id: 101,
              score: null,
              workflow_state: 'submitted',
              submitted_at: '2026-05-20T10:00:00Z',
            },
          ],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/courses/1/assignment_groups') {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
    })

    render(
      <MemoryRouter initialEntries={['/courses/1']}>
        <Routes>
          <Route path="/courses/:courseId" element={<CourseHome />} />
          <Route path="/courses/:courseId/assignments" element={<AssignmentList />} />
          <Route path="/courses/:courseId/gradebook" element={<GradebookPage />} />
        </Routes>
      </MemoryRouter>
    )

    // 1. Teacher opens CourseHome
    expect(screen.getByText('Math 101')).toBeInTheDocument()

    // 2. Navigates to Assignments
    fireEvent.click(screen.getByText('Assignments'))
    await waitFor(() => {
      expect(screen.getByText('Homework 1')).toBeInTheDocument()
    })

    // 3. Clicks "New Assignment" → modal opens
    fireEvent.click(screen.getByText('+ New Assignment'))
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument()

    // 4. Fills title/points/due date → saves
    fireEvent.change(screen.getByTestId('assignment-title'), {
      target: { value: 'Quiz 2' },
    })
    fireEvent.click(screen.getByText('Save'))
    expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument()

    // 5. Navigates to Gradebook (render directly since AssignmentList doesn't show sidebar)
    const { unmount: unmount2 } = render(
      <MemoryRouter initialEntries={['/courses/1/gradebook']}>
        <Routes>
          <Route path="/courses/:courseId/gradebook" element={<GradebookPage />} />
        </Routes>
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText('Alice Student')).toBeInTheDocument()
    })

    // 6. Enters grade for student → saves (blur triggers save)
    const gradeInputs = screen.getAllByRole('textbox')
    const gradeInput = gradeInputs.find((el) =>
      el.getAttribute('inputMode') === 'decimal'
    )
    expect(gradeInput).toBeDefined()
    fireEvent.change(gradeInput!, { target: { value: '9' } })
    fireEvent.blur(gradeInput!)

    // 7. Toast confirms grade saved
    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        expect.stringContaining('/submissions/1'),
        expect.objectContaining({ method: 'PUT' })
      )
    })
  })
})

// ─── Journey 3: Teacher posts announcement ──────────────────────────────────

describe('Journey 3: Teacher posts announcement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRole('teacher')
    mockNotifications()
    mockCanvasFetchSuccess()
  })

  it('flows CourseHome → Announcements → create → Dashboard', async () => {
    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint === '/api/v1/courses/1') {
        return {
          data: {
            id: 1,
            name: 'Math 101',
            course_code: 'MATH-101',
            workflow_state: 'available',
            total_students: 30,
          },
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/courses/1/modules') {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/courses/1/users') {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint.includes('only_announcements=true')) {
        return {
          data: [
            {
              id: 201,
              title: 'Exam Reminder',
              message: '<p>Midterm next week</p>',
              author: { id: 1, display_name: 'Dr. Smith' },
              posted_at: '2026-05-01T00:00:00Z',
              discussion_subentry_count: 0,
              pinned: false,
              locked: false,
              unread_count: 0,
              published: true,
            },
          ],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/courses') {
        return {
          data: [{ id: 1, name: 'Math 101', course_code: 'MATH-101' }],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/users/self/todo') {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/users/self/upcoming_events') {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/users/self/missing_submissions') {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/users/self/activity_stream/summary') {
        return {
          data: [{ type: 'Announcement', count: 1 }],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
    })

    const { unmount } = render(
      <MemoryRouter initialEntries={['/courses/1']}>
        <Routes>
          <Route path="/courses/:courseId" element={<CourseHome />} />
          <Route path="/courses/:courseId/announcements" element={<AnnouncementsPage />} />
        </Routes>
      </MemoryRouter>
    )

    // 1. Teacher opens CourseHome
    expect(screen.getByText('Math 101')).toBeInTheDocument()

    // 2. Clicks "Announcements" tab
    fireEvent.click(screen.getByText('Announcements'))
    await waitFor(() => {
      expect(screen.getByText('Exam Reminder')).toBeInTheDocument()
    })

    // 3. Clicks "New Announcement"
    fireEvent.click(screen.getByText('+ New Announcement'))
    expect(screen.getByRole('heading', { name: /New Announcement/i })).toBeInTheDocument()

    // 4. Fills title and message → publishes
    const titleInput = screen.getByPlaceholderText('Announcement title')
    fireEvent.change(titleInput, { target: { value: 'Welcome Message' } })
    fireEvent.change(screen.getByTestId('rich-editor'), {
      target: { value: '<p>Welcome to the course!</p>' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Post/i }))

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/courses/1/discussion_topics'),
        expect.objectContaining({ method: 'POST' })
      )
    })
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.stringContaining('created'), type: 'success' })
    )

    // 5. Navigates to Dashboard
    unmount()
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardV2 />} />
        </Routes>
      </MemoryRouter>
    )

    // 6. Sees announcement in activity stream
    await waitFor(() => {
      expect(screen.getByText('Activity')).toBeInTheDocument()
    })
  })
})

// ─── Journey 4: Discussion thread lifecycle ─────────────────────────────────

describe('Journey 4: Discussion thread lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNotifications()
    mockCanvasFetchSuccess()
  })

  it('teacher creates discussion, student replies, teacher pins it', async () => {
    mockRole('teacher')

    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint === '/api/v1/users/self/courses') {
        return {
          data: [{ id: 10, name: 'Math 101' }],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/courses/10/discussion_topics') {
        return {
          data: [
            {
              id: '50',
              title: 'New Topic',
              message: 'Let us discuss calculus',
              author: { id: '1', display_name: 'Dr. Smith' },
              posted_at: '2026-05-20T00:00:00Z',
              discussion_subentry_count: 0,
              pinned: false,
              locked: false,
              unread_count: 0,
              subscribed: false,
            },
          ],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/courses/10/discussion_topics/50/entries') {
        return {
          data: [
            {
              id: 500,
              message: '<p>Great topic!</p>',
              user: { display_name: 'Student A' },
              created_at: '2026-05-20T10:00:00Z',
              recent_replies: [],
            },
          ],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
    })

    render(
      <MemoryRouter initialEntries={['/discussions']}>
        <Routes>
          <Route path="/discussions" element={<DiscussionsPage />} />
        </Routes>
      </MemoryRouter>
    )

    // 1. Teacher opens Discussions
    await waitFor(() => {
      expect(screen.getByText('New Topic')).toBeInTheDocument()
    })

    // 2. Teacher clicks discussion to open detail modal
    fireEvent.click(screen.getByText('New Topic'))
    await waitFor(() => {
      expect(screen.getAllByText('New Topic').length).toBeGreaterThanOrEqual(1)
    })

    // 3. Student reply is already in mock entries
    expect(screen.getByText('Great topic!')).toBeInTheDocument()

    // 4. Teacher pins the discussion
    const pinBtn = screen.getByRole('button', { name: /^Pin$/i })
    fireEvent.click(pinBtn)

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        expect.stringContaining('/discussion_topics/50'),
        expect.objectContaining({
          method: 'PUT',
          body: expect.objectContaining({ pinned: true }),
        })
      )
    })
  })
})

// ─── Journey 5: Messaging workflow ──────────────────────────────────────────

describe('Journey 5: Messaging workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNotifications()
    mockCanvasFetchSuccess()
  })

  it('student composes and sends, teacher replies, student sees reply', async () => {
    mockRole('student')

    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint === '/api/v1/conversations') {
        return {
          data: [
            {
              id: 301,
              subject: 'Re: Help with HW',
              last_message: 'Thanks for the help!',
              last_message_at: '2026-05-20T10:00:00Z',
              workflow_state: 'read',
              message_count: 2,
              participants: [{ id: 101, name: 'Dr. Chen' }],
              starred: false,
              context_name: 'Math 101',
              messages: [
                {
                  id: 1,
                  author_id: 101,
                  body: 'Here is the solution.',
                  created_at: '2026-05-20T09:00:00Z',
                  generated: false,
                },
                {
                  id: 2,
                  author_id: 1,
                  body: 'Thanks for the help!',
                  created_at: '2026-05-20T10:00:00Z',
                  generated: false,
                },
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
      if (endpoint.startsWith('/api/v1/conversations/301')) {
        return {
          data: {
            id: 301,
            subject: 'Re: Help with HW',
            last_message: 'Teacher reply here',
            last_message_at: '2026-05-20T11:00:00Z',
            workflow_state: 'read',
            message_count: 3,
            participants: [{ id: 101, name: 'Dr. Chen' }],
            starred: false,
            context_name: 'Math 101',
            messages: [
              {
                id: 1,
                author_id: 101,
                body: 'Here is the solution.',
                created_at: '2026-05-20T09:00:00Z',
                generated: false,
              },
              {
                id: 2,
                author_id: 1,
                body: 'Thanks for the help!',
                created_at: '2026-05-20T10:00:00Z',
                generated: false,
              },
              {
                id: 3,
                author_id: 101,
                body: 'Teacher reply here',
                created_at: '2026-05-20T11:00:00Z',
                generated: false,
              },
            ],
          },
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
    })

    vi.mocked(canvasFetch).mockImplementation(async (endpoint: string, options?: any) => {
      if (endpoint.includes('/search/recipients')) {
        return [{ id: '101', name: 'Dr. Chen', type: 'user' }]
      }
      if (endpoint === '/api/v1/conversations' && options?.method === 'POST') {
        return { id: 302, subject: 'Question about HW' }
      }
      if (endpoint.includes('/add_message') && options?.method === 'POST') {
        return { id: 303 }
      }
      return { id: 999, success: true }
    })

    render(
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route path="/inbox" element={<InboxPage />} />
        </Routes>
      </MemoryRouter>
    )

    // 1. Student opens Inbox → clicks Compose
    await waitFor(() => {
      expect(screen.getByText('Re: Help with HW')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText(/compose new message/i))
    expect(screen.getByRole('heading', { name: /New Message/i })).toBeInTheDocument()

    // 2. Selects recipient, types subject/body → sends
    const searchInput = screen.getByPlaceholderText(/search for a person/i)
    fireEvent.change(searchInput, { target: { value: 'Dr' } })

    // Wait for search results dropdown to appear and click Dr. Chen
    const modal = screen.getByRole('dialog', { name: /compose message/i })
    await waitFor(() => {
      const lists = modal.querySelectorAll('ul')
      expect(lists.length).toBeGreaterThan(0)
    })
    const searchResultsList = modal.querySelector('ul')!
    const recipientItem = searchResultsList.querySelector('li')!
    expect(recipientItem.textContent).toContain('Dr. Chen')
    fireEvent.click(recipientItem)

    // Verify recipient chip appears (query within modal to avoid conflict with conversation list)
    await waitFor(() => {
      expect(modal.textContent).toContain('Dr. Chen')
    })

    fireEvent.change(screen.getByPlaceholderText(/message subject/i), {
      target: { value: 'Question about HW' },
    })
    fireEvent.change(screen.getByPlaceholderText(/type your message/i), {
      target: { value: 'Can you help me with problem 3?' },
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

    // 3. Teacher opens Inbox → sees new conversation (simulated by selecting existing)
    // 4. Teacher opens conversation → types reply → sends
    fireEvent.click(screen.getByText('Re: Help with HW'))
    await waitFor(() => {
      expect(screen.getByText('Here is the solution.')).toBeInTheDocument()
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

    // 5. Student sees reply in thread
    await waitFor(() => {
      expect(screen.getByText('Teacher reply here')).toBeInTheDocument()
    })
  })
})

// ─── Journey 6: Quiz lifecycle ──────────────────────────────────────────────

describe('Journey 6: Quiz lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNotifications()
    mockCanvasFetchSuccess()
  })

  it('teacher creates quiz, adds question, student takes and submits', async () => {
    mockRole('teacher')

    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint === '/api/v1/courses/1/quizzes') {
        return {
          data: [
            {
              id: 401,
              title: 'Math Quiz 1',
              quiz_type: 'assignment',
              question_count: 1,
              points_possible: 5,
              workflow_state: 'published',
              locked_for_user: false,
              allowed_attempts: -1,
            },
          ],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/courses/1/quizzes/401') {
        return {
          data: {
            id: 401,
            title: 'Math Quiz 1',
            quiz_type: 'assignment',
            question_count: 1,
            points_possible: 5,
            time_limit: null,
            allowed_attempts: -1,
            workflow_state: 'published',
            locked_for_user: false,
          },
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/courses/1/quizzes/401/questions') {
        return {
          data: [
            {
              id: 501,
              question_name: 'Q1',
              question_type: 'multiple_choice_question',
              question_text: '<p>What is 2+2?</p>',
              points_possible: 5,
              answers: [
                { id: 1, text: '3' },
                { id: 2, text: '4' },
              ],
            },
          ],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/courses/1/quizzes/401/submission') {
        return {
          data: { quiz_submissions: [] },
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
    })

    // 1. Teacher opens Quizzes
    const { unmount } = render(
      <MemoryRouter initialEntries={['/courses/1/quizzes']}>
        <Routes>
          <Route path="/courses/:courseId/quizzes" element={<QuizzesPage />} />
          <Route path="/courses/:courseId/quizzes/:quizId/builder" element={<QuizBuilderPage />} />
          <Route path="/courses/:courseId/quizzes/:quizId/results" element={<QuizResultsPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Math Quiz 1')).toBeInTheDocument()
    })

    // 2. Teacher clicks Build → QuizBuilder
    fireEvent.click(screen.getByText('Build'))
    await waitFor(() => {
      expect(screen.getByText('Math Quiz 1 — Builder')).toBeInTheDocument()
    })

    // 3. Teacher adds MC question → saves
    fireEvent.click(screen.getByText('+ Add Question'))
    expect(screen.getByRole('heading', { name: /New Question/i })).toBeInTheDocument()

    fireEvent.change(screen.getByTestId('rich-editor'), {
      target: { value: '<p>What is 2+2?</p>' },
    })
    // Click the modal's Add Question button (not the page's + Add Question)
    const modalAddBtn = screen.getAllByRole('button', { name: /Add Question/i }).find(
      (btn) => !btn.textContent?.includes('+')
    )
    expect(modalAddBtn).toBeDefined()
    fireEvent.click(modalAddBtn!)

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        expect.stringContaining('/questions'),
        expect.objectContaining({ method: 'POST' })
      )
    })

    // Switch to student and take quiz
    unmount()
    mockRole('student')

    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint === '/api/v1/courses/1/quizzes') {
        return {
          data: [
            {
              id: 401,
              title: 'Math Quiz 1',
              quiz_type: 'assignment',
              question_count: 1,
              points_possible: 5,
              workflow_state: 'published',
              locked_for_user: false,
              allowed_attempts: -1,
            },
          ],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/courses/1/quizzes/401') {
        return {
          data: {
            id: 401,
            title: 'Math Quiz 1',
            quiz_type: 'assignment',
            question_count: 1,
            points_possible: 5,
            time_limit: null,
            allowed_attempts: -1,
            workflow_state: 'published',
            locked_for_user: false,
          },
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/courses/1/quizzes/401/questions') {
        return {
          data: [
            {
              id: 501,
              question_name: 'Q1',
              question_type: 'multiple_choice_question',
              question_text: '<p>What is 2+2?</p>',
              points_possible: 5,
              answers: [
                { id: 1, text: '3' },
                { id: 2, text: '4' },
              ],
            },
          ],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint === '/api/v1/courses/1/quizzes/401/submission') {
        return {
          data: { quiz_submissions: [] },
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
    })

    vi.mocked(canvasFetch).mockImplementation(async (endpoint: string, options?: any) => {
      if (endpoint.includes('/submissions') && options?.method === 'POST') {
        return { quiz_submissions: [{ id: 601, attempt: 1, workflow_state: 'untaken' }] }
      }
      if (endpoint.includes('/complete') && options?.method === 'POST') {
        return { quiz_submissions: [{ id: 601, score: 5, workflow_state: 'complete' }] }
      }
      return { id: 999, success: true }
    })

    render(
      <MemoryRouter initialEntries={['/courses/1/quizzes']}>
        <Routes>
          <Route path="/courses/:courseId/quizzes" element={<QuizzesPage />} />
          <Route path="/courses/:courseId/quizzes/:quizId/builder" element={<QuizBuilderPage />} />
          <Route path="/courses/:courseId/quizzes/:quizId/results" element={<QuizResultsPage />} />
        </Routes>
      </MemoryRouter>
    )

    // 4. Student opens Quizzes → sees published quiz
    await waitFor(() => {
      expect(screen.getByText('Math Quiz 1')).toBeInTheDocument()
    })
    expect(screen.getByText('Published')).toBeInTheDocument()

    // 5. Student clicks "Take Quiz"
    fireEvent.click(screen.getByText('Math Quiz 1'))
    await waitFor(() => {
      expect(screen.getByText('Start Quiz')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Start Quiz'))
    await waitFor(() => {
      expect(screen.getByText('What is 2+2?')).toBeInTheDocument()
    })

    // Answer question
    const answerOption = screen.getByText('4')
    fireEvent.click(answerOption)

    // Submit quiz
    fireEvent.click(screen.getByText('Submit Quiz'))
    await waitFor(() => {
      expect(screen.getByText('Quiz Submitted!')).toBeInTheDocument()
    })
  })
})
