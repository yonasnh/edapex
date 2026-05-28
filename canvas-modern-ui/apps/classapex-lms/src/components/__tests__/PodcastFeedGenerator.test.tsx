/**
 * PodcastFeedGenerator Tests
 * ==========================
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import PodcastFeedGenerator from '../PodcastFeedGenerator'

vi.mock('../../hooks/useCanvasQuery', () => ({ useCanvasQuery: vi.fn() }))
vi.mock('../../hooks/useNotification', () => ({ useNotification: vi.fn() }))

import { useCanvasQuery } from '../../hooks/useCanvasQuery'
import { useNotification } from '../../hooks/useNotification'

Object.assign(global, {
  URL: {
    createObjectURL: vi.fn(() => 'blob:test'),
    revokeObjectURL: vi.fn(),
  },
})
Object.assign(global.navigator, {
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
})

const MOCK_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Week 1 Update',
    message: '<p>Welcome!</p>',
    posted_at: '2026-01-01T00:00:00Z',
    author: { display_name: 'Prof A' },
  },
]

describe('PodcastFeedGenerator', () => {
  const showToast = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNotification).mockReturnValue({ showToast } as any)
  })

  it('renders Podcast Feed button', () => {
    vi.mocked(useCanvasQuery).mockReturnValue({ data: null, isLoading: false } as any)

    render(<PodcastFeedGenerator courseId="1" feedType="announcements" />)
    expect(screen.getByText('Podcast Feed')).toBeInTheDocument()
  })

  it('opens modal on click', () => {
    vi.mocked(useCanvasQuery).mockReturnValue({ data: null, isLoading: false } as any)

    render(<PodcastFeedGenerator courseId="1" feedType="announcements" />)
    fireEvent.click(screen.getByText('Podcast Feed'))
    expect(screen.getByText('Podcast RSS Feed')).toBeInTheDocument()
  })

  it('shows correct feed source label', () => {
    vi.mocked(useCanvasQuery).mockReturnValue({ data: null, isLoading: false } as any)

    const { rerender } = render(<PodcastFeedGenerator courseId="1" feedType="announcements" />)
    fireEvent.click(screen.getByText('Podcast Feed'))
    expect(screen.getByText('Announcements')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Close'))
    rerender(<PodcastFeedGenerator courseId="1" feedType="discussions" />)
    fireEvent.click(screen.getByText('Podcast Feed'))
    expect(screen.getByText('Discussions')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Close'))
    rerender(<PodcastFeedGenerator courseId="1" feedType="both" />)
    fireEvent.click(screen.getByText('Podcast Feed'))
    expect(screen.getByText('Announcements & Discussions')).toBeInTheDocument()
  })

  it('shows item count', () => {
    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint.includes('announcements')) {
        return { data: MOCK_ANNOUNCEMENTS, isLoading: false } as any
      }
      if (endpoint.includes('discussion_topics')) {
        return { data: [{ id: 2, title: 'Discussion 1', message: '<p>Hello</p>', posted_at: '2026-01-02T00:00:00Z', author: { display_name: 'Prof B' } }], isLoading: false } as any
      }
      return { data: null, isLoading: false } as any
    })

    render(<PodcastFeedGenerator courseId="1" feedType="both" />)
    fireEvent.click(screen.getByText('Podcast Feed'))
    expect(screen.getByText('2 items')).toBeInTheDocument()
  })

  it('calls clipboard.writeText on Copy RSS URL', async () => {
    vi.mocked(useCanvasQuery).mockReturnValue({ data: MOCK_ANNOUNCEMENTS, isLoading: false } as any)

    render(<PodcastFeedGenerator courseId="1" feedType="announcements" />)
    fireEvent.click(screen.getByText('Podcast Feed'))
    fireEvent.click(screen.getByText('Copy RSS URL'))

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'RSS URL copied', type: 'success' }))
  })

  it('creates download link on Download RSS', () => {
    vi.mocked(useCanvasQuery).mockReturnValue({ data: MOCK_ANNOUNCEMENTS, isLoading: false } as any)
    const createElementSpy = vi.spyOn(document, 'createElement')

    render(<PodcastFeedGenerator courseId="1" feedType="announcements" />)
    fireEvent.click(screen.getByText('Podcast Feed'))
    fireEvent.click(screen.getByText('Download RSS'))

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'RSS feed downloaded', type: 'success' }))

    createElementSpy.mockRestore()
  })

  it('shows RSS preview containing <rss tag', () => {
    vi.mocked(useCanvasQuery).mockReturnValue({ data: MOCK_ANNOUNCEMENTS, isLoading: false } as any)

    render(<PodcastFeedGenerator courseId="1" feedType="announcements" />)
    fireEvent.click(screen.getByText('Podcast Feed'))

    const summary = screen.getByText('Preview RSS XML')
    expect(summary).toBeInTheDocument()

    // Open the details block so the pre is rendered
    fireEvent.click(summary)

    const pre = document.querySelector('pre')
    expect(pre).toBeInTheDocument()
    expect(pre!.textContent).toContain('<rss')
  })
})
