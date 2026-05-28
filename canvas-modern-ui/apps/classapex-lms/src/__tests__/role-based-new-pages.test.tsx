/**
 * Role-Based New Pages Tests
 * ============================
 * Verifies QuizResults, AssignmentGroups, CourseGroups,
 * CourseCatalog, and ExternalTools render correctly for every role,
 * including data display, search/filter, and CRUD visibility.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import QuizResults from '../pages/QuizResults'
import AssignmentGroups from '../pages/AssignmentGroups'
import CourseGroups from '../pages/CourseGroups'
import CourseCatalog from '../pages/CourseCatalog'
import ExternalTools from '../pages/ExternalTools'
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

// ─── Helpers ────────────────────────────────────────────────────────────────

const ROLES = ['student', 'teacher', 'admin', 'observer'] as const
const TEACHER_LIKE_ROLES = ['teacher', 'admin'] as const
const STUDENT_LIKE_ROLES = ['student', 'observer'] as const

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

// ─── QuizResults helpers ────────────────────────────────────────────────────

const MOCK_SUBMISSIONS = [
  {
    id: 1,
    score: 85,
    attempt: 1,
    time_spent: 1800,
    workflow_state: 'complete',
    user: { id: 101, name: 'Alice Student', login_id: 'alice@example.com' },
    submission_data: [
      { question_id: 1, text: '4', correct: true },
      { question_id: 2, text: 'Paris', correct: false },
    ],
  },
  {
    id: 2,
    score: 92,
    attempt: 1,
    time_spent: 2400,
    workflow_state: 'complete',
    user: { id: 102, name: 'Bob Student', login_id: 'bob@example.com' },
    submission_data: [
      { question_id: 1, text: '4', correct: true },
      { question_id: 2, text: 'London', correct: true },
    ],
  },
]

const MOCK_STATS = {
  submission_statistics: {
    unique_count: 2,
    points_possible: 100,
  },
}

function mockQuizResultsData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/submissions')) {
      return { data: MOCK_SUBMISSIONS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/statistics')) {
      return { data: MOCK_STATS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderQuizResults(role: string) {
  mockRole(role)
  mockNotifications()
  mockQuizResultsData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/quizzes/10/results']}>
      <Routes>
        <Route path="/courses/:courseId/quizzes/:quizId/results" element={<QuizResults />} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── AssignmentGroups helpers ───────────────────────────────────────────────

const MOCK_ASSIGNMENT_GROUPS = [
  { id: 1, name: 'Homework', group_weight: 40 },
  { id: 2, name: 'Exams', group_weight: 60 },
]

const MOCK_ASSIGNMENTS_FOR_GROUPS = [
  { id: 10, name: 'HW 1', assignment_group_id: 1 },
  { id: 11, name: 'HW 2', assignment_group_id: 1 },
  { id: 20, name: 'Midterm', assignment_group_id: 2 },
]

function mockAssignmentGroupsData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/assignment_groups')) {
      return { data: MOCK_ASSIGNMENT_GROUPS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/assignments')) {
      return { data: MOCK_ASSIGNMENTS_FOR_GROUPS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderAssignmentGroups(role: string) {
  mockRole(role)
  mockNotifications()
  mockAssignmentGroupsData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/assignment_groups']}>
      <Routes>
        <Route path="/courses/:courseId/assignment_groups" element={<AssignmentGroups />} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── CourseGroups helpers ───────────────────────────────────────────────────

const MOCK_GROUP_SETS = [
  { id: 1, name: 'Project Teams', self_signup: 'enabled', group_limit: 4 },
  { id: 2, name: 'Study Groups', self_signup: 'disabled', group_limit: 0 },
]

const MOCK_GROUPS = [
  {
    id: 10,
    name: 'Team Alpha',
    description: 'Alpha team',
    members_count: 2,
    max_membership: 4,
    users: [
      { id: 101, name: 'Alice Student' },
      { id: 102, name: 'Bob Student' },
    ],
  },
  {
    id: 11,
    name: 'Team Beta',
    description: 'Beta team',
    members_count: 1,
    max_membership: 4,
    users: [{ id: 103, name: 'Carol Student' }],
  },
]

const MOCK_STUDENTS = [
  { id: 104, name: 'Dave Student' },
  { id: 105, name: 'Eve Student' },
]

function mockCourseGroupsData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/group_categories') && !endpoint.includes('/groups')) {
      return { data: MOCK_GROUP_SETS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/group_categories/') && endpoint.includes('/groups')) {
      return { data: MOCK_GROUPS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/users?enrollment_type')) {
      return { data: MOCK_STUDENTS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderCourseGroups(role: string) {
  mockRole(role)
  mockNotifications()
  mockCourseGroupsData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/groups']}>
      <Routes>
        <Route path="/courses/:courseId/groups" element={<CourseGroups />} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── CourseCatalog helpers ──────────────────────────────────────────────────

const MOCK_COURSES = [
  {
    id: 1,
    name: 'Introduction to Computer Science',
    course_code: 'CS-101',
    workflow_state: 'available',
    term: { name: 'Fall 2026' },
    course_image: 'https://example.com/cs.jpg',
    total_students: 120,
    teachers: [{ display_name: 'Prof. Alan' }],
  },
  {
    id: 2,
    name: 'Advanced Calculus',
    course_code: 'MATH-301',
    workflow_state: 'available',
    term: { name: 'Fall 2026' },
    course_image: '',
    total_students: 45,
    teachers: [{ display_name: 'Prof. Beth' }],
  },
  {
    id: 3,
    name: 'Modern History',
    course_code: 'HIST-201',
    workflow_state: 'available',
    term: { name: 'Spring 2027' },
    course_image: '',
    total_students: 80,
    teachers: [{ display_name: 'Prof. Carl' }],
  },
]

function mockCourseCatalogData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/courses') {
      return { data: MOCK_COURSES, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderCourseCatalog() {
  mockNotifications()
  mockCourseCatalogData()
  return render(
    <MemoryRouter initialEntries={['/catalog']}>
      <CourseCatalog />
    </MemoryRouter>
  )
}

// ─── ExternalTools helpers ──────────────────────────────────────────────────

const MOCK_TOOLS = [
  {
    id: 1,
    name: 'Gradescope',
    description: 'Online grading platform',
    url: 'https://gradescope.com/lti',
    domain: 'gradescope.com',
    privacy_level: 'anonymous',
    consumer_key: 'gradescope-key',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Zoom',
    description: 'Video conferencing',
    url: 'https://zoom.us/lti',
    domain: 'zoom.us',
    privacy_level: 'public',
    consumer_key: 'zoom-key',
    created_at: '2026-02-01T00:00:00Z',
  },
]

const MOCK_DEVELOPER_KEYS: any[] = []

function mockExternalToolsData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/external_tools')) {
      return { data: MOCK_TOOLS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/developer_keys')) {
      return { data: MOCK_DEVELOPER_KEYS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderExternalTools(role: string) {
  mockRole(role)
  mockNotifications()
  mockExternalToolsData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/external_tools']}>
      <Routes>
        <Route path="/courses/:courseId/external_tools" element={<ExternalTools />} />
      </Routes>
    </MemoryRouter>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  QuizResults
// ═════════════════════════════════════════════════════════════════════════════

describe('QuizResults — Role-Based Access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders quiz results page with submissions', () => {
        renderQuizResults(role)
        expect(screen.getByText('Quiz Results')).toBeInTheDocument()
        expect(screen.getByText('Alice Student')).toBeInTheDocument()
        expect(screen.getByText('Bob Student')).toBeInTheDocument()
      })

      it('shows score, attempts, and time columns', () => {
        renderQuizResults(role)
        expect(screen.getByText('85')).toBeInTheDocument()
        expect(screen.getByText('92')).toBeInTheDocument()
        expect(screen.getByText('30m')).toBeInTheDocument() // 1800s -> 30m
      })

      it('shows class statistics (average, total submissions, high score)', () => {
        renderQuizResults(role)
        expect(screen.getByText('Total Submissions')).toBeInTheDocument()
        expect(screen.getByText('Average Score')).toBeInTheDocument()
        expect(screen.getByText('High Score')).toBeInTheDocument()
      })

      it('expands submission to show correct/incorrect answers', () => {
        renderQuizResults(role)
        const row = screen.getByText('Alice Student').closest('tr')
        if (row) fireEvent.click(row)
        expect(screen.getByText('Submission Details')).toBeInTheDocument()
        expect(screen.getByText('Correct')).toBeInTheDocument()
        expect(screen.getByText('Incorrect')).toBeInTheDocument()
      })

      it('filters by student name via search input', () => {
        renderQuizResults(role)
        const input = screen.getByPlaceholderText('Search student name...')
        fireEvent.change(input, { target: { value: 'alice' } })
        expect(screen.getByText('Alice Student')).toBeInTheDocument()
        expect(screen.queryByText('Bob Student')).not.toBeInTheDocument()
      })

      it('filters by needs-grading checkbox', () => {
        renderQuizResults(role)
        const checkbox = screen.getByLabelText('Only needs grading')
        fireEvent.click(checkbox)
        expect(screen.getByText('No submissions match your filters.')).toBeInTheDocument()
      })
    })
  })

  STUDENT_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('shows student own result view', () => {
        renderQuizResults(role)
        expect(screen.getByText('Quiz Results')).toBeInTheDocument()
        // Students see their own submission result, not a permission-denied message
        expect(screen.getByText('Score')).toBeInTheDocument()
      })
    })
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  AssignmentGroups
// ═════════════════════════════════════════════════════════════════════════════

describe('AssignmentGroups — Role-Based Access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders assignment groups with weights', () => {
        renderAssignmentGroups(role)
        expect(screen.getByText('Assignment Groups')).toBeInTheDocument()
        expect(screen.getByText('Homework')).toBeInTheDocument()
        expect(screen.getByText('Exams')).toBeInTheDocument()
      })

      it('shows assignment counts within groups', () => {
        renderAssignmentGroups(role)
        expect(screen.getByText(/2 assignments/)).toBeInTheDocument()
        expect(screen.getByText(/1 assignments?/)).toBeInTheDocument()
      })

      it('shows weight configuration banner', () => {
        renderAssignmentGroups(role)
        expect(screen.getByText(/Total Weight:/)).toBeInTheDocument()
      })

      it('shows "+ New Group" button for teachers', () => {
        renderAssignmentGroups(role)
        expect(screen.getByText('+ New Group')).toBeInTheDocument()
      })

      it('shows Edit and Delete buttons for each group', () => {
        renderAssignmentGroups(role)
        const editButtons = screen.getAllByText('Edit')
        const deleteButtons = screen.getAllByText('Delete')
        expect(editButtons.length).toBeGreaterThanOrEqual(2)
        expect(deleteButtons.length).toBeGreaterThanOrEqual(2)
      })

      it('opens new group modal when clicking + New Group', () => {
        renderAssignmentGroups(role)
        fireEvent.click(screen.getByText('+ New Group'))
        expect(screen.getByRole('heading', { name: /New Assignment Group/i })).toBeInTheDocument()
      })
    })
  })

  STUDENT_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('shows permission denied message', () => {
        renderAssignmentGroups(role)
        expect(screen.getByText('You do not have permission.')).toBeInTheDocument()
      })
    })
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  CourseGroups
// ═════════════════════════════════════════════════════════════════════════════

describe('CourseGroups — Role-Based Access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders group sets list', () => {
        renderCourseGroups(role)
        expect(screen.getByText('Course Groups')).toBeInTheDocument()
        expect(screen.getByText('Project Teams')).toBeInTheDocument()
        expect(screen.getByText('Study Groups')).toBeInTheDocument()
      })

      it('shows "+ New Group Set" button', () => {
        renderCourseGroups(role)
        expect(screen.getByText('+ New Group Set')).toBeInTheDocument()
      })

      it('shows groups after clicking a group set', () => {
        renderCourseGroups(role)
        fireEvent.click(screen.getByText('Project Teams'))
        expect(screen.getByText('Team Alpha')).toBeInTheDocument()
        expect(screen.getByText('Team Beta')).toBeInTheDocument()
      })

      it('shows group members', () => {
        renderCourseGroups(role)
        fireEvent.click(screen.getByText('Project Teams'))
        expect(screen.getByText('Alice Student')).toBeInTheDocument()
        expect(screen.getByText('Bob Student')).toBeInTheDocument()
      })

      it('shows "+ New Group" button inside selected set', () => {
        renderCourseGroups(role)
        fireEvent.click(screen.getByText('Project Teams'))
        expect(screen.getByText('+ New Group')).toBeInTheDocument()
      })
    })
  })

  STUDENT_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('shows permission denied message', () => {
        renderCourseGroups(role)
        expect(screen.getByText('You do not have permission to manage course groups.')).toBeInTheDocument()
      })
    })
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  CourseCatalog
// ═════════════════════════════════════════════════════════════════════════════

describe('CourseCatalog — All Roles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders course catalog with courses', () => {
    renderCourseCatalog()
    expect(screen.getByText('Introduction to Computer Science')).toBeInTheDocument()
    expect(screen.getByText('Advanced Calculus')).toBeInTheDocument()
    expect(screen.getByText('Modern History')).toBeInTheDocument()
  })

  it('shows course count', () => {
    renderCourseCatalog()
    expect(screen.getByText(/3 courses found/)).toBeInTheDocument()
  })

  it('search filters courses by name', () => {
    renderCourseCatalog()
    const input = screen.getByPlaceholderText(/Search courses/)
    fireEvent.change(input, { target: { value: 'Calculus' } })
    expect(screen.getByText('Advanced Calculus')).toBeInTheDocument()
    expect(screen.queryByText('Introduction to Computer Science')).not.toBeInTheDocument()
    expect(screen.queryByText('Modern History')).not.toBeInTheDocument()
  })

  it('search filters courses by code', () => {
    renderCourseCatalog()
    const input = screen.getByPlaceholderText(/Search courses/)
    fireEvent.change(input, { target: { value: 'HIST' } })
    expect(screen.getByText('Modern History')).toBeInTheDocument()
    expect(screen.queryByText('Advanced Calculus')).not.toBeInTheDocument()
  })

  it('shows "Enroll" button for each course', () => {
    renderCourseCatalog()
    const enrollButtons = screen.getAllByText('Enroll')
    expect(enrollButtons.length).toBe(3)
  })

  it('shows term filter dropdown with available terms', () => {
    renderCourseCatalog()
    const termSelect = screen.getByLabelText('Filter by term')
    fireEvent.change(termSelect, { target: { value: 'Fall 2026' } })
    expect(screen.getByText('Introduction to Computer Science')).toBeInTheDocument()
    expect(screen.getByText('Advanced Calculus')).toBeInTheDocument()
    expect(screen.queryByText('Modern History')).not.toBeInTheDocument()
  })

  it('shows empty state when search matches nothing', () => {
    renderCourseCatalog()
    const input = screen.getByPlaceholderText(/Search courses/)
    fireEvent.change(input, { target: { value: 'xyznonexistent' } })
    expect(screen.getByText('No courses match your search')).toBeInTheDocument()
  })

  it('toggles between grid and list view', () => {
    renderCourseCatalog()
    const listButton = screen.getByLabelText('List view')
    fireEvent.click(listButton)
    expect(screen.getByText('Introduction to Computer Science')).toBeInTheDocument()
    const gridButton = screen.getByLabelText('Grid view')
    fireEvent.click(gridButton)
    expect(screen.getByText('Introduction to Computer Science')).toBeInTheDocument()
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  ExternalTools
// ═════════════════════════════════════════════════════════════════════════════

describe('ExternalTools — Role-Based Access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders tool list with names and descriptions', () => {
        renderExternalTools(role)
        expect(screen.getByText('LTI Integrations & SCORM Hub')).toBeInTheDocument()
        expect(screen.getByText('Gradescope')).toBeInTheDocument()
        expect(screen.getByText('Zoom')).toBeInTheDocument()
        expect(screen.getByText('Online grading platform')).toBeInTheDocument()
      })

      it('shows "Add LTI App" button for teachers', () => {
        renderExternalTools(role)
        expect(screen.getByText(/Add LTI App/)).toBeInTheDocument()
      })

      it('shows Launch App button for each tool', () => {
        renderExternalTools(role)
        const launchButtons = screen.getAllByText(/Launch App/)
        expect(launchButtons.length).toBe(2)
      })

      it('shows Delete button for each tool', () => {
        renderExternalTools(role)
        const deleteButtons = screen.getAllByText('Delete')
        expect(deleteButtons.length).toBe(2)
      })

      it('opens add-tool modal when clicking Add LTI App', () => {
        renderExternalTools(role)
        fireEvent.click(screen.getByText(/Add LTI App/))
        expect(screen.getByText('Configure External LTI App')).toBeInTheDocument()
      })

      it('shows privacy level badges', () => {
        renderExternalTools(role)
        expect(screen.getByText('anonymous')).toBeInTheDocument()
        expect(screen.getByText('public')).toBeInTheDocument()
      })
    })
  })

  STUDENT_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders tool list but does NOT show Add LTI App button', () => {
        renderExternalTools(role)
        expect(screen.getByText('Gradescope')).toBeInTheDocument()
        expect(screen.queryByText(/Add LTI App/)).not.toBeInTheDocument()
      })

      it('shows Launch App buttons', () => {
        renderExternalTools(role)
        const launchButtons = screen.getAllByText(/Launch App/)
        expect(launchButtons.length).toBe(2)
      })

      it('does NOT show Delete buttons', () => {
        renderExternalTools(role)
        expect(screen.queryByText('Delete')).not.toBeInTheDocument()
      })
    })
  })
})
