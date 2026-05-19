import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import DashboardV2 from '../DashboardV2'
import { MemoryRouter } from 'react-router-dom'

// Mock the Canvas query hook
vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn().mockImplementation((url: string) => {
    if (url === '/api/v1/courses') {
      return { data: [{ id: 1, name: 'Math 101' }], isLoading: false }
    }
    return { data: [], isLoading: false }
  })
}))

// Mock context
vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({ config: { ui: { dashboardLayout: 'cards' } } })
}))

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
