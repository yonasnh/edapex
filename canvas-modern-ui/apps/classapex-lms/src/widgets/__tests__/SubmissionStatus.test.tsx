import { render, screen } from '@testing-library/react'
import { SubmissionStatus } from '../SubmissionStatus'

describe('SubmissionStatus Component', () => {
  it('renders unsubmitted status correctly', () => {
    render(<SubmissionStatus status="unsubmitted" />)
    expect(screen.getByText('Not Submitted')).toBeInTheDocument()
    expect(screen.getByText('circle')).toBeInTheDocument()
  })

  it('renders submitted status correctly', () => {
    render(<SubmissionStatus status="submitted" />)
    expect(screen.getByText('Submitted')).toBeInTheDocument()
    expect(screen.getByText('check')).toBeInTheDocument()
  })

  it('renders missing status correctly', () => {
    render(<SubmissionStatus status="missing" />)
    expect(screen.getByText('Missing')).toBeInTheDocument()
    expect(screen.getByText('x')).toBeInTheDocument()
  })

  it('renders late status correctly', () => {
    render(<SubmissionStatus status="late" />)
    expect(screen.getByText('Late')).toBeInTheDocument()
    expect(screen.getByText('warning')).toBeInTheDocument()
  })

  it('renders graded status correctly with grade info', () => {
    render(<SubmissionStatus status="graded" grade={85} pointsPossible={100} />)
    expect(screen.getByText('Graded')).toBeInTheDocument()
    expect(screen.getByText('85/100 (85%)')).toBeInTheDocument()
  })

  it('handles graded status with missing pointsPossible', () => {
    render(<SubmissionStatus status="graded" grade={85} />)
    expect(screen.getByText('Graded')).toBeInTheDocument()
    expect(screen.getByText('85/-- (%)')).toBeInTheDocument()
  })

  it('applies correct size classes', () => {
    const { container } = render(<SubmissionStatus status="submitted" size="sm" />)
    const span = container.firstChild as HTMLElement
    expect(span.classList.contains('cx-sub-status--sm')).toBe(true)
    expect(span.classList.contains('cx-sub-status--submitted')).toBe(true)
  })
})
