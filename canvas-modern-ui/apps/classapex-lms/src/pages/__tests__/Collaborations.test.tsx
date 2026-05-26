import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import CollaborationsPage from '../Collaborations'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
}))

vi.mock('../../hooks/useNotification', () => ({
  useNotification: () => ({
    showToast: vi.fn(),
    showConfirm: vi.fn().mockResolvedValue(true),
  }),
}))

vi.mock('../../contexts/RoleContext', () => ({
  useRole: () => ({ role: 'teacher' }),
  RoleProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery'

const mockedUseCanvasQuery = vi.mocked(useCanvasQuery)
const mockedCanvasFetch = vi.mocked(canvasFetch)

function renderPage(initialEntries = ['/courses/1/collaborations']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/courses/:courseId/collaborations" element={<CollaborationsPage />} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CollaborationsPage', () => {
  beforeEach(() => {
    mockedUseCanvasQuery.mockReset()
    mockedCanvasFetch.mockReset()
  })

  it('renders loading state', () => {
    mockedUseCanvasQuery.mockReturnValue({ data: undefined, isLoading: true, refetch: vi.fn() } as any)
    renderPage()
    expect(screen.getByText('Collaborations')).toBeInTheDocument()
    expect(document.querySelectorAll('.cx-skeleton').length).toBeGreaterThan(0)
  })

  it('renders empty state for teacher with create button', () => {
    mockedUseCanvasQuery.mockReturnValue({ data: [], isLoading: false, refetch: vi.fn() } as any)
    renderPage()
    expect(screen.getByText('No collaborations yet for this course.')).toBeInTheDocument()
    expect(screen.getByText('Create the first collaboration')).toBeInTheDocument()
    expect(screen.getByTestId('create-collaboration-btn')).toBeInTheDocument()
  })

  it('renders collaboration list with metadata', () => {
    const collabs = [
      {
        id: 101,
        title: 'Group Project Doc',
        collaboration_type: 'google_docs',
        user_name: 'Alice Smith',
        created_at: '2024-01-15T10:00:00Z',
        url: 'https://docs.google.com/document/d/abc123',
        permissions: { update: true, delete: true },
      },
      {
        id: 102,
        title: 'Sprint Planning',
        collaboration_type: 'office_365',
        user_name: 'Bob Jones',
        created_at: '2024-02-20T14:30:00Z',
        url: 'https://example.com/office',
        permissions: { update: false, delete: false },
      },
    ]
    mockedUseCanvasQuery.mockReturnValue({ data: collabs, isLoading: false, refetch: vi.fn() } as any)
    renderPage()

    expect(screen.getByTestId('collaboration-101')).toBeInTheDocument()
    expect(screen.getByTestId('collaboration-102')).toBeInTheDocument()
    expect(screen.getByText('Group Project Doc')).toBeInTheDocument()
    expect(screen.getByText('Sprint Planning')).toBeInTheDocument()
    expect(screen.getByText('Google Docs')).toBeInTheDocument()
    expect(screen.getByText('Office 365')).toBeInTheDocument()
    expect(screen.getByText(/Alice Smith/)).toBeInTheDocument()
    expect(screen.getByText(/Bob Jones/)).toBeInTheDocument()
  })

  it('shows Open links for each collaboration', () => {
    const collabs = [
      {
        id: 101,
        title: 'Group Project Doc',
        collaboration_type: 'google_docs',
        user_name: 'Alice',
        created_at: '2024-01-15T10:00:00Z',
        url: 'https://docs.google.com/document/d/abc123',
        permissions: { update: true, delete: true },
      },
    ]
    mockedUseCanvasQuery.mockReturnValue({ data: collabs, isLoading: false, refetch: vi.fn() } as any)
    renderPage()

    const openLink = screen.getByTestId('open-collab-101')
    expect(openLink).toHaveAttribute('href', 'https://docs.google.com/document/d/abc123')
    expect(openLink).toHaveAttribute('target', '_blank')
  })

  it('shows delete button when permission is granted', () => {
    const collabs = [
      {
        id: 101,
        title: 'Group Project Doc',
        collaboration_type: 'google_docs',
        user_name: 'Alice',
        created_at: '2024-01-15T10:00:00Z',
        url: 'https://docs.google.com/document/d/abc123',
        permissions: { update: true, delete: true },
      },
    ]
    mockedUseCanvasQuery.mockReturnValue({ data: collabs, isLoading: false, refetch: vi.fn() } as any)
    renderPage()

    expect(screen.getByTestId('delete-collab-101')).toBeInTheDocument()
  })

  it('hides delete button when permission is denied', () => {
    const collabs = [
      {
        id: 101,
        title: 'Group Project Doc',
        collaboration_type: 'google_docs',
        user_name: 'Alice',
        created_at: '2024-01-15T10:00:00Z',
        url: 'https://docs.google.com/document/d/abc123',
        permissions: { update: false, delete: false },
      },
    ]
    mockedUseCanvasQuery.mockReturnValue({ data: collabs, isLoading: false, refetch: vi.fn() } as any)
    renderPage()

    expect(screen.queryByTestId('delete-collab-101')).not.toBeInTheDocument()
  })

  it('calls canvasFetch on delete confirmation', async () => {
    const refetch = vi.fn()
    const collabs = [
      {
        id: 101,
        title: 'Group Project Doc',
        collaboration_type: 'google_docs',
        user_name: 'Alice',
        created_at: '2024-01-15T10:00:00Z',
        url: 'https://docs.google.com/document/d/abc123',
        permissions: { update: true, delete: true },
      },
    ]
    mockedUseCanvasQuery.mockReturnValue({ data: collabs, isLoading: false, refetch } as any)
    mockedCanvasFetch.mockResolvedValue({})
    renderPage()

    fireEvent.click(screen.getByTestId('delete-collab-101'))
    await waitFor(() => {
      expect(mockedCanvasFetch).toHaveBeenCalledWith(
        '/api/v1/courses/1/collaborations/101',
        { method: 'DELETE' }
      )
    })
    await waitFor(() => {
      expect(refetch).toHaveBeenCalled()
    })
  })

  it('opens create modal when + New Collaboration is clicked', () => {
    mockedUseCanvasQuery.mockReturnValue({ data: [], isLoading: false, refetch: vi.fn() } as any)
    renderPage()

    fireEvent.click(screen.getByTestId('create-collaboration-btn'))
    expect(screen.getByTitle('Canvas Collaborations')).toBeInTheDocument()
  })

  it('closes create modal and refetches on close', () => {
    const refetch = vi.fn()
    mockedUseCanvasQuery.mockReturnValue({ data: [], isLoading: false, refetch } as any)
    renderPage()

    fireEvent.click(screen.getByTestId('create-collaboration-btn'))
    expect(screen.getByText('Close')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Close'))
    expect(screen.queryByTitle('Canvas Collaborations')).not.toBeInTheDocument()
    expect(refetch).toHaveBeenCalled()
  })
})
