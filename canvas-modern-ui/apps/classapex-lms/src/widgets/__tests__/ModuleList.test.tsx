import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
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
    render(<ModuleList modules={mockModules} courseId="123" />)
    expect(screen.getByText('Week 1: Intro')).toBeInTheDocument()
    expect(screen.getByText('Readings')).toBeInTheDocument()
  })

  it('shows publish toggles when teacher', () => {
    render(<ModuleList modules={mockModules} courseId="123" isTeacher={true} />)
    // The "Published" toggle or the drag grip `::` should be visible
    expect(screen.getByText('::')).toBeInTheDocument()
  })
})
