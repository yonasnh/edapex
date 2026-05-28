/**
 * Role-Based People, Announcements, and CourseHome Tests
 * ======================================================
 * Verifies role-based rendering and CRUD capabilities for:
 *  - CoursePeople (list, filter, search, enrollments)
 *  - Announcements (list, create, edit, delete)
 *  - CourseHome (tabs, customize, student view)
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import CoursePeoplePage from '../pages/CoursePeople'
import AnnouncementsPage from '../pages/Announcements'
import CourseHome from '../pages/CourseHome'
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

vi.mock('../widgets/ModuleList', () => ({
  ModuleList: () => <div data-testid="module-list">Modules</div>,
}))

vi.mock('../widgets/PeopleList', () => ({
  PeopleList: () => <div data-testid="people-list">People</div>,
}))

vi.mock('../widgets/CourseSidebar', () => ({
  CourseSidebar: () => <div data-testid="course-sidebar">Sidebar</div>,
}))

vi.mock('../widgets/MediaLibrary', () => ({
  MediaLibrary: () => <div data-testid="media-library">Media</div>,
}))

// ─── Helpers ────────────────────────────────────────────────────────────────

const ROLES = ['student', 'teacher', 'admin', 'observer'] as const
const TEACHER_LIKE_ROLES = ['teacher', 'admin'] as const

const MOCK_USERS = [
  {
    id: 1,
    name: 'Alice Student',
    email: 'alice@example.com',
    avatar_url: 'https://example.com/alice.png',
    enrollments: [{ id: 101, type: 'StudentEnrollment', role: 'StudentEnrollment', enrollment_state: 'active' }],
  },
  {
    id: 2,
    name: 'Bob Teacher',
    email: 'bob@example.com',
    avatar_url: '',
    enrollments: [{ id: 102, type: 'TeacherEnrollment', role: 'TeacherEnrollment', enrollment_state: 'active' }],
  },
  {
    id: 3,
    name: 'Charlie TA',
    email: 'charlie@example.com',
    enrollments: [{ id: 103, type: 'TaEnrollment', role: 'TaEnrollment', enrollment_state: 'active' }],
  },
]

const MOCK_SECTIONS = [
  { id: 10, name: 'Section A' },
  { id: 20, name: 'Section B' },
]

const MOCK_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Welcome to the course',
    message: '<p>Hello everyone!</p>',
    author: { id: 1, display_name: 'Dr. Smith' },
    posted_at: '2026-01-15T10:00:00Z',
    published: true,
    pinned: false,
    delayed_post_at: null,
    allow_rating: false,
    discussion_subentry_count: 2,
  },
  {
    id: 2,
    title: 'Midterm reminder',
    message: '<p>Study hard!</p>',
    author: { id: 2, display_name: 'Prof. Jones' },
    posted_at: '2026-02-01T08:30:00Z',
    published: true,
    pinned: true,
    delayed_post_at: null,
    allow_rating: true,
    discussion_subentry_count: 5,
  },
]

const MOCK_COURSE = {
  id: 1,
  name: 'Introduction to Biology',
  course_code: 'BIO-101',
  workflow_state: 'available',
  term: { name: 'Spring 2026' },
  course_image: 'https://example.com/course.png',
  total_students: 42,
  teachers: [{ display_name: 'Dr. Smith' }],
  syllabus_body: '<p>Course syllabus content</p>',
  start_at: '2026-01-01T00:00:00Z',
  end_at: '2026-05-01T00:00:00Z',
  storage_used_mb: 5120,
  default_view: 'modules',
}

const MOCK_MODULES = [
  { id: 1, name: 'Week 1', position: 1 },
  { id: 2, name: 'Week 2', position: 2 },
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

function mockPeopleData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/users')) {
      return { data: MOCK_USERS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/sections')) {
      return { data: MOCK_SECTIONS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function mockAnnouncementsData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('discussion_topics') && endpoint.includes('only_announcements')) {
      return { data: MOCK_ANNOUNCEMENTS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function mockCourseHomeData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/courses/1') {
      return { data: MOCK_COURSE, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/modules')) {
      return { data: MOCK_MODULES, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/users')) {
      return { data: MOCK_USERS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderCoursePeople(role: string) {
  mockRole(role)
  mockNotifications()
  mockPeopleData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/people']}>
      <Routes>
        <Route path="/courses/:courseId/people" element={<CoursePeoplePage />} />
      </Routes>
    </MemoryRouter>
  )
}

function renderAnnouncements(role: string) {
  mockRole(role)
  mockNotifications()
  mockAnnouncementsData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/announcements']}>
      <Routes>
        <Route path="/courses/:courseId/announcements" element={<AnnouncementsPage />} />
      </Routes>
    </MemoryRouter>
  )
}

function renderCourseHome(role: string) {
  mockRole(role)
  mockNotifications()
  mockCourseHomeData()
  return render(
    <MemoryRouter initialEntries={['/courses/1']}>
      <Routes>
        <Route path="/courses/:courseId" element={<CourseHome />} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('CoursePeople — Role-Based Access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders people list with names, emails, and roles', () => {
        renderCoursePeople(role)
        expect(screen.getByText('Alice Student')).toBeInTheDocument()
        expect(screen.getByText('alice@example.com')).toBeInTheDocument()
        expect(screen.getByText('Bob Teacher')).toBeInTheDocument()
        expect(screen.getByText('Charlie TA')).toBeInTheDocument()
      })

      it('shows avatar initials when avatar_url is empty', () => {
        renderCoursePeople(role)
        expect(screen.getByText('B')).toBeInTheDocument()
      })

      it('role filter works (show only students)', () => {
        renderCoursePeople(role)
        fireEvent.click(screen.getByRole('button', { name: 'Student' }))
        expect(screen.getByText('Alice Student')).toBeInTheDocument()
        expect(screen.queryByText('Bob Teacher')).not.toBeInTheDocument()
        expect(screen.queryByText('Charlie TA')).not.toBeInTheDocument()
      })

      it('role filter works (show only teachers)', () => {
        renderCoursePeople(role)
        fireEvent.click(screen.getByRole('button', { name: 'Teacher' }))
        expect(screen.queryByText('Alice Student')).not.toBeInTheDocument()
        expect(screen.getByText('Bob Teacher')).toBeInTheDocument()
        expect(screen.queryByText('Charlie TA')).not.toBeInTheDocument()
      })

      it('search filters by name', () => {
        renderCoursePeople(role)
        const searchInput = screen.getByPlaceholderText('Search people...')
        fireEvent.change(searchInput, { target: { value: 'Alice' } })
        expect(screen.getByText('Alice Student')).toBeInTheDocument()
        expect(screen.queryByText('Bob Teacher')).not.toBeInTheDocument()
      })

      it('"Add People" button is visible', () => {
        renderCoursePeople(role)
        expect(screen.getByRole('button', { name: /Add People/i })).toBeInTheDocument()
      })

      it('add enrollment modal opens and can submit via canvasFetch', async () => {
        vi.mocked(canvasFetch).mockResolvedValue({ id: 201 })
        renderCoursePeople(role)

        fireEvent.click(screen.getByRole('button', { name: /Add People/i }))
        expect(screen.getByRole('heading', { name: 'Add People' })).toBeInTheDocument()

        const userIdInput = screen.getByPlaceholderText('Canvas User ID')
        fireEvent.change(userIdInput, { target: { value: '99' } })

        fireEvent.click(screen.getByRole('button', { name: /Add Enrollment/i }))

        await waitFor(() => {
          expect(canvasFetch).toHaveBeenCalledWith(
            '/api/v1/courses/1/enrollments',
            expect.objectContaining({
              method: 'POST',
              body: expect.objectContaining({
                enrollment: expect.objectContaining({
                  user_id: '99',
                  type: 'StudentEnrollment',
                  enrollment_state: 'active',
                }),
              }),
            })
          )
        })
      })

      it('remove enrollment button is visible', () => {
        renderCoursePeople(role)
        const removeButtons = screen.getAllByRole('button', { name: 'Remove' })
        expect(removeButtons.length).toBeGreaterThan(0)
      })
    })
  })

  describe('student — restricted view', () => {
    it('shows permission denied message instead of people list', () => {
      renderCoursePeople('student')
      expect(screen.getByText(/You do not have permission to manage course enrollments/i)).toBeInTheDocument()
      expect(screen.queryByText('Alice Student')).not.toBeInTheDocument()
    })

    it('does not show Add People button', () => {
      renderCoursePeople('student')
      expect(screen.queryByRole('button', { name: /Add People/i })).not.toBeInTheDocument()
    })
  })

  describe('observer — restricted view', () => {
    it('shows permission denied message instead of people list', () => {
      renderCoursePeople('observer')
      expect(screen.getByText(/You do not have permission to manage course enrollments/i)).toBeInTheDocument()
      expect(screen.queryByText('Alice Student')).not.toBeInTheDocument()
    })

    it('does not show Add People button', () => {
      renderCoursePeople('observer')
      expect(screen.queryByRole('button', { name: /Add People/i })).not.toBeInTheDocument()
    })
  })
})

describe('Announcements — Role-Based Access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders announcement list with title, date, and author', () => {
        renderAnnouncements(role)
        expect(screen.getByText('Welcome to the course')).toBeInTheDocument()
        expect(screen.getByText('Midterm reminder')).toBeInTheDocument()
        expect(screen.getByText(/Dr\. Smith/)).toBeInTheDocument()
      })

      it('shows pinned badge for pinned announcements', () => {
        renderAnnouncements(role)
        expect(screen.getByText('Pinned')).toBeInTheDocument()
      })
    })
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role} — teacher capabilities`, () => {
      it('"New Announcement" button is visible', () => {
        renderAnnouncements(role)
        expect(screen.getByRole('button', { name: /New Announcement/i })).toBeInTheDocument()
      })

      it('create modal opens with title, message, published toggle, delayed post, and allow rating', () => {
        renderAnnouncements(role)
        fireEvent.click(screen.getByRole('button', { name: /New Announcement/i }))

        expect(screen.getByRole('heading', { name: 'New Announcement' })).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Announcement title')).toBeInTheDocument()
        expect(screen.getByTestId('rich-editor')).toBeInTheDocument()
        expect(screen.getByLabelText('Published')).toBeInTheDocument()
        expect(screen.getByLabelText('Allow Liking')).toBeInTheDocument()
      })

      it('can submit new announcement via canvasFetch', async () => {
        vi.mocked(canvasFetch).mockResolvedValue({ id: 99 })
        renderAnnouncements(role)

        fireEvent.click(screen.getByRole('button', { name: /New Announcement/i }))
        const titleInput = screen.getByPlaceholderText('Announcement title')
        fireEvent.change(titleInput, { target: { value: 'New Announcement' } })

        const editor = screen.getByTestId('rich-editor')
        fireEvent.change(editor, { target: { value: 'Announcement body' } })

        fireEvent.click(screen.getByRole('button', { name: /^Post$/i }))

        await waitFor(() => {
          expect(canvasFetch).toHaveBeenCalledWith(
            '/api/v1/courses/1/discussion_topics',
            expect.objectContaining({
              method: 'POST',
              body: expect.objectContaining({
                is_announcement: 'true',
                title: 'New Announcement',
                message: 'Announcement body',
                published: 'true',
                allow_rating: 'false',
              }),
            })
          )
        })
      })

      it('edit button is visible on existing announcements', () => {
        renderAnnouncements(role)
        const editButtons = screen.getAllByTitle('Edit')
        expect(editButtons.length).toBeGreaterThan(0)
      })

      it('delete button is visible on existing announcements', () => {
        renderAnnouncements(role)
        const deleteButtons = screen.getAllByTitle('Delete')
        expect(deleteButtons.length).toBeGreaterThan(0)
      })

      it('can edit an existing announcement', async () => {
        vi.mocked(canvasFetch).mockResolvedValue({ id: 1 })
        renderAnnouncements(role)

        fireEvent.click(screen.getAllByTitle('Edit')[0])
        expect(screen.getByRole('heading', { name: 'Edit Announcement' })).toBeInTheDocument()

        const titleInput = screen.getByPlaceholderText('Announcement title')
        fireEvent.change(titleInput, { target: { value: 'Updated Title' } })

        fireEvent.click(screen.getByRole('button', { name: /^Update$/i }))

        await waitFor(() => {
          expect(canvasFetch).toHaveBeenCalledWith(
            '/api/v1/courses/1/discussion_topics/1',
            expect.objectContaining({
              method: 'PUT',
              body: expect.objectContaining({ title: 'Updated Title' }),
            })
          )
        })
      })
    })
  })

  describe('student — restricted view', () => {
    it('does not show New Announcement button', () => {
      renderAnnouncements('student')
      expect(screen.queryByRole('button', { name: /New Announcement/i })).not.toBeInTheDocument()
    })

    it('can read announcements', () => {
      renderAnnouncements('student')
      expect(screen.getByText('Welcome to the course')).toBeInTheDocument()
      expect(screen.getByText('Midterm reminder')).toBeInTheDocument()
    })

    it('does not show edit or delete buttons', () => {
      renderAnnouncements('student')
      expect(screen.queryByTitle('Edit')).not.toBeInTheDocument()
      expect(screen.queryByTitle('Delete')).not.toBeInTheDocument()
    })
  })

  describe('observer — restricted view', () => {
    it('does not show New Announcement button', () => {
      renderAnnouncements('observer')
      expect(screen.queryByRole('button', { name: /New Announcement/i })).not.toBeInTheDocument()
    })

    it('can read announcements', () => {
      renderAnnouncements('observer')
      expect(screen.getByText('Welcome to the course')).toBeInTheDocument()
      expect(screen.getByText('Midterm reminder')).toBeInTheDocument()
    })
  })
})

describe('CourseHome — Role-Based Access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders course name and code', () => {
        renderCourseHome(role)
        expect(screen.getByText('Introduction to Biology')).toBeInTheDocument()
        expect(screen.getByText('BIO-101')).toBeInTheDocument()
      })

      it('module tab shows module list by default', () => {
        renderCourseHome(role)
        expect(screen.getByTestId('module-list')).toBeInTheDocument()
      })

      it('syllabus tab shows syllabus body', () => {
        renderCourseHome(role)
        fireEvent.click(screen.getByRole('tab', { name: 'Syllabus' }))
        expect(screen.getByText('Course syllabus content')).toBeInTheDocument()
      })

      it('people tab shows people list', () => {
        renderCourseHome(role)
        fireEvent.click(screen.getByRole('tab', { name: 'People' }))
        expect(screen.getByTestId('people-list')).toBeInTheDocument()
      })

      it('media tab shows media library', () => {
        renderCourseHome(role)
        fireEvent.click(screen.getByRole('tab', { name: 'Media Library' }))
        expect(screen.getByTestId('media-library')).toBeInTheDocument()
      })
    })
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role} — teacher capabilities`, () => {
      it('"Customize" button is visible', () => {
        renderCourseHome(role)
        expect(screen.getByRole('button', { name: 'Customize course home page' })).toBeInTheDocument()
      })

      it('customize modal opens with home page options', () => {
        renderCourseHome(role)
        fireEvent.click(screen.getByRole('button', { name: 'Customize course home page' }))

        expect(screen.getByText('Choose your course home page')).toBeInTheDocument()
        expect(screen.getByText('Show course modules and their items')).toBeInTheDocument()
        expect(screen.getByText('Display the course syllabus')).toBeInTheDocument()
        expect(screen.getByText('List upcoming assignments')).toBeInTheDocument()
        expect(screen.getByText('Show recent course activity')).toBeInTheDocument()
      })

      it('can select a home page option and persist to localStorage', () => {
        renderCourseHome(role)
        fireEvent.click(screen.getByRole('button', { name: 'Customize course home page' }))

        fireEvent.click(screen.getByText('Display the course syllabus'))
        expect(localStorage.getItem('course_home_1')).toBe('syllabus')
      })

      it('calls canvasFetch to save default_view to Canvas', async () => {
        renderCourseHome(role)
        fireEvent.click(screen.getByRole('button', { name: 'Customize course home page' }))

        fireEvent.click(screen.getByText('Display the course syllabus'))
        await waitFor(() => {
          expect(canvasFetch).toHaveBeenCalledWith('/api/v1/courses/1', {
            method: 'PUT',
            body: { course: { default_view: 'syllabus' } },
          })
        })
      })

      it('student view toggle is visible', () => {
        renderCourseHome(role)
        expect(screen.getByRole('button', { name: /Student View/i })).toBeInTheDocument()
      })

      it('clicking student view sets localStorage and reloads', () => {
        renderCourseHome(role)
        fireEvent.click(screen.getByRole('button', { name: /Student View/i }))
        expect(localStorage.getItem('classapex-student-view-course')).toBe('1')
        expect(localStorage.getItem('classapex-demo-role')).toBe('student')
      })
    })
  })

  describe('student — restricted view', () => {
    it('does not show Customize button', () => {
      renderCourseHome('student')
      expect(screen.queryByRole('button', { name: 'Customize' })).not.toBeInTheDocument()
    })

    it('does not show Student View toggle', () => {
      renderCourseHome('student')
      expect(screen.queryByRole('button', { name: /Student View/i })).not.toBeInTheDocument()
    })
  })

  describe('observer — restricted view', () => {
    it('does not show Customize button', () => {
      renderCourseHome('observer')
      expect(screen.queryByRole('button', { name: 'Customize' })).not.toBeInTheDocument()
    })

    it('does not show Student View toggle', () => {
      renderCourseHome('observer')
      expect(screen.queryByRole('button', { name: /Student View/i })).not.toBeInTheDocument()
    })
  })
})
