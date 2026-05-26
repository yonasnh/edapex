/**
 * Role-Based Grades & Gradebook Tests
 * =====================================
 * Verifies:
 *   - Students see the Grades page (personal grades, what-if mode)
 *   - Teachers/Admins see the Gradebook (all students, editable cells)
 *   - Gradebook redirects students to /grades
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import GradesPage from '../pages/Grades'
import GradebookPage from '../pages/Gradebook'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
}))

vi.mock('../contexts/RoleContext', () => ({
  useRole: vi.fn(),
}))

vi.mock('../hooks/useNotification', () => ({
  useNotification: vi.fn(),
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

function mockGradesData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/users/self/courses') {
      return {
        data: [{ id: 10, name: 'Math 101' }],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    if (endpoint.includes('students/submissions')) {
      return {
        data: [
          {
            id: 1,
            assignment: { id: 1, name: 'Homework 1', points_possible: 100 },
            score: 85,
            grade: 'B',
            submission_status: 'submitted',
            submitted_at: '2026-01-05T00:00:00Z',
          },
        ],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    if (endpoint.includes('assignments')) {
      return {
        data: [{ id: 1, name: 'Homework 1', points_possible: 100, due_at: '2026-01-10T00:00:00Z' }],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function mockGradebookData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/users')) {
      return {
        data: [
          { id: 1, name: 'Alice', sortable_name: 'Alice A.' },
          { id: 2, name: 'Bob', sortable_name: 'Bob B.' },
        ],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    if (endpoint.includes('/assignments')) {
      return {
        data: [{ id: 1, name: 'Homework 1', points_possible: 100 }],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    if (endpoint.includes('/students/submissions')) {
      return {
        data: [
          { user_id: 1, assignment_id: 1, score: 85, grade: 'B' },
          { user_id: 2, assignment_id: 1, score: 92, grade: 'A' },
        ],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    if (endpoint.includes('/assignment_groups')) {
      return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Grades — Student View', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  it('renders personal grades for student', async () => {
    mockRole('student')
    mockNotifications()
    mockGradesData()
    render(
      <MemoryRouter initialEntries={['/grades']}>
        <Routes>
          <Route path="/grades" element={<GradesPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Homework 1')).toBeInTheDocument()
    })
    expect(screen.getByText('85/100')).toBeInTheDocument()
  })

  it('shows What-If Grades toggle for student', async () => {
    mockRole('student')
    mockNotifications()
    mockGradesData()
    render(
      <MemoryRouter initialEntries={['/grades']}>
        <Routes>
          <Route path="/grades" element={<GradesPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/what-if/i)).toBeInTheDocument()
    })
  })
})

describe('Gradebook — Teacher/Admin View', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  it('renders gradebook with student rows for teacher', () => {
    mockRole('teacher')
    mockNotifications()
    mockGradebookData()
    render(
      <MemoryRouter initialEntries={['/courses/10/gradebook']}>
        <Routes>
          <Route path="/courses/:courseId/gradebook" element={<GradebookPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders gradebook with student rows for admin', () => {
    mockRole('admin')
    mockNotifications()
    mockGradebookData()
    render(
      <MemoryRouter initialEntries={['/courses/10/gradebook']}>
        <Routes>
          <Route path="/courses/:courseId/gradebook" element={<GradebookPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('redirects student from gradebook to /grades', async () => {
    mockRole('student')
    mockNotifications()
    mockGradebookData()
    render(
      <MemoryRouter initialEntries={['/courses/10/gradebook']}>
        <Routes>
          <Route path="/courses/:courseId/gradebook" element={<GradebookPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/grades?courseId=10', { replace: true })
    })
  })
})
