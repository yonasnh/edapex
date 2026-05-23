import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { SubmissionForm } from '../SubmissionForm'
import canvasApi from '../../services/canvasApi'

// Mock the Canvas API client
vi.mock('../../services/canvasApi', () => ({
  default: {
    uploadFile: vi.fn(),
  },
}))

// Mock HTMLVideoElement methods that jsdom does not support
window.HTMLVideoElement.prototype.play = vi.fn()
window.HTMLVideoElement.prototype.pause = vi.fn()

// Mock MediaRecorder global
class MockMediaRecorder {
  start = vi.fn()
  stop = vi.fn(() => {
    // Trigger onstop mock callback
    if (this.onstop) this.onstop()
  })
  pause = vi.fn()
  resume = vi.fn()
  ondataavailable?: (e: any) => void
  onstop?: () => void
  constructor(public stream: any, public options: any) {}
}

global.MediaRecorder = MockMediaRecorder as any

describe('SubmissionForm Component', () => {
  const mockSubmit = vi.fn()
  const mockSuccess = vi.fn()
  const mockFetch = vi.fn()

  beforeAll(() => {
    // Mock navigator.mediaDevices
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [
            { stop: vi.fn() }
          ]
        })
      },
      writable: true,
      configurable: true
    })

    // Mock URL methods
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-stream-url')
    global.URL.revokeObjectURL = vi.fn()

    // Mock global fetch
    global.fetch = mockFetch
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({})
    })
  })

  it('renders standard text entry submission form correctly', async () => {
    const { container } = render(
      <SubmissionForm
        assignmentId={42}
        submissionTypes={['online_text_entry']}
        courseId="15"
        onSubmit={mockSubmit}
      />
    )

    expect(screen.getByRole('heading', { name: 'Submit Assignment' })).toBeInTheDocument()
    expect(screen.getByText('Your Response')).toBeInTheDocument()
    
    // Type response
    const textarea = screen.getByPlaceholderText('Type your submission here...')
    fireEvent.change(textarea, { target: { value: 'This is my assignment text body.' } })

    // Submit
    const submitBtn = container.querySelector('.cx-sub-form__submit') as HTMLButtonElement
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/courses/15/assignments/42/submissions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            submission: {
              submission_type: 'online_text_entry',
              body: 'This is my assignment text body.',
            }
          })
        })
      )
      expect(mockSubmit).toHaveBeenCalledWith({
        type: 'online_text_entry',
        body: 'This is my assignment text body.',
      })
    })
  })

  it('renders website URL submission form correctly', async () => {
    const { container } = render(
      <SubmissionForm
        assignmentId={42}
        submissionTypes={['online_url']}
        courseId="15"
        onSubmit={mockSubmit}
      />
    )

    const input = screen.getByPlaceholderText('https://example.com/my-work')
    fireEvent.change(input, { target: { value: 'https://github.com/my/project' } })

    const submitBtn = container.querySelector('.cx-sub-form__submit') as HTMLButtonElement
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/courses/15/assignments/42/submissions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            submission: {
              submission_type: 'online_url',
              url: 'https://github.com/my/project',
            }
          })
        })
      )
    })
  })

  it('renders and supports file uploads correctly', async () => {
    vi.mocked(canvasApi.uploadFile).mockResolvedValue({ id: 1001, display_name: 'work.pdf' } as any)

    const { container } = render(
      <SubmissionForm
        assignmentId={42}
        submissionTypes={['online_upload']}
        courseId="15"
        onSubmit={mockSubmit}
      />
    )

    expect(screen.getByText('Upload Files')).toBeInTheDocument()
    const fileInput = container.querySelector('.cx-sub-form__file-input') as HTMLInputElement
    const file = new File(['hello'], 'work.pdf', { type: 'application/pdf' })
    
    // Simulate file input change
    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(screen.getByText('work.pdf (0.0 KB)')).toBeInTheDocument()

    const submitBtn = container.querySelector('.cx-sub-form__submit') as HTMLButtonElement
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(canvasApi.uploadFile).toHaveBeenCalledWith(file, '15')
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/courses/15/assignments/42/submissions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            submission: {
              submission_type: 'online_upload',
              file_ids: [1001],
            }
          })
        })
      )
    })
  })


  it('handles webcam media_recording flow correctly', async () => {
    vi.mocked(canvasApi.uploadFile).mockResolvedValue({ id: 1002, display_name: 'submission-webcam-recording.webm' } as any)

    render(
      <SubmissionForm
        assignmentId={42}
        submissionTypes={['media_recording']}
        courseId="15"
        onSubmit={mockSubmit}
        onSuccess={mockSuccess}
      />
    )

    // Grant camera access
    const grantBtn = screen.getByRole('button', { name: /Grant Camera/ })
    fireEvent.click(grantBtn)

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled()
      expect(screen.getByRole('button', { name: /Start Recording/ })).toBeInTheDocument()
    })

    // Start recording
    const startBtn = screen.getByRole('button', { name: /Start Recording/ })
    fireEvent.click(startBtn)

    expect(screen.getByText('LIVE RECORDING')).toBeInTheDocument()

    // Stop and review
    const stopBtn = screen.getByRole('button', { name: /Stop & Review/ })
    fireEvent.click(stopBtn)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Re-record/ })).toBeInTheDocument()
    })

    // Click submit assignment to trigger upload
    const submitBtn = screen.getByRole('button', { name: 'Submit Assignment' })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(canvasApi.uploadFile).toHaveBeenCalledWith(
        expect.any(File),
        '15'
      )
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/courses/15/assignments/42/submissions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            submission: {
              submission_type: 'media_recording',
              file_ids: [1002],
            }
          })
        })
      )
      expect(mockSuccess).toHaveBeenCalled()
    })
  })
})
