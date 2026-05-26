/**
 * PageHistoryModal Tests
 * ======================
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import PageHistoryModal from '../PageHistoryModal'
import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery'
import { useNotification } from '../../hooks/useNotification'

vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
}))

vi.mock('../../hooks/useNotification', () => ({
  useNotification: vi.fn(),
}))

const MOCK_REVISIONS = [
  {
    revision_id: 3,
    updated_at: '2026-05-20T10:00:00Z',
    latest: true,
    edited_by: { display_name: 'Alice', avatar_image_url: '' },
    body: '<p>Latest content</p>',
    page_title: 'Welcome',
  },
  {
    revision_id: 2,
    updated_at: '2026-05-15T10:00:00Z',
    latest: false,
    edited_by: { display_name: 'Bob' },
    body: '<p>Older content</p>',
    page_title: 'Welcome',
  },
  {
    revision_id: 1,
    updated_at: '2026-05-10T10:00:00Z',
    latest: false,
    edited_by: { display_name: 'Alice' },
    body: '<p>Original content</p>',
    page_title: 'Welcome',
  },
]

function mockHistoryData(data: any[] | null, loading = false) {
  vi.mocked(useCanvasQuery).mockReturnValue({
    data: data as any,
    isLoading: loading,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as any)
}

function mockNotifications() {
  vi.mocked(useNotification).mockReturnValue({
    showToast: vi.fn(),
    showConfirm: vi.fn().mockResolvedValue(true),
    showAlert: vi.fn(),
  } as any)
}

describe('PageHistoryModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNotifications()
  })

  it('renders nothing when closed', () => {
    mockHistoryData(null)
    const { container } = render(
      <PageHistoryModal courseId="1" pageUrl="welcome" isOpen={false} onClose={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders loading skeleton when open and loading', () => {
    mockHistoryData(null, true)
    render(<PageHistoryModal courseId="1" pageUrl="welcome" isOpen={true} onClose={vi.fn()} />)
    expect(document.querySelector('.cx-skeleton')).toBeInTheDocument()
  })

  it('renders revision list with editor names and dates', () => {
    mockHistoryData(MOCK_REVISIONS)
    render(<PageHistoryModal courseId="1" pageUrl="welcome" isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText('#3')).toBeInTheDocument()
    expect(screen.getByText('Latest')).toBeInTheDocument()
    expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('#1')).toBeInTheDocument()
  })

  it('shows empty state when no revisions', () => {
    mockHistoryData([])
    render(<PageHistoryModal courseId="1" pageUrl="welcome" isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('No revisions found.')).toBeInTheDocument()
  })

  it('opens preview when Preview clicked', () => {
    mockHistoryData(MOCK_REVISIONS)
    render(<PageHistoryModal courseId="1" pageUrl="welcome" isOpen={true} onClose={vi.fn()} />)

    const previewButtons = screen.getAllByText('Preview')
    fireEvent.click(previewButtons[1]) // Click preview for revision #2

    expect(screen.getByText('Revision #2')).toBeInTheDocument()
    expect(screen.getByText('Restore this version')).toBeInTheDocument()
  })

  it('calls canvasFetch on restore', async () => {
    vi.mocked(canvasFetch).mockResolvedValue({})
    mockHistoryData(MOCK_REVISIONS)
    render(<PageHistoryModal courseId="1" pageUrl="welcome" isOpen={true} onClose={vi.fn()} />)

    const restoreButtons = screen.getAllByText('Restore')
    fireEvent.click(restoreButtons[0]) // Restore revision #2 (first non-latest)

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/courses/1/pages/welcome/revisions/2'),
        expect.objectContaining({ method: 'PUT' })
      )
    })
  })

  it('enables compare button when two revisions selected', () => {
    mockHistoryData(MOCK_REVISIONS)
    render(<PageHistoryModal courseId="1" pageUrl="welcome" isOpen={true} onClose={vi.fn()} />)

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0]) // Select rev 3
    fireEvent.click(checkboxes[1]) // Select rev 2

    expect(screen.getByText('Compare selected')).toBeInTheDocument()
  })

  it('calls onClose when Close clicked', () => {
    mockHistoryData(MOCK_REVISIONS)
    const onClose = vi.fn()
    render(<PageHistoryModal courseId="1" pageUrl="welcome" isOpen={true} onClose={onClose} />)

    fireEvent.click(screen.getByText('Close'))
    expect(onClose).toHaveBeenCalled()
  })
})
