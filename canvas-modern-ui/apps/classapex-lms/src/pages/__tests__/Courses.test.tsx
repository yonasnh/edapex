import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Courses from '../Courses'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useCanvasQuery } from '../../hooks/useCanvasQuery'

// Mock the Canvas query hook
vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn()
}))

describe('Courses Routing & Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders all courses by default on root path', () => {
    vi.mocked(useCanvasQuery).mockReturnValue({
      data: [
        { id: 1, name: 'Advanced Engineering', course_code: 'CS-402', workflow_state: 'available', created_at: '2026-01-01T00:00:00Z' }
      ],
      isLoading: false,
      isError: false
    } as any)

    render(
      <MemoryRouter initialEntries={['/courses']}>
        <Routes>
          <Route path="/courses/*" element={<Courses />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Advanced Engineering')).toBeInTheDocument()
    expect(useCanvasQuery).toHaveBeenCalledWith('/api/v1/courses', expect.any(Object))
  })

  it('queries favorites endpoint when navigating to /favorites', () => {
    vi.mocked(useCanvasQuery).mockReturnValue({
      data: [
        { id: 2, name: 'Favorite Course', course_code: 'CS-101', workflow_state: 'available', created_at: '2026-01-01T00:00:00Z' }
      ],
      isLoading: false,
      isError: false
    } as any)

    render(
      <MemoryRouter initialEntries={['/courses/favorites']}>
        <Routes>
          <Route path="/courses/*" element={<Courses />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Favorite Course')).toBeInTheDocument()
    expect(useCanvasQuery).toHaveBeenCalledWith('/api/v1/users/self/favorites/courses', expect.any(Object))
  })

  it('filters by recent accessed history on /recent route', () => {
    vi.mocked(useCanvasQuery).mockReturnValue({
      data: [
        { id: 1, name: 'Engineering', course_code: 'CS-402', workflow_state: 'available', created_at: '2026-01-01T00:00:00Z' },
        { id: 2, name: 'Sanskrit', course_code: 'SN-101', workflow_state: 'available', created_at: '2026-01-01T00:00:00Z' }
      ],
      isLoading: false,
      isError: false
    } as any)

    // Set mock recent history in localStorage
    localStorage.setItem('classapex_recent_courses', JSON.stringify(['2']))

    render(
      <MemoryRouter initialEntries={['/courses/recent']}>
        <Routes>
          <Route path="/courses/*" element={<Courses />} />
        </Routes>
      </MemoryRouter>
    )

    // Should only render Sanskrit course (since it's the only one in recent history)
    expect(screen.getByText('Sanskrit')).toBeInTheDocument()
    expect(screen.queryByText('Engineering')).not.toBeInTheDocument()
    expect(useCanvasQuery).toHaveBeenCalledWith('/api/v1/courses', expect.any(Object))
  })
})
