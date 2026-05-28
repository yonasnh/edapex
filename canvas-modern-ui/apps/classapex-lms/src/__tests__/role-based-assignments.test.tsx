/**
 * Role-Based Assignments Tests
 * =============================
 * Verifies AssignmentList and AssignmentDetail render correctly
 * for every role, including search, filters, sort, and CRUD.
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import AssignmentList from '../pages/AssignmentList'
import AssignmentDetail from '../pages/AssignmentDetail'
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

vi.mock('../pages/AssignmentEditModal', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="edit-modal">
      <button>Save</button>
    </div>
  ),
}))

vi.mock('../widgets/SubmissionStatus', () => ({
  SubmissionStatus: ({ status }: any) => (
    <span data-testid="submission-status">{status}</span>
  ),
}))

vi.mock('../widgets/SubmissionForm', () => ({
  SubmissionForm: ({ onSubmit }: any) => (
    <div data-testid="submission-form">
      <button
        onClick={() =>
          onSubmit?.({
            submission_type: 'online_text_entry',
            body: 'My answer',
          })
        }
      >
        Submit
      </button>
    </div>
  ),
}))

// ─── Helpers ────────────────────────────────────────────────────────────────

const ROLES = ['student', 'teacher', 'admin', 'observer'] as const
const TEACHER_LIKE_ROLES = ['teacher', 'admin'] as const

const MOCK_ASSIGNMENTS = [
  {
    id: 101,
    name: 'Math Homework',
    points_possible: 10,
    due_at: '2026-06-01T23:59:59Z',
    course_id: 1,
    submission: { submitted: true, score: 9 },
  },
  {
    id: 102,
    name: 'History Essay',
    points_possible: 50,
    due_at: '2026-05-20T23:59:59Z',
    course_id: 1,
    submission: null,
  },
  {
    id: 103,
    name: 'Science Lab',
    points_possible: 25,
    due_at: '2026-05-25T23:59:59Z',
    course_id: 1,
    submission: { submitted: false },
  },
  {
    id: 104,
    name: 'Art Project',
    points_possible: 100,
    due_at: '2026-07-01T23:59:59Z',
    course_id: 1,
    submission: { submitted: true, score: 95 },
  },
]

const MOCK_ASSIGNMENT_DETAIL = {
  id: 101,
  name: 'Math Homework',
  description: '<p>Solve problems 1-10</p>',
  points_possible: 10,
  due_at: '2026-06-01T23:59:59Z',
  submission_types: ['online_text_entry'],
  submission: null,
}

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

function mockAssignmentListData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/api/v1/courses/1/assignments')) {
      return {
        data: MOCK_ASSIGNMENTS,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function mockAssignmentDetailData(overrides: any = {}) {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/assignments/101')) {
      return {
        data: { ...MOCK_ASSIGNMENT_DETAIL, ...overrides },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderAssignmentList(role: string) {
  mockRole(role)
  mockNotifications()
  mockAssignmentListData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/assignments']}>
      <Routes>
        <Route path="/courses/:courseId/assignments" element={<AssignmentList />} />
      </Routes>
    </MemoryRouter>
  )
}

function renderAssignmentDetail(role: string, overrides: any = {}) {
  mockRole(role)
  mockNotifications()
  mockAssignmentDetailData(overrides)
  return render(
    <MemoryRouter initialEntries={['/courses/1/assignments/101']}>
      <Routes>
        <Route
          path="/courses/:courseId/assignments/:assignmentId"
          element={<AssignmentDetail />}
        />
      </Routes>
    </MemoryRouter>
  )
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('AssignmentList — Role-Based Access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders assignment list with title, points, due date', () => {
        renderAssignmentList(role)

        expect(screen.getByText('Math Homework')).toBeInTheDocument()
        expect(screen.getByText('History Essay')).toBeInTheDocument()
        expect(screen.getByText('10 pts')).toBeInTheDocument()
        expect(screen.getByText('50 pts')).toBeInTheDocument()
        expect(screen.getAllByText(/Due:/).length).toBeGreaterThanOrEqual(1)
      })

      it('search filters assignments', () => {
        renderAssignmentList(role)

        const searchInput = screen.getByPlaceholderText(/search assignments/i)
        fireEvent.change(searchInput, { target: { value: 'History' } })

        expect(screen.queryByText('Math Homework')).not.toBeInTheDocument()
        expect(screen.getByText('History Essay')).toBeInTheDocument()
      })

      it('status filter works (submitted)', () => {
        renderAssignmentList(role)

        const filterSelect = screen.getByLabelText(/filter by status/i)
        fireEvent.change(filterSelect, { target: { value: 'submitted' } })

        expect(screen.getByText('Math Homework')).toBeInTheDocument()
        expect(screen.getByText('Art Project')).toBeInTheDocument()
        expect(screen.queryByText('History Essay')).not.toBeInTheDocument()
        expect(screen.queryByText('Science Lab')).not.toBeInTheDocument()
      })

      it('status filter works (graded)', () => {
        renderAssignmentList(role)

        const filterSelect = screen.getByLabelText(/filter by status/i)
        fireEvent.change(filterSelect, { target: { value: 'graded' } })

        expect(screen.getByText('Math Homework')).toBeInTheDocument()
        expect(screen.getByText('Art Project')).toBeInTheDocument()
        expect(screen.queryByText('History Essay')).not.toBeInTheDocument()
        expect(screen.queryByText('Science Lab')).not.toBeInTheDocument()
      })

      it('status filter works (overdue)', () => {
        const realDateNow = Date.now
        Date.now = vi.fn(() => new Date('2026-05-22T12:00:00Z').getTime())

        renderAssignmentList(role)

        const filterSelect = screen.getByLabelText(/filter by status/i)
        fireEvent.change(filterSelect, { target: { value: 'overdue' } })

        expect(screen.getByText('History Essay')).toBeInTheDocument()
        expect(screen.queryByText('Math Homework')).not.toBeInTheDocument()
        expect(screen.queryByText('Science Lab')).not.toBeInTheDocument()

        Date.now = realDateNow
      })

      it('status filter works (due soon)', () => {
        const realDateNow = Date.now
        Date.now = vi.fn(() => new Date('2026-05-25T12:00:00Z').getTime())

        renderAssignmentList(role)

        const filterSelect = screen.getByLabelText(/filter by status/i)
        fireEvent.change(filterSelect, { target: { value: 'due_soon' } })

        expect(screen.getByText('Science Lab')).toBeInTheDocument()
        expect(screen.queryByText('Math Homework')).not.toBeInTheDocument()
        expect(screen.queryByText('History Essay')).not.toBeInTheDocument()

        Date.now = realDateNow
      })

      it('status filter works (open)', () => {
        renderAssignmentList(role)

        const filterSelect = screen.getByLabelText(/filter by status/i)
        fireEvent.change(filterSelect, { target: { value: 'open' } })

        expect(screen.getByText('Math Homework')).toBeInTheDocument()
        expect(screen.getByText('Art Project')).toBeInTheDocument()
        expect(screen.queryByText('History Essay')).not.toBeInTheDocument()
        expect(screen.queryByText('Science Lab')).not.toBeInTheDocument()
      })

      it('sort by due date', () => {
        renderAssignmentList(role)

        const cards = document.querySelectorAll('.cx-assignment-card__name')
        const names = Array.from(cards).map((c) => c.textContent)
        expect(names).toEqual([
          'History Essay',
          'Science Lab',
          'Math Homework',
          'Art Project',
        ])
      })

      it('sort by name', () => {
        renderAssignmentList(role)

        const sortSelect = screen.getByLabelText(/sort by/i)
        fireEvent.change(sortSelect, { target: { value: 'name' } })

        const cards = document.querySelectorAll('.cx-assignment-card__name')
        const names = Array.from(cards).map((c) => c.textContent)
        expect(names).toEqual([
          'Art Project',
          'History Essay',
          'Math Homework',
          'Science Lab',
        ])
      })

      it('sort by points', () => {
        renderAssignmentList(role)

        const sortSelect = screen.getByLabelText(/sort by/i)
        fireEvent.change(sortSelect, { target: { value: 'points_possible' } })

        const cards = document.querySelectorAll('.cx-assignment-card__name')
        const names = Array.from(cards).map((c) => c.textContent)
        expect(names).toEqual([
          'Art Project',
          'History Essay',
          'Science Lab',
          'Math Homework',
        ])
      })
    })
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role} — teacher capabilities`, () => {
      it('"New Assignment" button is visible', () => {
        renderAssignmentList(role)
        expect(screen.getByText('+ New Assignment')).toBeInTheDocument()
      })

      it('create modal opens', () => {
        renderAssignmentList(role)
        fireEvent.click(screen.getByText('+ New Assignment'))
        expect(screen.getByTestId('edit-modal')).toBeInTheDocument()
      })

      it('edit modal opens on existing assignment', () => {
        renderAssignmentList(role)
        const editButtons = screen.getAllByTitle('Edit')
        expect(editButtons.length).toBeGreaterThan(0)
        fireEvent.click(editButtons[0])
        expect(screen.getByTestId('edit-modal')).toBeInTheDocument()
      })
    })
  })
})

describe('AssignmentDetail — Role-Based Access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders assignment details', () => {
        renderAssignmentDetail(role)
        expect(screen.getByText('Math Homework')).toBeInTheDocument()
        expect(screen.getByText(/Solve problems 1-10/)).toBeInTheDocument()
      })

      it('shows points possible', () => {
        renderAssignmentDetail(role)
        expect(screen.getByText('10 points')).toBeInTheDocument()
      })
    })
  })

  describe('student / observer — submission flow', () => {
    it('shows submission status', () => {
      renderAssignmentDetail('student')
      expect(screen.getByTestId('submission-status')).toBeInTheDocument()
    })

    it('"Start Submission" button is visible', () => {
      renderAssignmentDetail('student')
      expect(screen.getByText('Start Submission')).toBeInTheDocument()
    })

    it('SubmissionForm widget renders when clicked', () => {
      renderAssignmentDetail('student')
      fireEvent.click(screen.getByText('Start Submission'))
      expect(screen.getByTestId('submission-form')).toBeInTheDocument()
    })
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role} — teacher capabilities`, () => {
      it('"Edit Assignment" button is visible', () => {
        renderAssignmentDetail(role)
        expect(screen.getByTitle('Edit Assignment')).toBeInTheDocument()
      })
    })
  })
})
