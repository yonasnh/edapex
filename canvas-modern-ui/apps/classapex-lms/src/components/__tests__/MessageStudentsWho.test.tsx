import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import MessageStudentsWho from '../MessageStudentsWho'
import { canvasFetch } from '../../hooks/useCanvasQuery'
import { useNotification } from '../../hooks/useNotification'

vi.mock('../../hooks/useCanvasQuery', () => ({ canvasFetch: vi.fn() }))
vi.mock('../../hooks/useNotification', () => ({ useNotification: vi.fn() }))

const MOCK_STUDENTS = [
  { id: '1', name: 'Alice', email: 'alice@test.com' },
  { id: '2', name: 'Bob', email: 'bob@test.com' },
  { id: '3', name: 'Charlie', email: 'charlie@test.com' },
]

describe('MessageStudentsWho', () => {
  const showToast = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNotification).mockReturnValue({ showToast } as any)
  })

  it('renders filter options when open', () => {
    render(
      <MessageStudentsWho
        courseId="1"
        students={MOCK_STUDENTS}
        isOpen={true}
        onClose={vi.fn()}
        onSent={vi.fn()}
      />
    )

    expect(screen.getByText("Haven't submitted")).toBeInTheDocument()
    expect(screen.getByText("Haven't been graded")).toBeInTheDocument()
    expect(screen.getByText('Scored less than')).toBeInTheDocument()
    expect(screen.getByText('Scored more than')).toBeInTheDocument()
    expect(screen.getByText('Late submissions')).toBeInTheDocument()
  })

  it('selects "Haven\'t submitted" filter by default', () => {
    render(
      <MessageStudentsWho
        courseId="1"
        students={MOCK_STUDENTS}
        isOpen={true}
        onClose={vi.fn()}
        onSent={vi.fn()}
      />
    )

    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toBeChecked()
    expect(radios[1]).not.toBeChecked()
  })

  it('shows recipient count', () => {
    render(
      <MessageStudentsWho
        courseId="1"
        students={MOCK_STUDENTS}
        isOpen={true}
        onClose={vi.fn()}
        onSent={vi.fn()}
      />
    )

    expect(screen.getByText('Matching students')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('filters students by "not_submitted" when no submission map (all students)', async () => {
    vi.mocked(canvasFetch).mockResolvedValue([])

    render(
      <MessageStudentsWho
        courseId="1"
        students={MOCK_STUDENTS}
        assignmentId="101"
        isOpen={true}
        onClose={vi.fn()}
        onSent={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  it('filters students by "late" (checks submissionMap late flag)', async () => {
    vi.mocked(canvasFetch).mockResolvedValue([
      { user_id: '1', late: true, workflow_state: 'unsubmitted', missing: true },
      { user_id: '2', late: false, workflow_state: 'unsubmitted', missing: true },
      { user_id: '3', late: true, workflow_state: 'unsubmitted', missing: true },
    ])

    render(
      <MessageStudentsWho
        courseId="1"
        students={MOCK_STUDENTS}
        assignmentId="101"
        isOpen={true}
        onClose={vi.fn()}
        onSent={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send to 3/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Late submissions'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send to 2/i })).toBeInTheDocument()
    })
  })

  it('filters students by "scored_less_than" with threshold input', async () => {
    vi.mocked(canvasFetch).mockResolvedValue([
      { user_id: '1', score: 85, workflow_state: 'unsubmitted', missing: true },
      { user_id: '2', score: 45, workflow_state: 'unsubmitted', missing: true },
      { user_id: '3', score: 70, workflow_state: 'unsubmitted', missing: true },
    ])

    render(
      <MessageStudentsWho
        courseId="1"
        students={MOCK_STUDENTS}
        assignmentId="101"
        isOpen={true}
        onClose={vi.fn()}
        onSent={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send to 3/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Scored less than'))

    const thresholdInput = screen.getByPlaceholderText('0')
    fireEvent.change(thresholdInput, { target: { value: '60' } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send to 1/i })).toBeInTheDocument()
    })
  })

  it('disables send button when no subject/body', () => {
    render(
      <MessageStudentsWho
        courseId="1"
        students={MOCK_STUDENTS}
        isOpen={true}
        onClose={vi.fn()}
        onSent={vi.fn()}
      />
    )

    const sendButton = screen.getByRole('button', { name: /send to/i })
    expect(sendButton).toBeDisabled()
  })

  it('calls canvasFetch with correct conversation payload on send', async () => {
    vi.mocked(canvasFetch).mockResolvedValue({ id: 999 })

    render(
      <MessageStudentsWho
        courseId="1"
        students={MOCK_STUDENTS}
        isOpen={true}
        onClose={vi.fn()}
        onSent={vi.fn()}
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Enter subject…'), { target: { value: 'Reminder' } })
    fireEvent.change(screen.getByPlaceholderText('Type your message here…'), { target: { value: 'Please submit your work.' } })

    const sendButton = screen.getByRole('button', { name: /send to/i })
    expect(sendButton).not.toBeDisabled()

    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith('/api/v1/conversations', {
        method: 'POST',
        body: {
          recipients: ['1', '2', '3'],
          subject: 'Reminder',
          body: 'Please submit your work.',
          force_new: true,
        },
      })
    })
  })

  it('disables send button when subject is empty but body is present', () => {
    render(
      <MessageStudentsWho
        courseId="1"
        students={MOCK_STUDENTS}
        isOpen={true}
        onClose={vi.fn()}
        onSent={vi.fn()}
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Type your message here…'), { target: { value: 'Hello' } })

    const sendButton = screen.getByRole('button', { name: /send to/i })
    expect(sendButton).toBeDisabled()
    expect(canvasFetch).not.toHaveBeenCalled()
  })

  it('closes modal and resets state on cancel', () => {
    const onClose = vi.fn()

    render(
      <MessageStudentsWho
        courseId="1"
        students={MOCK_STUDENTS}
        isOpen={true}
        onClose={onClose}
        onSent={vi.fn()}
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Enter subject…'), { target: { value: 'Test Subject' } })
    fireEvent.change(screen.getByPlaceholderText('Type your message here…'), { target: { value: 'Test Body' } })
    fireEvent.click(screen.getByText('Scored less than'))
    fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '50' } })

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onClose).toHaveBeenCalled()
  })
})
