import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { FavoriteCourses } from '../FavoriteCourses'
import { useCanvasQuery } from '../../hooks/useCanvasQuery'

vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
}))

vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({ config: { ui: { dashboardLayout: 'cards' } } })
}))

describe('FavoriteCourses Widget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCanvasQuery).mockReturnValue({
      data: [
        { id: 101, name: 'Biology 101', course_code: 'BIO101' },
        { id: 102, name: 'History 201', course_code: 'HIS201' }
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)
  })

  it('renders favorite courses from mock data', () => {
    render(<FavoriteCourses />)
    expect(screen.getByText('Biology 101')).toBeInTheDocument()
    expect(screen.getByText('History 201')).toBeInTheDocument()
  })
})
