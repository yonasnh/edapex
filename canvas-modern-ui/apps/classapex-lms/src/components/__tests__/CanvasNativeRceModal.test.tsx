/**
 * CanvasNativeRceModal Tests
 * ==========================
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import CanvasNativeRceModal from '../CanvasNativeRceModal'

describe('CanvasNativeRceModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when closed', () => {
    const { container } = render(
      <CanvasNativeRceModal
        courseId="1"
        contentType="page"
        contentId={123}
        isOpen={false}
        onClose={vi.fn()}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders iframe with correct src when open (page)', () => {
    render(
      <CanvasNativeRceModal
        courseId="1"
        contentType="page"
        contentId={123}
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    const iframe = screen.getByTitle('Canvas page editor')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', '/courses/1/pages/123/edit')
  })

  it('renders iframe with correct src for assignment', () => {
    render(
      <CanvasNativeRceModal
        courseId="2"
        contentType="assignment"
        contentId={456}
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    const iframe = screen.getByTitle('Canvas assignment editor')
    expect(iframe).toHaveAttribute('src', '/courses/2/assignments/456/edit')
  })

  it('renders iframe with pageUrl when provided', () => {
    render(
      <CanvasNativeRceModal
        courseId="1"
        contentType="page"
        contentId={123}
        pageUrl="welcome-page"
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    const iframe = screen.getByTitle('Canvas page editor')
    expect(iframe).toHaveAttribute('src', '/courses/1/pages/welcome-page/edit')
  })

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(
      <CanvasNativeRceModal
        courseId="1"
        contentType="page"
        contentId={123}
        isOpen={true}
        onClose={onClose}
      />
    )

    fireEvent.click(screen.getByTitle('Close editor'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSave when save button clicked', () => {
    const onSave = vi.fn()
    render(
      <CanvasNativeRceModal
        courseId="1"
        contentType="page"
        contentId={123}
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
      />
    )

    fireEvent.click(screen.getByTitle('Trigger save (if supported by Canvas page)'))
    expect(onSave).toHaveBeenCalled()
  })

  it('shows loading spinner initially', () => {
    render(
      <CanvasNativeRceModal
        courseId="1"
        contentType="page"
        contentId={123}
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByText('Loading Canvas Editor…')).toBeInTheDocument()
  })


})
