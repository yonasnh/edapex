import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import CollaborationIframeModal from '../CollaborationIframeModal'

describe('CollaborationIframeModal', () => {
  it('renders header with course id', () => {
    render(<CollaborationIframeModal courseId="123" onClose={vi.fn()} />)
    expect(screen.getByText('Collaborations')).toBeInTheDocument()
    expect(screen.getByText('Canvas LTI')).toBeInTheDocument()
  })

  it('renders iframe with correct src', () => {
    render(<CollaborationIframeModal courseId="123" onClose={vi.fn()} />)
    const iframe = screen.getByTitle('Canvas Collaborations') as HTMLIFrameElement
    expect(iframe).toBeInTheDocument()
    expect(iframe.src).toContain('/courses/123/lti_collaborations')
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<CollaborationIframeModal courseId="123" onClose={onClose} />)
    fireEvent.click(screen.getByText('Close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('provides external link to Canvas', () => {
    render(<CollaborationIframeModal courseId="123" onClose={vi.fn()} />)
    const link = screen.getByText('Open in Canvas').closest('a')
    expect(link).toHaveAttribute('href', '/courses/123/lti_collaborations')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('shows loading spinner initially', () => {
    render(<CollaborationIframeModal courseId="123" onClose={vi.fn()} />)
    expect(screen.getByText('Loading Canvas Collaborations…')).toBeInTheDocument()
  })
})
