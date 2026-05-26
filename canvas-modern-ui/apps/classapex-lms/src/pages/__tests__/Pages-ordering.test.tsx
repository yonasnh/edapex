import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Pages from '../Pages'
import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery'

const MOCK_PAGES = [
  { page_id: 1, title: 'Welcome', url: 'welcome', front_page: true, published: true, updated_at: '2026-05-20T10:00:00Z' },
  { page_id: 2, title: 'Syllabus', url: 'syllabus', front_page: false, published: true, updated_at: '2026-05-21T10:00:00Z' },
  { page_id: 3, title: 'Resources', url: 'resources', front_page: false, published: false, updated_at: '2026-05-22T10:00:00Z' },
]

vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
}))

vi.mock('../../hooks/useNotification', () => ({
  useNotification: vi.fn(() => ({
    showToast: vi.fn(),
    showConfirm: vi.fn(),
  })),
}))

vi.mock('../../contexts/RoleContext', () => ({
  useRole: () => ({ role: 'teacher' }),
}))

describe('Pages ordering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.mocked(useCanvasQuery).mockReturnValue({
      data: MOCK_PAGES,
      isLoading: false,
      refetch: vi.fn(),
    })
  })

  it('renders page list', () => {
    render(
      <MemoryRouter initialEntries={['/courses/1/pages']}>
        <Routes>
          <Route path="/courses/:courseId/pages" element={<Pages />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Welcome')).toBeInTheDocument()
    expect(screen.getByText('Syllabus')).toBeInTheDocument()
    expect(screen.getByText('Resources')).toBeInTheDocument()
  })

  it('shows DnD handles for reordering when teacher', () => {
    render(
      <MemoryRouter initialEntries={['/courses/1/pages']}>
        <Routes>
          <Route path="/courses/:courseId/pages" element={<Pages />} />
        </Routes>
      </MemoryRouter>
    )

    const dragHandles = screen.getAllByTitle('Drag to reorder')
    expect(dragHandles.length).toBe(MOCK_PAGES.length)
  })

  it('displays Front Page badge on the front page', () => {
    render(
      <MemoryRouter initialEntries={['/courses/1/pages']}>
        <Routes>
          <Route path="/courses/:courseId/pages" element={<Pages />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Front Page')).toBeInTheDocument()
  })

  it('calls canvasFetch when setting front page', async () => {
    render(
      <MemoryRouter initialEntries={['/courses/1/pages']}>
        <Routes>
          <Route path="/courses/:courseId/pages" element={<Pages />} />
        </Routes>
      </MemoryRouter>
    )

    const setFrontButtons = screen.getAllByRole('button', { name: 'Set Front' })
    expect(setFrontButtons.length).toBeGreaterThan(0)

    fireEvent.click(setFrontButtons[0])

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        '/api/v1/courses/1/pages/syllabus',
        expect.objectContaining({
          method: 'PUT',
          body: { wiki_page: { front_page: true } },
        })
      )
    })
  })
})
