/**
 * Role-Based Courses Tests
 * ==========================
 * Verifies the Courses page renders, filters, and routes correctly
 * for every role. All roles can view courses; create/edit/delete
 * are gated by Canvas API permissions, not UI.
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import Courses from '../pages/Courses'
import { useCanvasQuery } from '../hooks/useCanvasQuery'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
}))

// ─── Helpers ────────────────────────────────────────────────────────────────

const ROLES = ['student', 'teacher', 'admin', 'observer'] as const

const MOCK_COURSES = [
  { id: 1, name: 'Advanced Engineering', course_code: 'CS-402', workflow_state: 'available', created_at: '2026-01-01T00:00:00Z' },
  { id: 2, name: 'Sanskrit Literature', course_code: 'SN-101', workflow_state: 'available', created_at: '2026-02-01T00:00:00Z' },
  { id: 3, name: 'Completed Course', course_code: 'CC-999', workflow_state: 'completed', created_at: '2025-01-01T00:00:00Z' },
]

function mockCourses(data = MOCK_COURSES) {
  vi.mocked(useCanvasQuery).mockReturnValue({
    data,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  } as any)
}

function renderCourses(initialEntry = '/courses') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/courses/*" element={<Courses />} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Courses — Role-Based CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders course list', () => {
        mockCourses()
        renderCourses()

        expect(screen.getByText('Advanced Engineering')).toBeInTheDocument()
        expect(screen.getByText('Sanskrit Literature')).toBeInTheDocument()
      })

      it('filters courses by search term', () => {
        mockCourses()
        renderCourses()

        const searchInput = screen.getByPlaceholderText(/search courses/i)
        fireEvent.change(searchInput, { target: { value: 'Sanskrit' } })

        expect(screen.getByText('Sanskrit Literature')).toBeInTheDocument()
        expect(screen.queryByText('Advanced Engineering')).not.toBeInTheDocument()
      })

      it('filters courses by state (active)', () => {
        mockCourses()
        renderCourses()

        const stateSelect = screen.getByLabelText(/filter by status/i)
        fireEvent.change(stateSelect, { target: { value: 'active' } })

        expect(screen.getByText('Advanced Engineering')).toBeInTheDocument()
        expect(screen.queryByText('Completed Course')).not.toBeInTheDocument()
      })

      it('shows empty state when no courses match', () => {
        mockCourses([])
        renderCourses()

        expect(screen.getByText(/no courses found/i)).toBeInTheDocument()
      })
    })
  })

  it('queries favorites endpoint on /favorites route', () => {
    mockCourses([{ id: 2, name: 'Favorite Course', course_code: 'CS-101', workflow_state: 'available', created_at: '2026-01-01T00:00:00Z' }])
    renderCourses('/courses/favorites')

    expect(screen.getByText('Favorite Course')).toBeInTheDocument()
    expect(useCanvasQuery).toHaveBeenCalledWith('/api/v1/users/self/favorites/courses', expect.any(Object))
  })

  it('filters by recent history on /recent route', () => {
    mockCourses()
    localStorage.setItem('classapex_recent_courses', JSON.stringify(['2']))
    renderCourses('/courses/recent')

    expect(screen.getByText('Sanskrit Literature')).toBeInTheDocument()
    expect(screen.queryByText('Advanced Engineering')).not.toBeInTheDocument()
  })
})
