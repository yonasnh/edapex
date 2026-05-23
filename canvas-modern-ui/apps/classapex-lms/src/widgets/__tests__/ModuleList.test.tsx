import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ModuleList } from '../ModuleList'

describe('ModuleList', () => {
  const mockModules = [
    {
      id: 1,
      name: 'Week 1: Intro',
      position: 1,
      items: [
        { id: 101, title: 'Readings', type: 'Page' }
      ]
    }
  ]

  it('renders modules and items', () => {
    render(
      <MemoryRouter>
        <ModuleList modules={mockModules} courseId="123" />
      </MemoryRouter>
    )
    expect(screen.getByText('Week 1: Intro')).toBeInTheDocument()
    expect(screen.getByText('Readings')).toBeInTheDocument()
  })

  it('shows publish toggles when teacher', () => {
    render(
      <MemoryRouter>
        <ModuleList modules={mockModules} courseId="123" isTeacher={true} />
      </MemoryRouter>
    )
    // The "Published" toggle or the drag grip `::` should be visible
    expect(screen.getByText('::')).toBeInTheDocument()
  })
})
