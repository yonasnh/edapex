import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { FavoriteCourses } from '../FavoriteCourses'

// Mock the Canvas query hook
vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn().mockImplementation((url: string) => {
    return {
      data: [
        { id: 101, name: 'Biology 101', course_code: 'BIO101' },
        { id: 102, name: 'History 201', course_code: 'HIS201' }
      ],
      isLoading: false
    }
  })
}))

// Mock context
vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({ config: { ui: { dashboardLayout: 'cards' } } })
}))

describe('FavoriteCourses Widget', () => {
  it('renders favorite courses from mock data', () => {
    render(<FavoriteCourses />)
    expect(screen.getByText('Favorites')).toBeInTheDocument()
    expect(screen.getByText('Biology 101')).toBeInTheDocument()
    expect(screen.getByText('History 201')).toBeInTheDocument()
  })
})
