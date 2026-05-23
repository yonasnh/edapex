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
    expect(screen.getByText('Physics 101')).toBeInTheDocument()
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

    // Default is midterm exam (Class Average: 78.4%, Std Dev: 8.2%, Median: 81.0%)
    expect(screen.getByText('78.4%')).toBeInTheDocument()
    expect(screen.getByText('8.2%')).toBeInTheDocument()
    expect(screen.getByText('81.0%')).toBeInTheDocument()

    // Find the select dropdown
    const select = screen.getByLabelText('Assignment selector')
    expect(select).toBeInTheDocument()

    // Change assignment to project1
    fireEvent.change(select, { target: { value: 'project1' } })

    // Verify it updated to Programming Project 1 metrics (Class Average: 86.1%, Std Dev: 5.4%, Median: 88.5%)
    expect(screen.getByText('86.1%')).toBeInTheDocument()
    expect(screen.getByText('5.4%')).toBeInTheDocument()
    expect(screen.getByText('88.5%')).toBeInTheDocument()
  })
})
