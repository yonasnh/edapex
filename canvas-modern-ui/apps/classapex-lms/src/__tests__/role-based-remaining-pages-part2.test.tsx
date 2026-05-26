/**
 * Role-Based Remaining Pages Tests — Part 2
 * ==========================================
 * Verifies QuestionBanks, PeerReviews, Waitlist, CustomGradebookColumns,
 * GradingQueue, LatePolicy, LearningMasteryGradebook, and Attendance
 * render correctly with mocked data and role-based behavior.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import QuestionBanksPage from '../pages/QuestionBanks'
import PeerReviewsPage from '../pages/PeerReviews'
import WaitlistPage from '../pages/Waitlist'
import CustomGradebookColumnsPage from '../pages/CustomGradebookColumns'
import GradingQueuePage from '../pages/GradingQueue'
import LatePolicyPage from '../pages/LatePolicy'
import LearningMasteryGradebookPage from '../pages/LearningMasteryGradebook'
import AttendancePage from '../pages/Attendance'

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

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── QuestionBanks helpers ───────────────────────────────────────────────────

const MOCK_BANKS = [
  { id: 1, title: 'Bank A', question_count: 5 },
  { id: 2, title: 'Bank B', question_count: 12 },
]

const MOCK_QUESTIONS = [
  { id: 101, question_name: 'Q1', question_type: 'multiple_choice', question_text: '<p>What is 2+2?</p>', points_possible: 5 },
]

function mockQuestionBanksData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/assessment_question_banks') && !endpoint.includes('/assessment_questions')) {
      return { data: MOCK_BANKS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/assessment_questions')) {
      return { data: MOCK_QUESTIONS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderQuestionBanks(role: string) {
  mockRole(role)
  mockNotifications()
  mockQuestionBanksData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/question-banks']}>
      <Routes>
        <Route path="/courses/:courseId/question-banks" element={<QuestionBanksPage />} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── PeerReviews helpers ─────────────────────────────────────────────────────

const MOCK_PEER_REVIEWS = [
  { id: 1, user_id: 10, assessor_id: 20, asset_id: 100, workflow_state: 'assigned', user_name: 'Alice', assessor_name: 'Bob' },
  { id: 2, user_id: 20, assessor_id: 10, asset_id: 101, workflow_state: 'completed', user_name: 'Bob', assessor_name: 'Alice' },
]

const MOCK_SUBMISSIONS_FOR_REVIEWS = [
  { id: 100, user_id: 10 },
  { id: 101, user_id: 20 },
]

const MOCK_ASSIGNMENT_FOR_REVIEWS = { id: 1, name: 'Essay Draft' }

function mockPeerReviewsData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/peer_reviews')) {
      return { data: MOCK_PEER_REVIEWS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/submissions') && !endpoint.includes('/peer_reviews')) {
      return { data: MOCK_SUBMISSIONS_FOR_REVIEWS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/assignments/') && !endpoint.includes('/submissions') && !endpoint.includes('/peer_reviews')) {
      return { data: MOCK_ASSIGNMENT_FOR_REVIEWS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderPeerReviews(role: string) {
  mockRole(role)
  mockNotifications()
  mockPeerReviewsData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/assignments/1/peer-reviews']}>
      <Routes>
        <Route path="/courses/:courseId/assignments/:assignmentId/peer-reviews" element={<PeerReviewsPage />} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── Waitlist helpers ────────────────────────────────────────────────────────

const MOCK_WAITLISTED = [
  { id: 1, user_id: 101, course_id: 1, type: 'StudentEnrollment', enrollment_state: 'invited', user: { id: 101, name: 'Alice Smith', sortable_name: 'Smith, Alice', short_name: 'Alice', email: 'alice@example.com' }, created_at: '2026-05-01T00:00:00Z' },
  { id: 2, user_id: 102, course_id: 1, type: 'StudentEnrollment', enrollment_state: 'creation_pending', user: { id: 102, name: 'Bob Jones', sortable_name: 'Jones, Bob', short_name: 'Bob', email: 'bob@example.com' }, created_at: '2026-05-02T00:00:00Z' },
]

function mockWaitlistData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/enrollments')) {
      return { data: MOCK_WAITLISTED, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderWaitlist(role: string) {
  mockRole(role)
  mockNotifications()
  mockWaitlistData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/waitlist']}>
      <Routes>
        <Route path="/courses/:courseId/waitlist" element={<WaitlistPage />} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── CustomGradebookColumns helpers ──────────────────────────────────────────

const MOCK_COLUMNS = [
  { id: 1, title: 'Participation', position: 1, hidden: false, teacher_notes: false },
  { id: 2, title: 'Notes', position: 2, hidden: true, teacher_notes: true },
]

function mockCustomColumnsData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/custom_gradebook_columns')) {
      return { data: MOCK_COLUMNS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderCustomColumns(role: string) {
  mockRole(role)
  mockNotifications()
  mockCustomColumnsData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/custom-gradebook-columns']}>
      <Routes>
        <Route path="/courses/:courseId/custom-gradebook-columns" element={<CustomGradebookColumnsPage />} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── GradingQueue helpers ────────────────────────────────────────────────────

const MOCK_COURSES_FOR_GRADING = [
  { id: 1, name: 'Math 101' },
  { id: 2, name: 'History 201' },
]

const MOCK_SUBMISSIONS_FOR_GRADING = [
  { id: 1, user_id: 1, user: { id: 1, name: 'Alice' }, assignment_id: 10, assignment: { id: 10, name: 'Homework 1', points_possible: 100, course_id: 1 }, workflow_state: 'submitted', submitted_at: '2026-05-20T10:00:00Z', score: null, grade: null, late: false, missing: false, attempt: 1 },
  { id: 2, user_id: 2, user: { id: 2, name: 'Bob' }, assignment_id: 10, assignment: { id: 10, name: 'Homework 1', points_possible: 100, course_id: 1 }, workflow_state: 'submitted', submitted_at: '2026-05-19T10:00:00Z', score: null, grade: null, late: true, missing: false, attempt: 1 },
  { id: 3, user_id: 3, user: { id: 3, name: 'Carol' }, assignment_id: 11, assignment: { id: 11, name: 'Quiz 1', points_possible: 50, course_id: 1 }, workflow_state: 'graded', submitted_at: '2026-05-18T10:00:00Z', score: 45, grade: '45', late: false, missing: false, attempt: 2 },
]

function mockGradingQueueData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/courses') {
      return { data: MOCK_COURSES_FOR_GRADING, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/students/submissions')) {
      return { data: MOCK_SUBMISSIONS_FOR_GRADING, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/rubrics/')) {
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderGradingQueue() {
  mockNotifications()
  mockGradingQueueData()
  return render(<GradingQueuePage />)
}

// ─── LatePolicy helpers ──────────────────────────────────────────────────────

const MOCK_LATE_POLICY = {
  late_policy: {
    missing_submission_deduction_enabled: true,
    missing_submission_deduction_type: 'percentage',
    missing_submission_deduction_amount: 100,
    late_submission_deduction_enabled: true,
    late_submission_deduction_type: 'percentage',
    late_submission_deduction_amount: 10,
    late_submission_interval: 'day',
    late_submission_minimum_percent_enabled: false,
    late_submission_minimum_percent: 0,
  }
}

const MOCK_ASSIGNMENTS_FOR_LATE_POLICY = [
  { id: 1, name: 'Homework 1' },
  { id: 2, name: 'Quiz 1' },
]

function mockLatePolicyData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/late_policy')) {
      return { data: MOCK_LATE_POLICY, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/assignments')) {
      return { data: MOCK_ASSIGNMENTS_FOR_LATE_POLICY, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderLatePolicy(role: string) {
  mockRole(role)
  mockNotifications()
  mockLatePolicyData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/late-policy']}>
      <Routes>
        <Route path="/courses/:courseId/late-policy" element={<LatePolicyPage />} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── LearningMasteryGradebook helpers ────────────────────────────────────────

const MOCK_OUTCOMES = [
  { id: 1, title: 'Critical Thinking', mastery_points: 3 },
  { id: 2, title: 'Communication', mastery_points: 3 },
]

const MOCK_ROLLUPS = [
  { links: { user: 10, user_name: 'Alice' }, scores: [{ links: { outcome: 1 }, score: 3.5 }, { links: { outcome: 2 }, score: 2.0 }] },
  { links: { user: 11, user_name: 'Bob' }, scores: [{ links: { outcome: 1 }, score: 2.0 }, { links: { outcome: 2 }, score: null }] },
]

function mockLearningMasteryData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/outcome_rollups')) {
      return { data: { rollups: MOCK_ROLLUPS }, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/outcomes')) {
      return { data: MOCK_OUTCOMES, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderLearningMastery(role: string) {
  mockRole(role)
  mockLearningMasteryData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/learning-mastery']}>
      <Routes>
        <Route path="/courses/:courseId/learning-mastery" element={<LearningMasteryGradebookPage />} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── Attendance helpers ──────────────────────────────────────────────────────

const MOCK_STUDENTS_FOR_ATTENDANCE = [
  { id: 1, name: 'Alice', avatar_url: '' },
  { id: 2, name: 'Bob', avatar_url: '' },
]

const MOCK_ASSIGNMENTS_FOR_ATTENDANCE = [
  { id: 99, name: 'Roll Call Attendance', points_possible: 100 },
  { id: 100, name: 'Homework 1', points_possible: 100 },
]

const MOCK_SUBMISSIONS_FOR_ATTENDANCE = [
  { user_id: 1, grade: '100', score: 100 },
  { user_id: 2, grade: '0', score: 0 },
]

function mockAttendanceData(hasAttendanceAssignment = true) {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string | null) => {
    if (!endpoint) {
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/users') && !endpoint.includes('/assignments')) {
      return { data: MOCK_STUDENTS_FOR_ATTENDANCE, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/submissions')) {
      return { data: MOCK_SUBMISSIONS_FOR_ATTENDANCE, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/assignments')) {
      return { data: hasAttendanceAssignment ? MOCK_ASSIGNMENTS_FOR_ATTENDANCE : [{ id: 100, name: 'Homework 1', points_possible: 100 }], isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderAttendance(hasAttendanceAssignment = true) {
  mockNotifications()
  mockAttendanceData(hasAttendanceAssignment)
  return render(
    <MemoryRouter initialEntries={['/courses/1/attendance']}>
      <Routes>
        <Route path="/courses/:courseId/attendance" element={<AttendancePage />} />
      </Routes>
    </MemoryRouter>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  QuestionBanks
// ═════════════════════════════════════════════════════════════════════════════

describe('QuestionBanks — Quiz Question Reuse Repository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing for teacher', () => {
    renderQuestionBanks('teacher')
    expect(screen.getByRole('heading', { name: /Question Banks/i })).toBeInTheDocument()
  })

  it('shows mocked question banks', () => {
    renderQuestionBanks('teacher')
    expect(screen.getByText('Bank A')).toBeInTheDocument()
    expect(screen.getByText('Bank B')).toBeInTheDocument()
    expect(screen.getByText('5 questions')).toBeInTheDocument()
    expect(screen.getByText('12 questions')).toBeInTheDocument()
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    it(`shows CRUD buttons for ${role}`, () => {
      renderQuestionBanks(role)
      expect(screen.getByRole('button', { name: /New Bank/i })).toBeInTheDocument()
      const editButtons = screen.getAllByRole('button', { name: '✎' })
      const deleteButtons = screen.getAllByRole('button', { name: '🗑' })
      expect(editButtons.length).toBe(MOCK_BANKS.length)
      expect(deleteButtons.length).toBe(MOCK_BANKS.length)
    })
  })

  STUDENT_LIKE_ROLES.forEach((role) => {
    it(`shows read-only view for ${role}`, () => {
      renderQuestionBanks(role)
      expect(screen.queryByRole('button', { name: /New Bank/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Delete/i })).not.toBeInTheDocument()
    })
  })

  it('opens new bank modal when clicking New Bank', () => {
    renderQuestionBanks('teacher')
    fireEvent.click(screen.getByRole('button', { name: /New Bank/i }))
    expect(screen.getByRole('heading', { name: /New Question Bank/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  PeerReviews
// ═════════════════════════════════════════════════════════════════════════════

describe('PeerReviews — Peer Review Assignments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    renderPeerReviews('teacher')
    expect(screen.getByRole('heading', { name: /Peer Reviews/i })).toBeInTheDocument()
  })

  it('shows mocked peer review data', () => {
    renderPeerReviews('teacher')
    expect(screen.getByText(/Reviewer: Bob/i)).toBeInTheDocument()
    expect(screen.getByText(/Reviewer: Alice/i)).toBeInTheDocument()
    expect(screen.getByText(/Essay Draft/i)).toBeInTheDocument()
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    it(`shows status badges for ${role}`, () => {
      renderPeerReviews(role)
      expect(screen.getByText('assigned')).toBeInTheDocument()
      expect(screen.getByText('completed')).toBeInTheDocument()
    })
  })

  STUDENT_LIKE_ROLES.forEach((role) => {
    it(`shows submit review button for non-completed reviews for ${role}`, () => {
      renderPeerReviews(role)
      expect(screen.getByRole('button', { name: /Submit Review/i })).toBeInTheDocument()
    })
  })

  it('opens submit review modal when clicking Submit Review', () => {
    renderPeerReviews('student')
    fireEvent.click(screen.getByRole('button', { name: /Submit Review/i }))
    expect(screen.getByRole('heading', { name: /Submit Peer Review/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/0-100/i)).toBeInTheDocument()
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  Waitlist
// ═════════════════════════════════════════════════════════════════════════════

describe('Waitlist — Course Waitlist Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing for teacher', () => {
    renderWaitlist('teacher')
    expect(screen.getByRole('heading', { name: /Waitlist/i })).toBeInTheDocument()
  })

  it('shows mocked waitlisted students', () => {
    renderWaitlist('teacher')
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    it(`shows Promote and Remove buttons for ${role}`, () => {
      renderWaitlist(role)
      const promoteButtons = screen.getAllByRole('button', { name: /Promote/i })
      const removeButtons = screen.getAllByRole('button', { name: /Remove/i })
      expect(promoteButtons.length).toBeGreaterThanOrEqual(2)
      expect(removeButtons.length).toBeGreaterThanOrEqual(2)
    })
  })

  STUDENT_LIKE_ROLES.forEach((role) => {
    it(`shows permission denied for ${role}`, () => {
      renderWaitlist(role)
      expect(screen.getByText(/You do not have permission/i)).toBeInTheDocument()
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  CustomGradebookColumns
// ═════════════════════════════════════════════════════════════════════════════

describe('CustomGradebookColumns — Teacher Custom Gradebook Columns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing for teacher', () => {
    renderCustomColumns('teacher')
    expect(screen.getByRole('heading', { name: /Custom Gradebook Columns/i })).toBeInTheDocument()
  })

  it('shows mocked custom columns', () => {
    renderCustomColumns('teacher')
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Participation')).toBeInTheDocument()
    expect(screen.getByText('Notes')).toBeInTheDocument()
    expect(screen.getByText('Teacher Notes')).toBeInTheDocument()
    expect(screen.getByText('Hidden')).toBeInTheDocument()
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    it(`shows New Column and edit/delete buttons for ${role}`, () => {
      renderCustomColumns(role)
      expect(screen.getByRole('button', { name: /New Column/i })).toBeInTheDocument()
      const editButtons = screen.getAllByRole('button', { name: /Edit/i })
      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i })
      expect(editButtons.length).toBe(MOCK_COLUMNS.length)
      expect(deleteButtons.length).toBe(MOCK_COLUMNS.length)
    })
  })

  STUDENT_LIKE_ROLES.forEach((role) => {
    it(`shows permission denied for ${role}`, () => {
      renderCustomColumns(role)
      expect(screen.getByText(/You do not have permission/i)).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /New Column/i })).not.toBeInTheDocument()
    })
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  GradingQueue
// ═════════════════════════════════════════════════════════════════════════════

describe('GradingQueue — SpeedGrader Queue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    renderGradingQueue()
    expect(screen.getByRole('heading', { name: /Grading Queue/i })).toBeInTheDocument()
  })

  it('shows mocked submissions', () => {
    renderGradingQueue()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Carol')).toBeInTheDocument()
    expect(screen.getAllByText('Homework 1').length).toBe(2)
    expect(screen.getByText('Quiz 1')).toBeInTheDocument()
  })

  it('filters submissions by status', () => {
    renderGradingQueue()
    const pendingFilter = screen.getByRole('button', { name: /Pending/i })
    fireEvent.click(pendingFilter)
    expect(screen.queryByText('Carol')).not.toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()

    const lateFilter = screen.getByRole('button', { name: /Late/i })
    fireEvent.click(lateFilter)
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()

    const gradedFilter = screen.getByRole('button', { name: /Graded/i })
    fireEvent.click(gradedFilter)
    expect(screen.getByText('Carol')).toBeInTheDocument()
  })

  it('opens review panel when clicking a submission', () => {
    renderGradingQueue()
    const aliceItem = screen.getByText('Alice').closest('li')
    expect(aliceItem).toBeInTheDocument()
    fireEvent.click(aliceItem!)
    expect(screen.getByRole('button', { name: /Previous submission/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Next submission/i })).toBeInTheDocument()
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  LatePolicy
// ═════════════════════════════════════════════════════════════════════════════

describe('LatePolicy — Late Penalty Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing for teacher', () => {
    renderLatePolicy('teacher')
    expect(screen.getByRole('heading', { name: /Late Policy & Grade Posting/i })).toBeInTheDocument()
  })

  it('shows mocked policy values', () => {
    renderLatePolicy('teacher')
    expect(screen.getByText(/Late Submission Policy/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Enable automatic late deductions/i })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /Auto-zero missing submissions/i })).toBeChecked()
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    it(`shows Save Policy and grade posting buttons for ${role}`, () => {
      renderLatePolicy(role)
      expect(screen.getByRole('button', { name: /Save Policy/i })).toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: /^Post$/i }).length).toBe(2)
      expect(screen.getAllByRole('button', { name: /^Hide$/i }).length).toBe(2)
    })
  })

  STUDENT_LIKE_ROLES.forEach((role) => {
    it(`shows permission denied for ${role}`, () => {
      renderLatePolicy(role)
      expect(screen.getByText(/You do not have permission/i)).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Save Policy/i })).not.toBeInTheDocument()
    })
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  LearningMasteryGradebook
// ═════════════════════════════════════════════════════════════════════════════

describe('LearningMasteryGradebook — Standards-Based Grading', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing for teacher', () => {
    renderLearningMastery('teacher')
    expect(screen.getByRole('heading', { name: /Learning Mastery Gradebook/i })).toBeInTheDocument()
  })

  it('shows mocked mastery grid', () => {
    renderLearningMastery('teacher')
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Critical Thinking')).toBeInTheDocument()
    expect(screen.getByText('Communication')).toBeInTheDocument()
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    it(`shows mastery scores for ${role}`, () => {
      renderLearningMastery(role)
      expect(screen.getAllByText(/✓/).length).toBeGreaterThanOrEqual(1)
    })
  })

  STUDENT_LIKE_ROLES.forEach((role) => {
    it(`shows permission denied for ${role}`, () => {
      renderLearningMastery(role)
      expect(screen.getByText(/You do not have permission/i)).toBeInTheDocument()
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  it('shows empty state with Manage Outcomes link when no data', () => {
    mockRole('teacher')
    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint.includes('/outcome_rollups')) {
        return { data: { rollups: [] }, isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint.includes('/outcomes')) {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
    })
    render(
      <MemoryRouter initialEntries={['/courses/1/learning-mastery']}>
        <Routes>
          <Route path="/courses/:courseId/learning-mastery" element={<LearningMasteryGradebookPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText(/No mastery data available/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Manage Outcomes/i })).toBeInTheDocument()
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  Attendance
// ═════════════════════════════════════════════════════════════════════════════

describe('Attendance — Roll Call Tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    renderAttendance(true)
    expect(screen.getByRole('heading', { name: /Attendance & Roll Call/i })).toBeInTheDocument()
  })

  it('shows mocked students when attendance assignment exists', () => {
    renderAttendance(true)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Mark All Present/i })).toBeInTheDocument()
  })

  it('shows initialize button when no attendance assignment exists', () => {
    renderAttendance(false)
    expect(screen.getByText(/Initialize Attendance Tracking/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Initialize Attendance/i })).toBeInTheDocument()
  })

  it('cycles student status when clicking status button', () => {
    renderAttendance(true)
    const aliceButton = screen.getByText('present')
    expect(aliceButton).toBeInTheDocument()
    fireEvent.click(aliceButton)
    expect(screen.getByText('absent')).toBeInTheDocument()
  })

  it('toggles between list and seating view', () => {
    renderAttendance(true)
    const seatingTab = screen.getByRole('button', { name: /Seating Chart/i })
    fireEvent.click(seatingTab)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    const listTab = screen.getByRole('button', { name: /List View/i })
    fireEvent.click(listTab)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })
})
