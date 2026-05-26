/**
 * Role-Based Deep CRUD Tests — Part 2
 * ====================================
 * Verifies deep, observable CRUD interactions:
 *   - Calendar event creation & editing (teacher)
 *   - Settings avatar upload, theme toggle, accent color, data export
 *   - Assignment submission flow (student / teacher)
 *   - Quiz taking flow (student)
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import CalendarPage from '../pages/Calendar'
import SettingsPage from '../pages/Settings'
import AssignmentDetail from '../pages/AssignmentDetail'
import QuizzesPage from '../pages/Quizzes'
import { useCanvasQuery, canvasFetch, useCanvasMutation } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'
import { useTheme } from '../contexts/ThemeContext'
import { useI18n } from '../contexts/I18nContext'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@schoolapex/core', () => ({
  useAuth: () => ({ user: { id: '101', name: 'Test User' }, isAuthenticated: true }),
}))

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

vi.mock('../contexts/ThemeContext', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    toggleTheme: vi.fn(),
    accentColor: '#6366f1',
    setAccentColor: vi.fn(),
  })),
}))

vi.mock('../contexts/I18nContext', () => ({
  useI18n: vi.fn(() => ({ locale: 'en', setLocale: vi.fn(), t: (k: string) => k })),
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

vi.mock('../widgets/SubmissionStatus', () => ({
  SubmissionStatus: ({ status }: any) => (
    <span data-testid="submission-status">{status}</span>
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

const MOCK_COURSES = [
  { id: '10', name: 'Math 101' },
  { id: '20', name: 'History 201' },
]

const MOCK_CALENDAR_EVENTS = [
  {
    id: 'evt-1',
    title: 'Team Meeting',
    description: 'Type: meeting\nWeekly sync',
    start_at: '2026-05-15T14:00:00Z',
    end_at: '2026-05-15T15:00:00Z',
    location_name: 'Room 101',
    all_day: false,
    context_code: 'course_10',
  },
]

const MOCK_CALENDAR_ASSIGNMENTS = [
  {
    id: 'assignment_1',
    title: 'Math Homework',
    description: '<p>Solve problems</p>',
    start_at: '2026-05-18T09:00:00Z',
    end_at: '2026-05-18T23:59:59Z',
    all_day: false,
    context_code: 'course_10',
  },
]

function mockCalendarData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string, params?: any) => {
    if (endpoint === '/api/v1/courses') {
      return { data: MOCK_COURSES, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint === '/api/v1/calendar_events') {
      if (params?.type === 'event') {
        return { data: MOCK_CALENDAR_EVENTS, isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (params?.type === 'assignment') {
        return { data: MOCK_CALENDAR_ASSIGNMENTS, isLoading: false, isError: false, refetch: vi.fn() } as any
      }
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderCalendar(role: string) {
  mockRole(role)
  mockNotifications()
  mockCalendarData()
  return render(
    <MemoryRouter>
      <CalendarPage />
    </MemoryRouter>
  )
}

function mockSettingsData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/users/self') {
      return {
        data: {
          id: 1,
          name: 'Test User',
          primary_email: 'test@example.com',
          bio: '',
          time_zone: 'America/New_York',
          avatar_url: '/default-avatar.png',
        },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    if (endpoint === '/api/v1/users/self/communication_channels') {
      return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderSettings() {
  mockRole('student')
  mockNotifications()
  mockSettingsData()
  return render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>
  )
}

const MOCK_ASSIGNMENT_DETAIL_NOT_SUBMITTED = {
  id: 101,
  name: 'Math Homework',
  description: '<p>Solve problems 1-10</p>',
  points_possible: 10,
  due_at: '2026-06-01T23:59:59Z',
  submission_types: ['online_text_entry'],
  submission: null,
}

const MOCK_ASSIGNMENT_DETAIL_SUBMITTED = {
  id: 101,
  name: 'Math Homework',
  description: '<p>Solve problems 1-10</p>',
  points_possible: 10,
  due_at: '2026-06-01T23:59:59Z',
  submission_types: ['online_text_entry'],
  submission: {
    submitted: true,
    score: 8,
    workflow_state: 'submitted',
  },
}

function mockAssignmentDetailData(overrides: any = {}) {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/assignments/101')) {
      return {
        data: { ...MOCK_ASSIGNMENT_DETAIL_NOT_SUBMITTED, ...overrides },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
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

const MOCK_QUIZZES = [
  {
    id: 10,
    title: 'Quiz 1',
    quiz_type: 'assignment',
    time_limit: 30,
    allowed_attempts: 2,
    question_count: 1,
    points_possible: 10,
    due_at: '2026-06-01T23:59:59Z',
    workflow_state: 'published',
    locked_for_user: false,
  },
]

const MOCK_QUIZ_DETAIL = {
  id: 10,
  title: 'Quiz 1',
  description: '<p>Test quiz</p>',
  quiz_type: 'assignment',
  time_limit: 30,
  allowed_attempts: 2,
  question_count: 1,
  points_possible: 10,
  workflow_state: 'published',
  locked_for_user: false,
}

const MOCK_QUESTIONS = [
  {
    id: 1,
    position: 1,
    question_name: 'Q1',
    question_type: 'multiple_choice_question',
    question_text: 'What is 2+2?',
    points_possible: 5,
    answers: [
      { id: 1, text: '3' },
      { id: 2, text: '4' },
    ],
  },
]

function mockQuizData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/courses/1/quizzes') {
      return { data: MOCK_QUIZZES, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/quizzes/10')) {
      if (endpoint.includes('/questions')) {
        return { data: MOCK_QUESTIONS, isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint.includes('/submission')) {
        return { data: { quiz_submissions: [] }, isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      return { data: MOCK_QUIZ_DETAIL, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderQuizzes(role: string) {
  mockRole(role)
  mockNotifications()
  mockQuizData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/quizzes']}>
      <Routes>
        <Route path="/courses/:courseId/quizzes" element={<QuizzesPage />} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Calendar — Event Creation & Editing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('teacher can open create event modal, fill form, and create event', async () => {
    vi.mocked(global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '999', title: 'New Event' }),
    } as any)

    renderCalendar('teacher')

    fireEvent.click(screen.getByRole('button', { name: /Create Event/i }))
    expect(screen.getByRole('heading', { name: /Create Event/i })).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/Event title/i), {
      target: { value: 'New Event' },
    })
    fireEvent.change(screen.getByPlaceholderText(/Event description/i), {
      target: { value: 'Test description' },
    })

    const startInput = document.querySelectorAll('input[type="datetime-local"]')[0] as HTMLInputElement
    fireEvent.change(startInput, { target: { value: '2026-05-25T10:00' } })

    fireEvent.change(screen.getByDisplayValue('No course'), { target: { value: '10' } })

    fireEvent.click(screen.getByLabelText(/All Day Event/i))

    fireEvent.click(screen.getByRole('button', { name: /^Create$/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/calendar_events',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  it('teacher can edit existing event and update', async () => {
    vi.mocked(global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'evt-1', title: 'Updated Meeting' }),
    } as any)

    renderCalendar('teacher')

    fireEvent.click(screen.getByText('Team Meeting'))
    fireEvent.click(screen.getByRole('button', { name: /Edit/i }))

    expect(screen.getByRole('heading', { name: /Edit Event/i })).toBeInTheDocument()

    fireEvent.change(screen.getByDisplayValue('Team Meeting'), {
      target: { value: 'Updated Meeting' },
    })

    fireEvent.click(screen.getByRole('button', { name: /^Update$/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/calendar_events/evt-1',
        expect.objectContaining({ method: 'PUT' })
      )
    })
  })
})

describe('Settings — Avatar, Theme, Accent Color, Export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('avatar upload triggers preflight canvasFetch', async () => {
    const mockUpdateUser = vi.fn().mockResolvedValue({ id: 1 })
    vi.mocked(useCanvasMutation).mockReturnValue({
      mutate: mockUpdateUser,
      isLoading: false,
    } as any)

    vi.mocked(canvasFetch).mockImplementation(async (endpoint: string, options?: any) => {
      if (endpoint === '/api/v1/users/self/files') {
        return {
          upload_url: 'https://upload.example.com',
          upload_params: { key: 'value' },
          url: 'https://example.com/avatar.png',
        }
      }
      return {}
    })

    vi.mocked(global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as any)

    renderSettings()

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        '/api/v1/users/self/files',
        expect.objectContaining({ method: 'POST' })
      )
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://upload.example.com',
        expect.objectContaining({ method: 'POST' })
      )
    })

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            avatar: expect.objectContaining({ url: 'https://example.com/avatar.png' }),
          }),
        })
      )
    })
  })

  it('theme toggle button calls toggleTheme', () => {
    const mockToggleTheme = vi.fn()
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
      accentColor: '#6366f1',
      setAccentColor: vi.fn(),
    } as any)

    renderSettings()

    fireEvent.click(screen.getByRole('button', { name: /Dark/i }))
    expect(mockToggleTheme).toHaveBeenCalled()
  })

  it('accent color picker calls setAccentColor', () => {
    const mockSetAccentColor = vi.fn()
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      toggleTheme: vi.fn(),
      accentColor: '#6366f1',
      setAccentColor: mockSetAccentColor,
    } as any)

    renderSettings()

    fireEvent.click(screen.getByTitle('Green'))
    expect(mockSetAccentColor).toHaveBeenCalledWith('#10b981')
  })

  it('data export button triggers download', async () => {
    vi.mocked(canvasFetch).mockImplementation(async (endpoint: string) => {
      if (endpoint.includes('/courses')) return []
      if (endpoint.includes('/todo')) return []
      if (endpoint.includes('/submissions')) return []
      return {}
    })

    const createObjectURL = vi.fn().mockReturnValue('blob:url')
    const revokeObjectURL = vi.fn()
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    renderSettings()

    fireEvent.click(screen.getByRole('button', { name: /Download JSON/i }))

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith('/api/v1/courses?per_page=100')
      expect(canvasFetch).toHaveBeenCalledWith('/api/v1/users/self/todo?per_page=100')
      expect(canvasFetch).toHaveBeenCalledWith('/api/v1/users/self/submissions?per_page=100')
    })

    await waitFor(() => {
      expect(createObjectURL).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
    })

    clickSpy.mockRestore()
  })
})

describe('AssignmentDetail — Submission Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('student sees Start Submission button when not submitted', () => {
    renderAssignmentDetail('student')
    expect(screen.getByText('Start Submission')).toBeInTheDocument()
  })

  it('clicking Start Submission shows SubmissionForm widget', () => {
    renderAssignmentDetail('student')
    fireEvent.click(screen.getByText('Start Submission'))
    expect(screen.getByTestId('submission-form')).toBeInTheDocument()
  })

  it('student sees already submitted message when submitted', () => {
    renderAssignmentDetail('student', MOCK_ASSIGNMENT_DETAIL_SUBMITTED)
    expect(
      screen.getByText('You have already submitted this assignment.')
    ).toBeInTheDocument()
  })

  it('teacher sees Edit Assignment button instead', () => {
    renderAssignmentDetail('teacher')
    expect(screen.getByTitle('Edit Assignment')).toBeInTheDocument()
    expect(screen.queryByText('Start Submission')).not.toBeInTheDocument()
  })
})

describe('Quizzes — Quiz Taking Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('student can start a published quiz, answer, and submit', async () => {
    vi.mocked(canvasFetch).mockImplementation(async (endpoint: string, options?: any) => {
      if (
        endpoint.includes('/submissions') &&
        options?.method === 'POST' &&
        !endpoint.includes('complete')
      ) {
        return { quiz_submissions: [{ id: 1, attempt: 1, workflow_state: 'untaken' }] }
      }
      if (endpoint.includes('/complete')) {
        return { quiz_submissions: [{ id: 1, score: 10 }] }
      }
      return {}
    })

    renderQuizzes('student')

    fireEvent.click(screen.getByText('Quiz 1'))

    await waitFor(() => {
      expect(screen.getByText('Quiz 1')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Start Quiz/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }))

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        '/api/v1/courses/1/quizzes/10/submissions',
        expect.objectContaining({ method: 'POST' })
      )
    })

    await waitFor(() => {
      expect(screen.getByText('What is 2+2?')).toBeInTheDocument()
    })

    const answerRadio = screen.getByDisplayValue('2') as HTMLInputElement
    fireEvent.click(answerRadio)

    fireEvent.click(screen.getByRole('button', { name: /Submit Quiz/i }))

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        '/api/v1/courses/1/quizzes/10/submissions/1/complete',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  it('QuizTaker renders with questions and timer', async () => {
    vi.mocked(canvasFetch).mockImplementation(async (endpoint: string, options?: any) => {
      if (endpoint.includes('/submissions') && options?.method === 'POST') {
        return { quiz_submissions: [{ id: 1, attempt: 1, workflow_state: 'untaken' }] }
      }
      return {}
    })

    renderQuizzes('student')

    fireEvent.click(screen.getByText('Quiz 1'))
    fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }))

    await waitFor(() => {
      expect(screen.getByText('What is 2+2?')).toBeInTheDocument()
      expect(screen.getByText(/Question 1 of 1/)).toBeInTheDocument()
      expect(screen.getByText(/30:00/)).toBeInTheDocument()
    })
  })
})
