import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mutable role for testing both teacher and student views
let currentRole = 'teacher'

vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
}))

vi.mock('../../contexts/RoleContext', () => ({
  useRole: () => ({ role: currentRole }),
  RoleProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { useCanvasQuery } from '../../hooks/useCanvasQuery'

const mockedUseCanvasQuery = vi.mocked(useCanvasQuery)

function renderPage(initialEntries = ['/courses/1/quizzes/10/results']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/courses/:courseId/quizzes/:quizId/results" element={<QuizResultsPage />} />
      </Routes>
    </MemoryRouter>
  )
}

// Lazy import after mocks
const QuizResultsPage = (await import('../QuizResults')).default

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('QuizResultsPage — Teacher View', () => {
  beforeEach(() => {
    currentRole = 'teacher'
    mockedUseCanvasQuery.mockReset()
  })

  it('renders loading state', () => {
    mockedUseCanvasQuery.mockReturnValue({ data: undefined, isLoading: true } as any)
    renderPage()
    expect(screen.getByText('Quiz Results')).toBeInTheDocument()
    expect(document.querySelectorAll('.cx-skeleton').length).toBeGreaterThan(0)
  })

  it('renders quiz title in header', () => {
    mockedUseCanvasQuery.mockImplementation((url: string) => {
      if (url.includes('/quizzes/10') && !url.includes('/submissions') && !url.includes('/statistics') && !url.includes('/questions')) {
        return { data: { id: 10, title: 'Midterm Exam', points_possible: 100 }, isLoading: false } as any
      }
      if (url.includes('/submissions')) return { data: [], isLoading: false } as any
      if (url.includes('/statistics')) return { data: {}, isLoading: false } as any
      if (url.includes('/questions')) return { data: [], isLoading: false } as any
      return { data: undefined, isLoading: false } as any
    })
    renderPage()
    expect(screen.getByText('Midterm Exam — Results')).toBeInTheDocument()
  })

  it('renders submission table with student data', () => {
    mockedUseCanvasQuery.mockImplementation((url: string) => {
      if (url.includes('/quizzes/10') && !url.includes('/submissions') && !url.includes('/statistics') && !url.includes('/questions')) {
        return { data: { id: 10, title: 'Quiz', points_possible: 10 }, isLoading: false } as any
      }
      if (url.includes('/submissions')) {
        return {
          data: [
            { id: 1, user: { name: 'Alice', login_id: 'alice@school.edu' }, score: 8, attempt: 1, time_spent: 300, workflow_state: 'complete', submission_data: [{ question_id: 1, answer: 'A', correct: true }] },
            { id: 2, user: { name: 'Bob', login_id: 'bob@school.edu' }, score: 5, attempt: 1, time_spent: 200, workflow_state: 'pending_review', submission_data: [] },
          ],
          isLoading: false,
        } as any
      }
      if (url.includes('/statistics')) return { data: { submission_statistics: { unique_count: 2, points_possible: 10 } }, isLoading: false } as any
      if (url.includes('/questions')) return { data: [], isLoading: false } as any
      return { data: undefined, isLoading: false } as any
    })
    renderPage()

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('expands submission to show question details', () => {
    mockedUseCanvasQuery.mockImplementation((url: string) => {
      if (url.includes('/quizzes/10') && !url.includes('/submissions') && !url.includes('/statistics') && !url.includes('/questions')) {
        return { data: { id: 10, title: 'Quiz', points_possible: 10 }, isLoading: false } as any
      }
      if (url.includes('/submissions')) {
        return {
          data: [
            { id: 1, user: { name: 'Alice' }, score: 8, attempt: 1, time_spent: 300, workflow_state: 'complete', submission_data: [{ question_id: 1, answer: 'A', correct: true, text: 'Paris' }] },
          ],
          isLoading: false,
        } as any
      }
      if (url.includes('/statistics')) return { data: {}, isLoading: false } as any
      if (url.includes('/questions')) return { data: [], isLoading: false } as any
      return { data: undefined, isLoading: false } as any
    })
    renderPage()

    fireEvent.click(screen.getByTestId('submission-1'))
    expect(screen.getByText('Submission Details')).toBeInTheDocument()
    expect(screen.getByText(/Q1:/)).toBeInTheDocument()
    expect(screen.getByText('Correct')).toBeInTheDocument()
  })

  it('filters by student name', () => {
    mockedUseCanvasQuery.mockImplementation((url: string) => {
      if (url.includes('/quizzes/10') && !url.includes('/submissions') && !url.includes('/statistics') && !url.includes('/questions')) {
        return { data: { id: 10, title: 'Quiz' }, isLoading: false } as any
      }
      if (url.includes('/submissions')) {
        return {
          data: [
            { id: 1, user: { name: 'Alice' }, score: 8, attempt: 1, time_spent: 300, workflow_state: 'complete' },
            { id: 2, user: { name: 'Bob' }, score: 5, attempt: 1, time_spent: 200, workflow_state: 'complete' },
          ],
          isLoading: false,
        } as any
      }
      if (url.includes('/statistics')) return { data: {}, isLoading: false } as any
      if (url.includes('/questions')) return { data: [], isLoading: false } as any
      return { data: undefined, isLoading: false } as any
    })
    renderPage()

    const input = screen.getByTestId('filter-name')
    fireEvent.change(input, { target: { value: 'Alice' } })
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
  })
})

describe('QuizResultsPage — Student View', () => {
  beforeEach(() => {
    currentRole = 'student'
    mockedUseCanvasQuery.mockReset()
  })

  it('shows student their own score summary', () => {
    mockedUseCanvasQuery.mockImplementation((url: string) => {
      if (url.includes('/quizzes/10') && !url.includes('/submissions') && !url.includes('/statistics') && !url.includes('/questions')) {
        return { data: { id: 10, title: 'Quiz', points_possible: 10, show_correct_answers: true, hide_results: null, allowed_attempts: 1 }, isLoading: false } as any
      }
      if (url.includes('/submissions')) {
        return {
          data: [
            { id: 1, user_id: 5, user: { name: 'Student' }, score: 7, attempt: 1, time_spent: 400, workflow_state: 'complete', submission_data: [{ question_id: 1, answer: 'A', correct: true, points: 2 }] },
          ],
          isLoading: false,
        } as any
      }
      if (url.includes('/statistics')) return { data: {}, isLoading: false } as any
      if (url.includes('/questions')) return { data: [{ id: 1, question_name: 'Q1', question_text: 'What is 2+2?', points_possible: 2, answers: [{ id: 1, text: '4', correct: true }] }], isLoading: false } as any
      return { data: undefined, isLoading: false } as any
    })
    renderPage()

    expect(screen.getByText('Quiz — Results')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('/ 10')).toBeInTheDocument()
    expect(screen.getByText('70%')).toBeInTheDocument()
    expect(screen.getByText('Q1: Q1')).toBeInTheDocument()
  })

  it('hides correct answers when hide_results=always', () => {
    mockedUseCanvasQuery.mockImplementation((url: string) => {
      if (url.includes('/quizzes/10') && !url.includes('/submissions') && !url.includes('/statistics') && !url.includes('/questions')) {
        return { data: { id: 10, title: 'Quiz', points_possible: 10, show_correct_answers: false, hide_results: 'always', allowed_attempts: 1 }, isLoading: false } as any
      }
      if (url.includes('/submissions')) {
        return {
          data: [
            { id: 1, user_id: 5, score: 7, attempt: 1, time_spent: 400, workflow_state: 'complete', submission_data: [{ question_id: 1, answer: 'A', correct: false, points: 0 }] },
          ],
          isLoading: false,
        } as any
      }
      if (url.includes('/statistics')) return { data: {}, isLoading: false } as any
      if (url.includes('/questions')) return { data: [{ id: 1, question_name: 'Q1', points_possible: 2 }], isLoading: false } as any
      return { data: undefined, isLoading: false } as any
    })
    renderPage()

    fireEvent.click(screen.getByTestId('question-1'))
    expect(screen.queryByText('Correct answer:')).not.toBeInTheDocument()
  })

  it('shows correct answer when show_correct_answers is true', () => {
    mockedUseCanvasQuery.mockImplementation((url: string) => {
      if (url.includes('/quizzes/10') && !url.includes('/submissions') && !url.includes('/statistics') && !url.includes('/questions')) {
        return { data: { id: 10, title: 'Quiz', points_possible: 10, show_correct_answers: true, hide_results: null, allowed_attempts: 1 }, isLoading: false } as any
      }
      if (url.includes('/submissions')) {
        return {
          data: [
            { id: 1, user_id: 5, score: 7, attempt: 1, time_spent: 400, workflow_state: 'complete', submission_data: [{ question_id: 1, answer: 'B', correct: false, points: 0 }] },
          ],
          isLoading: false,
        } as any
      }
      if (url.includes('/statistics')) return { data: {}, isLoading: false } as any
      if (url.includes('/questions')) {
        return {
          data: [{ id: 1, question_name: 'Q1', question_text: 'What is 2+2?', points_possible: 2, answers: [{ id: 1, text: '4', correct: true }] }],
          isLoading: false,
        } as any
      }
      return { data: undefined, isLoading: false } as any
    })
    renderPage()

    fireEvent.click(screen.getByTestId('question-1'))
    expect(screen.getByText(/Correct answer:/)).toBeInTheDocument()
  })

  it('shows message when no submission exists', () => {
    mockedUseCanvasQuery.mockImplementation((url: string) => {
      if (url.includes('/quizzes/10') && !url.includes('/submissions') && !url.includes('/statistics') && !url.includes('/questions')) {
        return { data: { id: 10, title: 'Quiz' }, isLoading: false } as any
      }
      if (url.includes('/submissions')) return { data: [], isLoading: false } as any
      if (url.includes('/statistics')) return { data: {}, isLoading: false } as any
      if (url.includes('/questions')) return { data: [], isLoading: false } as any
      return { data: undefined, isLoading: false } as any
    })
    renderPage()

    expect(screen.getByText('You have not submitted this quiz yet.')).toBeInTheDocument()
  })
})
