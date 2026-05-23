import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { MediaLibrary } from '../MediaLibrary'
import { useCanvasQuery } from '../../hooks/useCanvasQuery'
import canvasApi from '../../services/canvasApi'

// Mock the hooks and services
vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
}))

vi.mock('../../services/canvasApi', () => ({
  default: {
    requestUpload: vi.fn(),
    uploadFileToUrl: vi.fn(),
    confirmUpload: vi.fn(),
    uploadFile: vi.fn(),
  },
}))

const mockFiles = [
  {
    id: 101,
    uuid: 'uuid-1',
    folder_id: 1,
    display_name: 'Intro Lecture.mp4',
    filename: 'intro.mp4',
    contentType: 'video/mp4',
    'content-type': 'video/mp4',
    url: 'https://canvas.example.com/files/101/download',
    size: 10485760, // 10MB
    created_at: '2026-05-20T10:00:00Z',
    updated_at: '2026-05-20T10:00:00Z',
  },
  {
    id: 102,
    uuid: 'uuid-2',
    folder_id: 1,
    display_name: 'Podcast Episode 1.mp3',
    filename: 'episode1.mp3',
    contentType: 'audio/mpeg',
    'content-type': 'audio/mpeg',
    url: 'https://canvas.example.com/files/102/download',
    size: 5242880, // 5MB
    created_at: '2026-05-21T11:00:00Z',
    updated_at: '2026-05-21T11:00:00Z',
  },
  {
    id: 103,
    uuid: 'uuid-3',
    folder_id: 1,
    display_name: 'Python Cheat Sheet.png',
    filename: 'python.png',
    contentType: 'image/png',
    'content-type': 'image/png',
    url: 'https://canvas.example.com/files/103/download',
    size: 512000, // 500KB
    created_at: '2026-05-19T09:00:00Z',
    updated_at: '2026-05-19T09:00:00Z',
  },
]

describe('MediaLibrary Component', () => {
  const mockRefetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCanvasQuery).mockReturnValue({
      data: mockFiles,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any)
  })

  it('renders instructional media grid correctly', () => {
    render(<MediaLibrary courseId="15" />)

    expect(screen.getByText('Intro Lecture.mp4')).toBeInTheDocument()
    expect(screen.getByText('Podcast Episode 1.mp3')).toBeInTheDocument()
    expect(screen.getByText('Python Cheat Sheet.png')).toBeInTheDocument()
    expect(screen.getByText('10.0 MB')).toBeInTheDocument()
    expect(screen.getByText('5.0 MB')).toBeInTheDocument()
    expect(screen.getByText('0.5 MB')).toBeInTheDocument()
  })

  it('filters media by search query', () => {
    render(<MediaLibrary courseId="15" />)

    const searchInput = screen.getByPlaceholderText('Search media library...')
    fireEvent.change(searchInput, { target: { value: 'Podcast' } })

    expect(screen.getByText('Podcast Episode 1.mp3')).toBeInTheDocument()
    expect(screen.queryByText('Intro Lecture.mp4')).not.toBeInTheDocument()
    expect(screen.queryByText('Python Cheat Sheet.png')).not.toBeInTheDocument()
  })

  it('filters media by active categories/tabs', () => {
    render(<MediaLibrary courseId="15" />)

    // Filter by Video
    const videoTab = screen.getByRole('button', { name: /Videos/ })
    fireEvent.click(videoTab)
    expect(screen.getByText('Intro Lecture.mp4')).toBeInTheDocument()
    expect(screen.queryByText('Podcast Episode 1.mp3')).not.toBeInTheDocument()

    // Filter by Audio
    const audioTab = screen.getByRole('button', { name: /Audio/ })
    fireEvent.click(audioTab)
    expect(screen.getByText('Podcast Episode 1.mp3')).toBeInTheDocument()
    expect(screen.queryByText('Intro Lecture.mp4')).not.toBeInTheDocument()

    // Filter by Image
    const imageTab = screen.getByRole('button', { name: /Images/ })
    fireEvent.click(imageTab)
    expect(screen.getByText('Python Cheat Sheet.png')).toBeInTheDocument()
    expect(screen.queryByText('Podcast Episode 1.mp3')).not.toBeInTheDocument()
  })

  it('opens modern preview modal on media click', () => {
    render(<MediaLibrary courseId="15" />)

    const videoItem = screen.getByText('Intro Lecture.mp4')
    fireEvent.click(videoItem)

    // Verify modal header is rendered
    expect(screen.getByRole('heading', { name: 'Intro Lecture.mp4' })).toBeInTheDocument()
    
    // Close modal
    const closeBtn = screen.getByRole('button', { name: '×' })
    fireEvent.click(closeBtn)
    expect(screen.queryByRole('heading', { name: 'Intro Lecture.mp4' })).not.toBeInTheDocument()
  })

  it('supports item selection in select mode', () => {
    const handleSelectMedia = vi.fn()
    render(<MediaLibrary courseId="15" isSelectMode={true} onSelectMedia={handleSelectMedia} />)

    const videoItem = screen.getByText('Intro Lecture.mp4')
    fireEvent.click(videoItem)

    expect(handleSelectMedia).toHaveBeenCalledWith(
      'https://canvas.example.com/files/101/download',
      'video',
      'Intro Lecture.mp4'
    )
  })

  it('handles drag and drop uploads securely', async () => {
    vi.mocked(canvasApi.requestUpload).mockResolvedValue({
      upload_url: 'https://s3.example.com/upload-here',
      upload_params: { key: 'val' },
    })
    vi.mocked(canvasApi.uploadFileToUrl).mockResolvedValue({ id: 999 })
    vi.mocked(canvasApi.confirmUpload).mockResolvedValue({} as any)

    render(<MediaLibrary courseId="15" />)

    const dropzone = screen.getByText(/Drag & drop audio, video, or image learning materials here/)

    const file = new File(['dummy content'], 'new-video.mp4', { type: 'video/mp4' })
    
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    })

    await waitFor(() => {
      expect(canvasApi.requestUpload).toHaveBeenCalled()
      expect(canvasApi.uploadFileToUrl).toHaveBeenCalled()
      expect(canvasApi.confirmUpload).toHaveBeenCalledWith(999)
      expect(mockRefetch).toHaveBeenCalled()
    })
  })
})
