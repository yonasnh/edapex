/**
 * Role-Based Quizzes Tests
 * =========================
 * Verifies Quizzes list and QuizBuilder render correctly
 * for every role, including create, start, and build flows.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import Quizzes from '../pages/Quizzes'
import QuizBuilder from '../pages/QuizBuilder'
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
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}))

// ─── Helpers ────────────────────────────────────────────────────────────────

const ROLES = ['student', 'teacher', 'admin', 'observer'] as const
const TEACHER_LIKE_ROLES = ['teacher', 'admin'] as const

const MOCK_QUIZZES = [
  {
    id: 10,
    title: 'Quiz 1',
    quiz_type: 'assignment',
    time_limit: 30,
    allowed_attempts: 2,
    question_count: 5,
    points_possible: 50,
    due_at: '2026-06-01T23:59:59Z',
    workflow_state: 'published',
    locked_for_user: false,
  },
  {
    id: 11,
    title: 'Quiz 2',
    quiz_type: 'practice_quiz',
    time_limit: null,
    allowed_attempts: -1,
    question_count: 10,
    points_possible: 0,
    due_at: null,
    workflow_state: 'unpublished',
    locked_for_user: false,
  },
]

const MOCK_QUIZ_DETAIL = {
  id: 10,
  title: 'Quiz 1',
  description: '<p>Test quiz description</p>',
  quiz_type: 'assignment',
  time_limit: 30,
  allowed_attempts: 2,
  question_count: 5,
  points_possible: 50,
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

const MOCK_EXISTING_SUB = { quiz_submissions: [] }

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

function mockQuizData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/courses/1/quizzes') {
      return {
        data: MOCK_QUIZZES,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    if (endpoint.includes('/quizzes/10')) {
      if (endpoint.includes('/questions')) {
        return {
          data: MOCK_QUESTIONS,
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      if (endpoint.includes('/submission')) {
        return {
          data: MOCK_EXISTING_SUB,
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      return {
        data: MOCK_QUIZ_DETAIL,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function mockQuizBuilderData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/quizzes/10')) {
      if (endpoint.includes('/questions')) {
        return {
          data: MOCK_QUESTIONS,
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as any
      }
      return {
        data: MOCK_QUIZ_DETAIL,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
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
        <Route path="/courses/:courseId/quizzes" element={<Quizzes />} />
      </Routes>
    </MemoryRouter>
  )
}

function renderQuizBuilder(role: string) {
  mockRole(role)
  mockNotifications()
  mockQuizBuilderData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/quizzes/10/builder']}>
      <Routes>
        <Route
          path="/courses/:courseId/quizzes/:quizId/builder"
          element={<QuizBuilder />}
        />
      </Routes>
    </MemoryRouter>
  )
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Quizzes — Role-Based Access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders quiz list', () => {
        renderQuizzes(role)

        expect(screen.getByText('Quiz 1')).toBeInTheDocument()
        expect(screen.getByText('Quiz 2')).toBeInTheDocument()
      })

      it('shows quiz title, type, points, attempts', () => {
        renderQuizzes(role)

        expect(screen.getByText('Quiz 1')).toBeInTheDocument()
        expect(screen.getByText(/5 questions/)).toBeInTheDocument()
        expect(screen.getByText(/50 pts/)).toBeInTheDocument()
        expect(screen.getByText(/30 min/)).toBeInTheDocument()
      })
    })
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role} — teacher capabilities`, () => {
      it('"Create Quiz" button is visible', () => {
        renderQuizzes(role)
        expect(screen.getByText('+ Create Quiz')).toBeInTheDocument()
      })

      it('create quiz modal opens', () => {
        renderQuizzes(role)
        fireEvent.click(screen.getByText('+ Create Quiz'))
        expect(
          screen.getByRole('heading', { name: /Create Quiz/i })
        ).toBeInTheDocument()
      })

      it('shows published and draft badges', () => {
        renderQuizzes(role)
        expect(screen.getByText('Published')).toBeInTheDocument()
        expect(screen.getByText('Draft')).toBeInTheDocument()
      })
    })
  })

  describe('student — quiz taking', () => {
    it('can open a published quiz and see start button', () => {
      renderQuizzes('student')

      const quizCard = screen.getByText('Quiz 1')
      fireEvent.click(quizCard)

      expect(screen.getByText('Quiz 1')).toBeInTheDocument()
      expect(screen.getByText('Start Quiz')).toBeInTheDocument()
    })
  })
})

describe('QuizBuilder — Teacher/Admin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders builder with question list', () => {
        renderQuizBuilder(role)

        expect(screen.getByText(/Quiz 1/)).toBeInTheDocument()
        expect(screen.getByText('What is 2+2?')).toBeInTheDocument()
        expect(screen.getByText(/multiple choice/)).toBeInTheDocument()
      })

      it('can add multiple choice question', () => {
        renderQuizBuilder(role)

        fireEvent.click(screen.getByText('+ Add Question'))
        expect(
          screen.getByRole('heading', { name: /New Question/i })
        ).toBeInTheDocument()

        const textarea = screen.getByPlaceholderText('Enter your question...')
        fireEvent.change(textarea, { target: { value: 'What is 2+2?' } })
        expect(textarea).toHaveValue('What is 2+2?')
      })

      it('can save quiz via canvasFetch', async () => {
        vi.mocked(canvasFetch).mockResolvedValue({ id: 99 })
        renderQuizBuilder(role)

        fireEvent.click(screen.getByText('+ Add Question'))
        fireEvent.change(screen.getByPlaceholderText('Enter your question...'), {
          target: { value: 'New question text' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Add Question' }))

        await waitFor(() => {
          expect(canvasFetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/v1/courses/1/quizzes/10/questions'),
            expect.objectContaining({ method: 'POST' })
          )
        })
      })

      it('can edit an existing question', async () => {
        vi.mocked(canvasFetch).mockResolvedValue({})
        renderQuizBuilder(role)

        fireEvent.click(screen.getAllByTitle('Edit')[0])

        const textarea = screen.getByPlaceholderText('Enter your question...')
        fireEvent.change(textarea, { target: { value: 'Updated question?' } })

        fireEvent.click(screen.getByRole('button', { name: 'Update Question' }))

        await waitFor(() => {
          expect(canvasFetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/v1/courses/1/quizzes/10/questions/1'),
            expect.objectContaining({ method: 'PUT' })
          )
        })
      })
    })
  })
})
