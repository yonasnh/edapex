import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { vi, describe, it, expect, beforeAll } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

// ResizeObserver mock required by recharts / layout hooks
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

// Mock useNotification hook
vi.mock('../../hooks/useNotification', () => ({
  useNotification: () => ({
    showToast: vi.fn(),
    showConfirm: vi.fn().mockResolvedValue(true),
    showAlert: vi.fn(),
  }),
}))

// Mock useCanvasQuery with URL-aware responses matching Analytics.tsx usage
vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn().mockImplementation((url: string) => {
    if (url === '/api/v1/courses') {
      return {
        data: [{ id: 1, name: 'Physics 101', course_code: 'PHY101', workflow_state: 'available', total_students: 30 }],
        isLoading: false,
        isError: false,
      }
    }
    if (url === '/api/v1/courses/1/assignments') {
      return {
        data: [
          { id: 101, name: 'Midterm Examination', points_possible: 100 },
          { id: 102, name: 'Quiz 1', points_possible: 50 },
        ],
        isLoading: false,
        isError: false,
      }
    }
    if (url === '/api/v1/courses/1/students/submissions') {
      return {
        data: [
          { id: 1, assignment_id: 101, score: 85, assignment: { id: 101, points_possible: 100 } },
          { id: 2, assignment_id: 101, score: 92, assignment: { id: 101, points_possible: 100 } },
          { id: 3, assignment_id: 101, score: 78, assignment: { id: 101, points_possible: 100 } },
          { id: 4, assignment_id: 101, score: 65, assignment: { id: 101, points_possible: 100 } },
          { id: 5, assignment_id: 101, score: 88, assignment: { id: 101, points_possible: 100 } },
          { id: 6, assignment_id: 102, score: 40, assignment: { id: 102, points_possible: 50 } },
          { id: 7, assignment_id: 102, score: 45, assignment: { id: 102, points_possible: 50 } },
          { id: 8, assignment_id: 102, score: 35, assignment: { id: 102, points_possible: 50 } },
          { id: 9, assignment_id: 102, score: 25, assignment: { id: 102, points_possible: 50 } },
          { id: 10, assignment_id: 102, score: 50, assignment: { id: 102, points_possible: 50 } },
        ],
        isLoading: false,
        isError: false,
      }
    }
    // All other endpoints return empty arrays so stats still render
    return { data: [], isLoading: false, isError: false }
  }),
}))

import Analytics from '../Analytics'

describe('Analytics Page', () => {
  it('renders stat card labels with mocked data', () => {
    render(
      <MemoryRouter>
        <Analytics />
      </MemoryRouter>
    )
    // Stat card labels are always rendered
    expect(screen.getByText('Active Courses')).toBeInTheDocument()
    expect(screen.getByText('Total Enrolled Students')).toBeInTheDocument()
    expect(screen.getByText('To-Do Items')).toBeInTheDocument()
    expect(screen.getByText('Upcoming Events')).toBeInTheDocument()
  })

  it('renders Physics 101 in the top-courses table', () => {
    render(
      <MemoryRouter>
        <Analytics />
      </MemoryRouter>
    )
    expect(screen.getAllByText('Physics 101').length).toBeGreaterThanOrEqual(1)
  })

  it('renders time range select', () => {
    render(
      <MemoryRouter>
        <Analytics />
      </MemoryRouter>
    )
    expect(screen.getByLabelText('Time range')).toBeInTheDocument()
  })

  it('updates grade distribution metrics when dropdown changes', async () => {
    const { fireEvent } = await import('@testing-library/react')
    render(
      <MemoryRouter>
        <Analytics />
      </MemoryRouter>
    )

    // Switch to grades mode
    const gradesTab = screen.getByText('Grade Distributions')
    expect(gradesTab).toBeInTheDocument()
    fireEvent.click(gradesTab)

    // Default assignment is Midterm Examination (id=101)
    // Percentages: 85, 92, 78, 65, 88 => avg=81.6, median=85.0, stdDev≈10.6
    expect(screen.getByText('81.6%')).toBeInTheDocument()
    expect(screen.getByText('10.6%')).toBeInTheDocument()
    expect(screen.getByText('85.0%')).toBeInTheDocument()

    // Find the assignment select dropdown
    const assignmentSelect = screen.getByLabelText('Assignment selector')
    expect(assignmentSelect).toBeInTheDocument()

    // Change assignment to Quiz 1 (id=102)
    fireEvent.change(assignmentSelect, { target: { value: '102' } })

    // Verify it updated to Quiz 1 metrics
    // Percentages: 80, 90, 70, 50, 100 => avg=78.0, median=80.0, stdDev≈19.2
    expect(screen.getByText('78.0%')).toBeInTheDocument()
    expect(screen.getByText('19.2%')).toBeInTheDocument()
    expect(screen.getByText('80.0%')).toBeInTheDocument()
  })
})
