/**
 * Role-Based Misc Tests
 * =====================
 * Tests for ObserverDashboard, Syllabus, Rubrics, Outcomes, Notifications, Planner
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import ObserverDashboard from '../pages/ObserverDashboard'
import SyllabusPage from '../pages/Syllabus'
import RubricsPage from '../pages/Rubrics'
import OutcomesPage from '../pages/Outcomes'
import NotificationsPage from '../pages/Notifications'
import PlannerPage from '../pages/Planner'

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

vi.mock('../components/RichEditor', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }: any) => (
    <textarea value={value || ''} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder} />
  ),
}))

vi.mock('../pages/RubricEditModal', () => ({
  __esModule: true,
  default: () => <div data-testid="rubric-edit-modal">Rubric Edit Modal</div>,
}))

vi.mock('../pages/OutcomeEditModal', () => ({
  __esModule: true,
  default: () => <div data-testid="outcome-edit-modal">Outcome Edit Modal</div>,
}))

// ─── Constants & Helpers ────────────────────────────────────────────────────

const ROLES = ['student', 'teacher', 'admin', 'observer'] as const
const TEACHER_LIKE_ROLES = ['teacher', 'admin'] as const

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

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_OBSERVEES = [{ id: '1', name: 'Alice Student' }]

const MOCK_ENROLLMENTS = [
  {
    id: 1,
    type: 'StudentEnrollment',
    course_id: 101,
    grades: { current_grade: 'A', current_score: 95 },
  },
]

const MOCK_MISSING_SUBMISSIONS = [
  { id: 1, name: 'Missing Homework', due_at: '2026-05-20T23:59:59Z' },
]

const MOCK_COURSE = {
  id: 1,
  name: 'Test Course',
  syllabus_body: '<p>Welcome to the course!</p>',
}

const MOCK_ASSIGNMENTS = [
  {
    id: 1,
    name: 'Assignment 1',
    due_at: '2026-06-01T23:59:59Z',
    html_url: '/courses/1/assignments/1',
  },
]

const MOCK_EVENTS = [
  {
    id: 1,
    title: 'Class Event',
    start_at: '2026-06-02T10:00:00Z',
    html_url: '/courses/1/calendar_events/1',
  },
]

const MOCK_RUBRICS = [
  {
    id: 1,
    title: 'Essay Rubric',
    context_type: 'Course',
    points_possible: 20,
    reusable: false,
    free_form_criterion_comments: false,
    criteria: [
      {
        id: 'c1',
        description: 'Thesis',
        long_description: 'Quality of thesis statement',
        points: 10,
        ratings: [
          { id: 'r1', description: 'Excellent', points: 10 },
          { id: 'r2', description: 'Poor', points: 5 },
        ],
      },
    ],
  },
]

const MOCK_OUTCOME_GROUPS = [
  { id: 1, title: 'Math Standards', outcomes_count: 2, subgroups_count: 0 },
]

const MOCK_OUTCOMES = [
  {
    id: 1,
    title: 'Algebra Mastery',
    display_name: 'Algebra',
    description: '<p>Can solve linear equations</p>',
    mastery_points: 3,
    points_possible: 4,
    ratings: [
      { description: 'Exceeds', points: 4, mastery: true },
      { description: 'Meets', points: 3, mastery: true },
      { description: 'Below', points: 2, mastery: false },
    ],
    calculation_method: 'highest',
  },
]

const MOCK_OUTCOME_ROLLUPS = {
  rollups: [
    {
      scores: [
        { outcome: { id: 1, title: 'Algebra Mastery' }, score: 3.5, count: 1, links: { outcome: '1' } },
        { outcome: { id: 1, title: 'Algebra Mastery' }, score: 4, count: 1, links: { outcome: '1' } },
      ],
      links: { user: '1', section: '1', status: 'active' },
    },
  ],
}

const MOCK_STREAM_ITEMS = [
  {
    id: 1,
    title: 'New Assignment',
    message: '<p>Check out the new assignment</p>',
    type: 'Submission',
    read_state: false,
    created_at: '2026-05-24T10:00:00Z',
    html_url: '/courses/1/assignments/1',
    course_id: 1,
  },
  {
    id: 2,
    title: 'Announcement',
    message: '<p>Important news</p>',
    type: 'Announcement',
    read_state: true,
    created_at: '2026-05-23T10:00:00Z',
    html_url: '/courses/1/announcements/1',
    course_id: 1,
  },
]

const MOCK_PLANNER_ITEMS = [
  {
    plannable_id: 1,
    plannable_type: 'assignment',
    plannable: {
      id: 1,
      title: 'Math HW',
      due_at: new Date(Date.now() + 86400000).toISOString(),
      points_possible: 10,
      course_id: 1,
      created_at: '2026-05-20T00:00:00Z',
    },
    context_name: 'Math 101',
    course_id: 1,
    planner_override: null,
    submissions: null,
    html_url: '/courses/1/assignments/1',
  },
  {
    plannable_id: 2,
    plannable_type: 'assignment',
    plannable: {
      id: 2,
      title: 'Overdue Essay',
      due_at: new Date(Date.now() - 86400000).toISOString(),
      points_possible: 50,
      course_id: 1,
      created_at: '2026-05-15T00:00:00Z',
    },
    context_name: 'English 101',
    course_id: 1,
    planner_override: null,
    submissions: null,
    html_url: '/courses/1/assignments/2',
  },
  {
    plannable_id: 3,
    plannable_type: 'calendar_event',
    plannable: {
      id: 3,
      title: 'Study Session',
      due_at: new Date(Date.now() + 2 * 86400000).toISOString(),
      points_possible: null,
      course_id: 1,
      created_at: '2026-05-20T00:00:00Z',
    },
    context_name: 'Math 101',
    course_id: 1,
    planner_override: null,
    submissions: null,
    html_url: '/courses/1/calendar_events/3',
  },
]

// ─── Mock Setup Helpers ─────────────────────────────────────────────────────

function mockObserverDashboardData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string | null) => {
    if (!endpoint) return { data: null, isLoading: false, refetch: vi.fn() } as any
    if (endpoint.includes('/api/v1/users/self/observees')) {
      return { data: MOCK_OBSERVEES, isLoading: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/enrollments')) {
      return { data: MOCK_ENROLLMENTS, isLoading: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/missing_submissions')) {
      return { data: MOCK_MISSING_SUBMISSIONS, isLoading: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, refetch: vi.fn() } as any
  })
}

function mockSyllabusData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string | null) => {
    if (!endpoint) return { data: null, isLoading: false, refetch: vi.fn() } as any
    if (endpoint.includes('/api/v1/courses/1/assignments')) {
      return { data: MOCK_ASSIGNMENTS, isLoading: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/api/v1/calendar_events')) {
      return { data: MOCK_EVENTS, isLoading: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/api/v1/courses/1')) {
      return { data: MOCK_COURSE, isLoading: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, refetch: vi.fn() } as any
  })
}

function mockRubricsData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string | null) => {
    if (!endpoint) return { data: null, isLoading: false, refetch: vi.fn() } as any
    if (endpoint.includes('/api/v1/courses/1/rubrics/1')) {
      return { data: MOCK_RUBRICS[0], isLoading: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/api/v1/courses/1/rubrics')) {
      return { data: MOCK_RUBRICS, isLoading: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, refetch: vi.fn() } as any
  })
}

function mockOutcomesData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string | null) => {
    if (!endpoint) return { data: null, isLoading: false, refetch: vi.fn() } as any
    if (endpoint.includes('/outcome_rollups')) {
      return { data: MOCK_OUTCOME_ROLLUPS, isLoading: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/outcome_groups/') && endpoint.includes('/outcomes')) {
      return { data: MOCK_OUTCOMES, isLoading: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/outcome_groups')) {
      return { data: MOCK_OUTCOME_GROUPS, isLoading: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, refetch: vi.fn() } as any
  })
}

function mockNotificationsData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string | null) => {
    if (!endpoint) return { data: null, isLoading: false, refetch: vi.fn() } as any
    if (endpoint.includes('/api/v1/users/self/activity_stream')) {
      return { data: MOCK_STREAM_ITEMS, isLoading: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, refetch: vi.fn() } as any
  })
}

function mockPlannerData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string | null) => {
    if (!endpoint) return { data: null, isLoading: false, refetch: vi.fn() } as any
    if (endpoint.includes('/api/v1/planner/items')) {
      return { data: MOCK_PLANNER_ITEMS, isLoading: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, refetch: vi.fn() } as any
  })
}

// ─── Render Helpers ─────────────────────────────────────────────────────────

function renderObserverDashboard() {
  mockNotifications()
  mockObserverDashboardData()
  return render(
    <MemoryRouter>
      <ObserverDashboard />
    </MemoryRouter>
  )
}

function renderSyllabus() {
  mockNotifications()
  mockSyllabusData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/syllabus']}>
      <Routes>
        <Route path="/courses/:courseId/syllabus" element={<SyllabusPage />} />
      </Routes>
    </MemoryRouter>
  )
}

function renderRubrics(role: string) {
  mockRole(role)
  mockNotifications()
  mockRubricsData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/rubrics']}>
      <Routes>
        <Route path="/courses/:courseId/rubrics" element={<RubricsPage />} />
      </Routes>
    </MemoryRouter>
  )
}

function renderOutcomes(role: string) {
  mockRole(role)
  mockNotifications()
  mockOutcomesData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/outcomes']}>
      <Routes>
        <Route path="/courses/:courseId/outcomes" element={<OutcomesPage />} />
      </Routes>
    </MemoryRouter>
  )
}

function renderNotifications() {
  mockNotifications()
  mockNotificationsData()
  return render(
    <MemoryRouter>
      <NotificationsPage />
    </MemoryRouter>
  )
}

function renderPlanner() {
  mockPlannerData()
  return render(
    <MemoryRouter>
      <PlannerPage />
    </MemoryRouter>
  )
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('ObserverDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders for observer role', () => {
    renderObserverDashboard()
    expect(screen.getByText('Observer Dashboard')).toBeInTheDocument()
  })

  it('shows linked student courses', () => {
    renderObserverDashboard()
    // 'Alice Student' appears in sidebar, select dropdown, and heading
    expect(screen.getAllByText('Alice Student').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Current Courses')).toBeInTheDocument()
    expect(screen.getByText('Course ID: 101')).toBeInTheDocument()
  })

  it('shows grades summary', () => {
    renderObserverDashboard()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('95%')).toBeInTheDocument()
  })

  it('shows missing assignments', () => {
    renderObserverDashboard()
    expect(screen.getByText(/Missing Assignments/)).toBeInTheDocument()
    expect(screen.getByText('Missing Homework')).toBeInTheDocument()
  })
})

describe('Syllabus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders syllabus body', () => {
    renderSyllabus()
    expect(screen.getByText('Welcome to the course!')).toBeInTheDocument()
  })

  it('shows assignment list', () => {
    renderSyllabus()
    expect(screen.getByText('Course Summary')).toBeInTheDocument()
    expect(screen.getByText('Assignment 1')).toBeInTheDocument()
  })

  it('Edit button is visible', () => {
    renderSyllabus()
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('edit mode renders RichEditor', () => {
    renderSyllabus()
    fireEvent.click(screen.getByText('Edit'))
    expect(screen.getByPlaceholderText('Write course syllabus here...')).toBeInTheDocument()
  })

  it('Save button calls canvasFetch', async () => {
    vi.mocked(canvasFetch).mockResolvedValue({})
    renderSyllabus()
    fireEvent.click(screen.getByText('Edit'))
    const textarea = screen.getByPlaceholderText('Write course syllabus here...')
    fireEvent.change(textarea, { target: { value: '<p>Updated syllabus</p>' } })
    fireEvent.click(screen.getByText('Save'))
    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/courses/1'),
        expect.objectContaining({ method: 'PUT' })
      )
    })
  })
})

describe('Rubrics — all roles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders rubric list', () => {
        renderRubrics(role)
        expect(screen.getByText('Essay Rubric')).toBeInTheDocument()
      })

      it('shows criteria and ratings', () => {
        renderRubrics(role)
        fireEvent.click(screen.getByText('Essay Rubric'))
        expect(screen.getByText('Thesis')).toBeInTheDocument()
        expect(screen.getByText('Quality of thesis statement')).toBeInTheDocument()
        expect(screen.getByText('20 pts total')).toBeInTheDocument()
        expect(screen.getAllByText('Excellent').length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('Poor').length).toBeGreaterThanOrEqual(1)
      })
    })
  })
})

describe('Rubrics — teacher/admin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('Add Rubric button visible', () => {
        renderRubrics(role)
        expect(screen.getByText('+ New Rubric')).toBeInTheDocument()
      })

      it('create modal opens', () => {
        renderRubrics(role)
        fireEvent.click(screen.getByText('+ New Rubric'))
        expect(screen.getByTestId('rubric-edit-modal')).toBeInTheDocument()
      })
    })
  })
})

describe('Outcomes — all roles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders outcomes list', () => {
        renderOutcomes(role)
        fireEvent.click(screen.getByText('Math Standards'))
        expect(screen.getByText('Algebra Mastery')).toBeInTheDocument()
      })

      it('shows mastery thresholds', () => {
        renderOutcomes(role)
        fireEvent.click(screen.getByText('Math Standards'))
        expect(screen.getByText(/Mastery at 3 pts/)).toBeInTheDocument()
      })
    })
  })
})

describe('Outcomes — teacher/admin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('Add Outcome button visible', () => {
        renderOutcomes(role)
        fireEvent.click(screen.getByText('Math Standards'))
        expect(screen.getByText('+ New Outcome')).toBeInTheDocument()
      })

      it('create modal opens', () => {
        renderOutcomes(role)
        fireEvent.click(screen.getByText('Math Standards'))
        fireEvent.click(screen.getByText('+ New Outcome'))
        expect(screen.getByTestId('outcome-edit-modal')).toBeInTheDocument()
      })
    })
  })
})

describe('Outcomes — student', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mastery progress indicators visible', () => {
    renderOutcomes('student')
    fireEvent.click(screen.getByText('Math Standards'))
    fireEvent.click(screen.getByText('Algebra Mastery'))
    expect(screen.getByText('Proficiency Scale')).toBeInTheDocument()
    expect(screen.getAllByText('★ Mastery').length).toBeGreaterThanOrEqual(2)
  })

  it('class performance stats render with rollup data', () => {
    renderOutcomes('student')
    fireEvent.click(screen.getByText('Math Standards'))
    fireEvent.click(screen.getByText('Algebra Mastery'))
    expect(screen.getByText('Class Performance')).toBeInTheDocument()
    expect(screen.getByText('Students Mastered')).toBeInTheDocument()
  })
})

describe('Notifications — all roles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders notification stream', () => {
    renderNotifications()
    expect(screen.getByText('New Assignment')).toBeInTheDocument()
    expect(screen.getAllByText('Announcement').length).toBeGreaterThanOrEqual(1)
  })

  it('toggle switches visible', () => {
    renderNotifications()
    expect(screen.getByText('Unread only')).toBeInTheDocument()
  })

  it('Mark All Read button visible when unread items exist', () => {
    renderNotifications()
    expect(screen.getByText(/Mark All Read/)).toBeInTheDocument()
  })

  it('mark read button calls canvasFetch', async () => {
    vi.mocked(canvasFetch).mockResolvedValue({})
    renderNotifications()
    const markReadButton = screen.getByTitle('Mark as read')
    fireEvent.click(markReadButton)
    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/users/self/activity_stream/1'),
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })
})

describe('Planner — all roles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockResolvedValue({ ok: true })
  })

  it('renders weekly planner', () => {
    renderPlanner()
    expect(screen.getByText(/tasks completed/)).toBeInTheDocument()
  })

  it('shows assignments and events', () => {
    renderPlanner()
    expect(screen.getByText('Math HW')).toBeInTheDocument()
    expect(screen.getByText('Study Session')).toBeInTheDocument()
  })

  it('overdue items highlighted', () => {
    renderPlanner()
    expect(screen.getAllByText('Overdue').length).toBeGreaterThanOrEqual(3)
    expect(screen.getByText('Overdue Essay')).toBeInTheDocument()
  })

  it('mark complete checkbox works', () => {
    renderPlanner()
    const checkButton = screen.getAllByLabelText('Mark complete')[0]
    fireEvent.click(checkButton)
    expect(screen.getByLabelText('Mark incomplete')).toBeInTheDocument()
  })
})
