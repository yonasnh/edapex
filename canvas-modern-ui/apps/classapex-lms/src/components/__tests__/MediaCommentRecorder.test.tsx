/**
 * MediaCommentRecorder Tests
 * ==========================
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import MediaCommentRecorder from '../MediaCommentRecorder'

const mockRequestUpload = vi.fn()
const mockUploadFileToUrl = vi.fn()

vi.mock('../../services/canvasApi', () => ({
  default: {
    requestUpload: (...args: any[]) => mockRequestUpload(...args),
    uploadFileToUrl: (...args: any[]) => mockUploadFileToUrl(...args),
  },
}))

const mockGetUserMedia = vi.fn()
const mockMediaRecorderStart = vi.fn()
const mockMediaRecorderStop = vi.fn()

function setupMediaRecorderMocks() {
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: { getUserMedia: mockGetUserMedia },
    writable: true,
    configurable: true,
  })

  Object.defineProperty(global, 'MediaRecorder', {
    writable: true,
    configurable: true,
    value: vi.fn(() => ({
      start: mockMediaRecorderStart,
      stop: mockMediaRecorderStop,
      ondataavailable: null,
      onstop: null,
      onerror: null,
      state: 'inactive',
      mimeType: 'video/webm',
    })),
  })

  ;(global.MediaRecorder as any).isTypeSupported = vi.fn(() => true)
}

function clearMediaRecorderMocks() {
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: undefined,
    writable: true,
    configurable: true,
  })
  Object.defineProperty(global, 'MediaRecorder', {
    value: undefined,
    writable: true,
    configurable: true,
  })
}

describe('MediaCommentRecorder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearMediaRecorderMocks()
    // Suppress jsdom HTMLMediaElement.play warnings
    global.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve())
  })

  it('shows "Start Recording" button in idle state', () => {
    setupMediaRecorderMocks()
    render(<MediaCommentRecorder onRecordComplete={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Start Recording/i })).toBeInTheDocument()
  })

  it('shows error message if MediaRecorder is not supported', () => {
    clearMediaRecorderMocks()
    render(<MediaCommentRecorder onRecordComplete={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Start Recording/i }))
    expect(screen.getByText('Your browser does not support media recording.')).toBeInTheDocument()
  })

  it('shows "Requesting Permission..." button during requesting state', async () => {
    setupMediaRecorderMocks()
    mockGetUserMedia.mockReturnValue(new Promise(() => {}))
    render(<MediaCommentRecorder onRecordComplete={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Start Recording/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Requesting Permission/i })).toBeInTheDocument()
    })
  })

  it('shows recording timer and "Stop Recording" button during recording', async () => {
    setupMediaRecorderMocks()
    const stream = { getTracks: vi.fn(() => [{ stop: vi.fn() }]) }
    mockGetUserMedia.mockResolvedValue(stream)
    render(<MediaCommentRecorder onRecordComplete={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /Start Recording/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Stop Recording/i })).toBeInTheDocument()
    })

    expect(screen.getByText('00:00')).toBeInTheDocument()
  })

  it('shows preview with "Send" and "Retake" buttons after recording', async () => {
    setupMediaRecorderMocks()
    const stream = { getTracks: vi.fn(() => [{ stop: vi.fn() }]) }
    mockGetUserMedia.mockResolvedValue(stream)
    render(<MediaCommentRecorder onRecordComplete={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /Start Recording/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Stop Recording/i })).toBeInTheDocument()
    })

    const recorderInstance = (global.MediaRecorder as any).mock.results[0].value

    // Simulate data available
    const blob = new Blob(['video-data'], { type: 'video/webm' })
    act(() => {
      if (recorderInstance.ondataavailable) {
        recorderInstance.ondataavailable({ data: blob })
      }
      // Simulate stop
      if (recorderInstance.onstop) {
        recorderInstance.onstop()
      }
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /Retake/i })).toBeInTheDocument()
  })

  it('shows upload progress during uploading', async () => {
    setupMediaRecorderMocks()
    const stream = { getTracks: vi.fn(() => [{ stop: vi.fn() }]) }
    mockGetUserMedia.mockResolvedValue(stream)
    mockRequestUpload.mockResolvedValue({ upload_url: 'http://up', upload_params: {} })
    mockUploadFileToUrl.mockImplementation((_url: string, _params: any, _file: File, onProgress?: (pct: number) => void) => {
      if (onProgress) onProgress(42)
      // Never resolve so the uploading state persists for assertions
      return new Promise(() => {})
    })

    render(<MediaCommentRecorder onRecordComplete={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /Start Recording/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Stop Recording/i })).toBeInTheDocument()
    })

    const recorderInstance = (global.MediaRecorder as any).mock.results[0].value

    const blob = new Blob(['video-data'], { type: 'video/webm' })
    act(() => {
      if (recorderInstance.ondataavailable) {
        recorderInstance.ondataavailable({ data: blob })
      }
      if (recorderInstance.onstop) {
        recorderInstance.onstop()
      }
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Send/i }))

    await waitFor(() => {
      expect(screen.getByText(/Uploading/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/42%/)).toBeInTheDocument()
  })

  it('calls onRecordComplete after successful upload', async () => {
    setupMediaRecorderMocks()
    const stream = { getTracks: vi.fn(() => [{ stop: vi.fn() }]) }
    mockGetUserMedia.mockResolvedValue(stream)
    mockRequestUpload.mockResolvedValue({ upload_url: 'http://up', upload_params: {} })
    mockUploadFileToUrl.mockResolvedValue({ url: 'http://media.mp4' })

    const onRecordComplete = vi.fn()
    render(<MediaCommentRecorder onRecordComplete={onRecordComplete} />)

    fireEvent.click(screen.getByRole('button', { name: /Start Recording/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Stop Recording/i })).toBeInTheDocument()
    })

    const recorderInstance = (global.MediaRecorder as any).mock.results[0].value

    const blob = new Blob(['video-data'], { type: 'video/webm' })
    act(() => {
      if (recorderInstance.ondataavailable) {
        recorderInstance.ondataavailable({ data: blob })
      }
      if (recorderInstance.onstop) {
        recorderInstance.onstop()
      }
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Send/i }))

    await waitFor(() => {
      expect(onRecordComplete).toHaveBeenCalledWith('http://media.mp4', 'video')
    })
  })

  it('calls onCancel when cancel button clicked', async () => {
    setupMediaRecorderMocks()
    const stream = { getTracks: vi.fn(() => [{ stop: vi.fn() }]) }
    mockGetUserMedia.mockResolvedValue(stream)

    const onCancel = vi.fn()
    render(<MediaCommentRecorder onRecordComplete={vi.fn()} onCancel={onCancel} />)

    fireEvent.click(screen.getByRole('button', { name: /Start Recording/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Stop Recording/i })).toBeInTheDocument()
    })

    const recorderInstance = (global.MediaRecorder as any).mock.results[0].value

    const blob = new Blob(['video-data'], { type: 'video/webm' })
    act(() => {
      if (recorderInstance.ondataavailable) {
        recorderInstance.ondataavailable({ data: blob })
      }
      if (recorderInstance.onstop) {
        recorderInstance.onstop()
      }
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
