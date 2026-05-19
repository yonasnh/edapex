import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Pages from '../Pages'
import { MemoryRouter } from 'react-router-dom'

// Mock the Canvas query hook
vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn().mockImplementation((url: string) => {
    return {
      data: [{ page_id: 1, url: 'home', title: 'Welcome to Class', updated_at: new Date().toISOString(), published: true }],
      isLoading: false
    }
  })
}))

// Mock context
vi.mock('../../contexts/RoleContext', () => ({
  useRole: () => ({ role: 'student' })
}))

describe('Pages (Wiki)', () => {
  it('renders wiki pages list', () => {
    render(
      <MemoryRouter>
        <Pages />
      </MemoryRouter>
    )
    expect(screen.getByText('Welcome to Class')).toBeInTheDocument()
  })
})
