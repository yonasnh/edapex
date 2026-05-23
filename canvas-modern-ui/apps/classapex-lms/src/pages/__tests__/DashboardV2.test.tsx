import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

// Mock the Canvas query hook
vi.mock('../../hooks/useCanvasQuery', () => {
  const mockCourses = [{ id: 1, name: 'Math 101' }]
  const mockEmpty: any[] = []
  return {
    useCanvasQuery: vi.fn().mockImplementation((url: string) => {
      if (url === '/api/v1/courses') {
        return { data: mockCourses, isLoading: false }
      }
      return { data: mockEmpty, isLoading: false }
    })
  }
})

// Mock context
vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({ config: { ui: { dashboardLayout: 'cards' } } })
}))

import DashboardV2 from '../DashboardV2'

describe('DashboardV2', () => {
  it('renders dashboard with mocked course', () => {
    render(
      <MemoryRouter>
        <DashboardV2 />
      </MemoryRouter>
    )
    // "Active Courses" text should be present
    expect(screen.getByText('Math 101')).toBeInTheDocument()
    expect(screen.getByText('Active Courses')).toBeInTheDocument()
  })
})
