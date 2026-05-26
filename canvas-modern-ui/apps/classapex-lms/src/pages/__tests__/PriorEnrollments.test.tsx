/**
 * PriorEnrollmentsPage Tests
 * ==========================
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import PriorEnrollmentsPage from '../PriorEnrollments'

vi.mock('../../hooks/useCanvasQuery', () => ({ useCanvasQuery: vi.fn() }))
vi.mock('../../hooks/useNotification', () => ({ useNotification: vi.fn() }))

import { useCanvasQuery } from '../../hooks/useCanvasQuery'
import { useNotification } from '../../hooks/useNotification'

const MOCK_ENROLLMENTS = [
  {
    id: 1,
    user: { id: 1, name: 'Alice', sortable_name: 'Alice', avatar_url: 'http://img' },
    role: 'StudentEnrollment',
    course_section: { name: 'Section A' },
    start_at: '2026-01-01',
    end_at: '2026-05-01',
    grades: { final_score: 85, final_grade: 'A' },
    enrollment_state: 'completed',
  },
  {
    id: 2,
    user: { id: 2, name: 'Bob', sortable_name: 'Bob' },
    role: 'StudentEnrollment',
    course_section: null,
    start_at: null,
    end_at: null,
    grades: null,
    enrollment_state: 'inactive',
  },
]

function renderWithRoute(ui: React.ReactElement, route = '/courses/1/prior-enrollments') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/courses/:courseId/prior-enrollments" element={ui} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PriorEnrollmentsPage', () => {
  const showToast = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNotification).mockReturnValue({ showToast } as any)
  })

  it('renders loading skeleton', () => {
    vi.mocked(useCanvasQuery).mockReturnValue({ data: null, isLoading: true } as any)

    renderWithRoute(<PriorEnrollmentsPage />)
    expect(screen.getByText('Prior Enrollments')).toBeInTheDocument()
    expect(document.querySelectorAll('.cx-skeleton').length).toBeGreaterThan(0)
  })

  it('renders enrollment table with names, roles, sections, dates, grades', () => {
    vi.mocked(useCanvasQuery).mockReturnValue({ data: MOCK_ENROLLMENTS, isLoading: false } as any)

    renderWithRoute(<PriorEnrollmentsPage />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getAllByText('StudentEnrollment').length).toBe(2)
    expect(screen.getByText('Section A')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('completed')).toBeInTheDocument()
    expect(screen.getByText('inactive')).toBeInTheDocument()
  })

  it('shows empty state when no enrollments', () => {
    vi.mocked(useCanvasQuery).mockReturnValue({ data: [], isLoading: false } as any)

    renderWithRoute(<PriorEnrollmentsPage />)
    expect(screen.getByText('No prior enrollments found for this course.')).toBeInTheDocument()
    expect(screen.getByText('Back to Active Enrollments')).toBeInTheDocument()
  })

  it('filters by search input', () => {
    vi.mocked(useCanvasQuery).mockReturnValue({ data: MOCK_ENROLLMENTS, isLoading: false } as any)

    renderWithRoute(<PriorEnrollmentsPage />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search by name…')
    fireEvent.change(searchInput, { target: { value: 'Alice' } })

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
  })

  it('shows "Export CSV" button', () => {
    vi.mocked(useCanvasQuery).mockReturnValue({ data: MOCK_ENROLLMENTS, isLoading: false } as any)

    renderWithRoute(<PriorEnrollmentsPage />)
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
  })

  it('renders avatar or fallback initial', () => {
    vi.mocked(useCanvasQuery).mockReturnValue({ data: MOCK_ENROLLMENTS, isLoading: false } as any)

    renderWithRoute(<PriorEnrollmentsPage />)
    const avatarImg = screen.getByAltText('') as HTMLImageElement
    expect(avatarImg).toBeInTheDocument()
    expect(avatarImg.src).toBe('http://img/')

    // Bob has no avatar_url, so fallback initial should render
    const fallbackAvatars = document.querySelectorAll(
      'div[style*="border-radius: 50%"][style*="background: var(--cx-color-primary)"]'
    )
    expect(fallbackAvatars.length).toBeGreaterThan(0)
    expect(fallbackAvatars[0].textContent).toBe('B')
  })
})
