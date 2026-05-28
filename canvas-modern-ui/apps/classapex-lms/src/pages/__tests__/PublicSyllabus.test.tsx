/**
 * PublicSyllabusPage Tests
 * ========================
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import PublicSyllabusPage from '../PublicSyllabus'

vi.mock('../../hooks/useCanvasQuery', () => ({ useCanvasQuery: vi.fn() }))

import { useCanvasQuery } from '../../hooks/useCanvasQuery'

const MOCK_COURSE = {
  id: 1,
  name: 'Math 101',
  syllabus_body: '<p>Syllabus content</p>',
  public_syllabus: true,
}

const MOCK_ASSIGNMENTS = [
  { id: 1, name: 'HW1', due_at: '2026-02-01T00:00:00Z', points_possible: 10 },
  { id: 2, name: 'HW2', due_at: '2026-01-01T00:00:00Z', points_possible: 20 },
]

function renderWithRoute(ui: React.ReactElement, route = '/courses/1/syllabus') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/courses/:courseId/syllabus" element={ui} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PublicSyllabusPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state', () => {
    vi.mocked(useCanvasQuery).mockReturnValue({ data: null, isLoading: true, isError: false } as any)

    renderWithRoute(<PublicSyllabusPage />)
    expect(screen.getByAltText('ClassApex Logo')).toBeInTheDocument()
  })

  it('renders error state with sign in link', () => {
    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint.includes('/courses/')) {
        return { data: null, isLoading: false, isError: true } as any
      }
      return { data: null, isLoading: false, isError: false } as any
    })

    renderWithRoute(<PublicSyllabusPage />)
    expect(screen.getByText('Unable to load course syllabus.')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('renders "Syllabus Not Public" when course is not public', () => {
    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint.includes('/courses/')) {
        return { data: { ...MOCK_COURSE, public_syllabus: false, public_syllabus_to_auth: false }, isLoading: false, isError: false } as any
      }
      return { data: null, isLoading: false, isError: false } as any
    })

    renderWithRoute(<PublicSyllabusPage />)
    expect(screen.getByText('Syllabus Not Public')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('renders public syllabus with course name', () => {
    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint.includes('/courses/') && !endpoint.includes('assignments')) {
        return { data: MOCK_COURSE, isLoading: false, isError: false } as any
      }
      if (endpoint.includes('assignments')) {
        return { data: MOCK_ASSIGNMENTS, isLoading: false, isError: false } as any
      }
      return { data: null, isLoading: false, isError: false } as any
    })

    renderWithRoute(<PublicSyllabusPage />)
    expect(screen.getByText('Math 101')).toBeInTheDocument()
    expect(screen.getByText(/Public Syllabus/)).toBeInTheDocument()
  })

  it('renders syllabus body HTML', () => {
    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint.includes('/courses/') && !endpoint.includes('assignments')) {
        return { data: MOCK_COURSE, isLoading: false, isError: false } as any
      }
      if (endpoint.includes('assignments')) {
        return { data: MOCK_ASSIGNMENTS, isLoading: false, isError: false } as any
      }
      return { data: null, isLoading: false, isError: false } as any
    })

    renderWithRoute(<PublicSyllabusPage />)
    const syllabusBody = document.querySelector('.cx-syllabus-body')
    expect(syllabusBody).toBeInTheDocument()
    expect(syllabusBody!.innerHTML).toContain('Syllabus content')
  })

  it('renders assignment schedule table', () => {
    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint.includes('/courses/') && !endpoint.includes('assignments')) {
        return { data: MOCK_COURSE, isLoading: false, isError: false } as any
      }
      if (endpoint.includes('assignments')) {
        return { data: MOCK_ASSIGNMENTS, isLoading: false, isError: false } as any
      }
      return { data: null, isLoading: false, isError: false } as any
    })

    renderWithRoute(<PublicSyllabusPage />)
    expect(screen.getByText('Assignment Schedule')).toBeInTheDocument()
    expect(screen.getByText('HW1')).toBeInTheDocument()
    expect(screen.getByText('HW2')).toBeInTheDocument()
  })

  it('sorts assignments by due date', () => {
    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint.includes('/courses/') && !endpoint.includes('assignments')) {
        return { data: MOCK_COURSE, isLoading: false, isError: false } as any
      }
      if (endpoint.includes('assignments')) {
        return { data: MOCK_ASSIGNMENTS, isLoading: false, isError: false } as any
      }
      return { data: null, isLoading: false, isError: false } as any
    })

    renderWithRoute(<PublicSyllabusPage />)
    const rows = screen.getAllByRole('row')
    // rows[0] is header; rows[1] and rows[2] are data rows
    // HW2 (Jan 1) should come before HW1 (Feb 1)
    expect(rows[1].textContent).toContain('HW2')
    expect(rows[2].textContent).toContain('HW1')
  })
})
