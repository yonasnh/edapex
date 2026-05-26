/**
 * Quiz New Question Types Tests
 * ==============================
 * Verifies QuizTaker renders matching, numerical, calculated,
 * file upload, and fill-in-multiple-blanks questions correctly.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import Quizzes from '../pages/Quizzes'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
}))

vi.mock('../hooks/useNotification', () => ({
  useNotification: vi.fn(),
}))

vi.mock('../contexts/RoleContext', () => ({
  useRole: vi.fn(),
}))

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_QUIZ = {
  id: 10,
  title: 'Test Quiz',
  quiz_type: 'assignment',
  time_limit: null,
  allowed_attempts: 1,
  question_count: 5,
  points_possible: 50,
  workflow_state: 'published',
  locked_for_user: false,
}

const MOCK_MATCHING_Q = {
  id: 1,
  position: 1,
  question_name: 'Match',
  question_type: 'matching_question',
  question_text: 'Match items',
  points_possible: 5,
  matching_answer: [
    { id: 1, left: 'A', right: 'Alpha' },
    { id: 2, left: 'B', right: 'Beta' },
  ],
}

const MOCK_NUMERICAL_Q = {
  id: 2,
  position: 2,
  question_name: 'Num',
  question_type: 'numerical_question',
  question_text: 'What is pi?',
  points_possible: 5,
  numerical_answer: [{ id: 1, exact: 3.14, margin: 0.01 }],
}

const MOCK_CALCULATED_Q = {
  id: 3,
  position: 3,
  question_name: 'Calc',
  question_type: 'calculated_question',
  question_text: 'Calculate [x] + [y]',
  points_possible: 5,
  formulas: ['x + y'],
  variables: [
    { name: 'x', min: 1, max: 10 },
    { name: 'y', min: 1, max: 10 },
  ],
}

const MOCK_FILE_Q = {
  id: 4,
  position: 4,
  question_name: 'File',
  question_type: 'file_upload_question',
  question_text: 'Upload file',
  points_possible: 5,
}

const MOCK_FILL_IN_Q = {
  id: 5,
  position: 5,
  question_name: 'Fill',
  question_type: 'fill_in_multiple_blanks_question',
  question_text: 'The [color] fox jumps over the [object]',
  points_possible: 5,
}

const ALL_QUESTIONS = [
  MOCK_MATCHING_Q,
  MOCK_NUMERICAL_Q,
  MOCK_CALCULATED_Q,
  MOCK_FILE_Q,
  MOCK_FILL_IN_Q,
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function setupMocks() {
  vi.mocked(useRole).mockReturnValue({ role: 'student', masqueradeAs: vi.fn() } as any)

  vi.mocked(useNotification).mockReturnValue({
    showToast: vi.fn(),
    showConfirm: vi.fn().mockResolvedValue(true),
    showAlert: vi.fn(),
  } as any)

  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/courses/1/quizzes') {
      return { data: [MOCK_QUIZ], isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/quizzes/10')) {
      if (endpoint.includes('/questions')) {
        return { data: ALL_QUESTIONS, isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint.includes('/submission')) {
        return { data: { quiz_submissions: [] }, isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      return { data: MOCK_QUIZ, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })

  vi.mocked(canvasFetch).mockImplementation(async (endpoint: string, options?: any) => {
    if (endpoint.includes('/submissions') && options?.method === 'POST') {
      return {
        quiz_submissions: [
          { id: 99, quiz_id: 10, user_id: 1, attempt: 1, workflow_state: 'untaken' },
        ],
      }
    }
    return {}
  })
}

function renderQuizzes() {
  return render(
    <MemoryRouter initialEntries={['/courses/1/quizzes']}>
      <Routes>
        <Route path="/courses/:courseId/quizzes" element={<Quizzes />} />
      </Routes>
    </MemoryRouter>
  )
}

async function startQuiz() {
  const quizCard = screen.getByText('Test Quiz')
  fireEvent.click(quizCard)

  await waitFor(() => {
    expect(screen.getByText('Start Quiz')).toBeInTheDocument()
  })

  fireEvent.click(screen.getByText('Start Quiz'))

  await waitFor(() => {
    expect(screen.getByText('Question 1 of 5')).toBeInTheDocument()
  })
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('QuizTaker — New Question Types', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks()
  })

  it('renders matching_question with items and match selects', async () => {
    renderQuizzes()
    await startQuiz()

    expect(screen.getByText('Match items')).toBeInTheDocument()
    expect(screen.getByText('Items')).toBeInTheDocument()
    expect(screen.getByText('Matches')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()

    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThanOrEqual(2)
  })

  it('renders numerical_question with number input', async () => {
    renderQuizzes()
    await startQuiz()

    fireEvent.click(screen.getByText('Next →'))

    await waitFor(() => {
      expect(screen.getByText('What is pi?')).toBeInTheDocument()
    })

    const numberInput = screen.getByPlaceholderText('Enter a number…')
    expect(numberInput).toBeInTheDocument()
    expect(numberInput).toHaveAttribute('type', 'number')
  })

  it('renders calculated_question with formula and number input', async () => {
    renderQuizzes()
    await startQuiz()

    fireEvent.click(screen.getByText('Next →'))
    fireEvent.click(screen.getByText('Next →'))

    await waitFor(() => {
      expect(screen.getByText(/Formula: x \+ y/)).toBeInTheDocument()
    })

    expect(screen.getByText(/Formula: x \+ y/)).toBeInTheDocument()

    const numberInput = screen.getByPlaceholderText('Enter your calculated answer…')
    expect(numberInput).toBeInTheDocument()
    expect(numberInput).toHaveAttribute('type', 'number')
  })

  it('renders file_upload_question with QuizFileUpload area', async () => {
    renderQuizzes()
    await startQuiz()

    fireEvent.click(screen.getByText('Next →'))
    fireEvent.click(screen.getByText('Next →'))
    fireEvent.click(screen.getByText('Next →'))

    await waitFor(() => {
      expect(screen.getByText('Upload file')).toBeInTheDocument()
    })

    expect(screen.getByText(/Drag & drop a file here/)).toBeInTheDocument()
    expect(screen.getByText(/or click to browse/)).toBeInTheDocument()
  })

  it('renders fill_in_multiple_blanks_question with inline text inputs', async () => {
    renderQuizzes()
    await startQuiz()

    fireEvent.click(screen.getByText('Next →'))
    fireEvent.click(screen.getByText('Next →'))
    fireEvent.click(screen.getByText('Next →'))
    fireEvent.click(screen.getByText('Next →'))

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes('The') && content.includes('fox jumps over the'))
      ).toBeInTheDocument()
    })

    const textInputs = screen.getAllByRole('textbox').filter((el) => el.getAttribute('type') === 'text')
    expect(textInputs.length).toBeGreaterThanOrEqual(2)

    expect(screen.getByPlaceholderText('Blank: color')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Blank: object')).toBeInTheDocument()
  })
})
