/**
 * NewQuizzesIframe Tests
 * ======================
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import NewQuizzesIframe from '../NewQuizzesIframe'

describe('NewQuizzesIframe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders iframe with correct src for take mode', () => {
    render(
      <NewQuizzesIframe
        courseId="1"
        assignmentId={456}
        mode="take"
        onExit={vi.fn()}
      />
    )

    const iframe = screen.getByTitle('New Quiz')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', '/courses/1/new_quizzes/taking?assignment_id=456')
  })

  it('renders iframe with correct src for build mode', () => {
    render(
      <NewQuizzesIframe
        courseId="1"
        assignmentId={789}
        mode="build"
        onExit={vi.fn()}
      />
    )

    const iframe = screen.getByTitle('New Quiz')
    expect(iframe).toHaveAttribute('src', '/courses/1/new_quizzes/build?assignment_id=789')
  })

  it('renders iframe with correct src for moderate mode', () => {
    render(
      <NewQuizzesIframe
        courseId="2"
        assignmentId={101}
        mode="moderate"
        onExit={vi.fn()}
      />
    )

    const iframe = screen.getByTitle('New Quiz')
    expect(iframe).toHaveAttribute('src', '/courses/2/new_quizzes/moderation?assignment_id=101')
  })

  it('calls onExit when exit button clicked', () => {
    const onExit = vi.fn()
    render(
      <NewQuizzesIframe
        courseId="1"
        assignmentId={456}
        mode="take"
        onExit={onExit}
      />
    )

    fireEvent.click(screen.getByText('Exit'))
    expect(onExit).toHaveBeenCalled()
  })

  it('shows loading spinner initially', () => {
    render(
      <NewQuizzesIframe
        courseId="1"
        assignmentId={456}
        mode="take"
        onExit={vi.fn()}
      />
    )

    expect(screen.getByText('Loading New Quiz…')).toBeInTheDocument()
  })


})
