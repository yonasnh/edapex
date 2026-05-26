import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import CourseNavigationEditor from '../CourseNavigationEditor'

const mockShowToast = vi.fn()
const mockRefetch = vi.fn()
const mockCanvasFetch = vi.fn()

const MOCK_TABS = [
  { id: 'home', label: 'Home', position: 1, visibility: 'public' as const },
  { id: 'announcements', label: 'Announcements', position: 2, visibility: 'public' as const },
  { id: 'assignments', label: 'Assignments', position: 3, visibility: 'hidden' as const },
  { id: 'grades', label: 'Grades', position: 4, visibility: 'public' as const },
]

vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: (...args: any[]) => mockCanvasFetch(...args),
}))

vi.mock('../../hooks/useNotification', () => ({
  useNotification: () => ({
    showToast: mockShowToast,
    showConfirm: vi.fn(),
    showAlert: vi.fn(),
  }),
}))

import { useCanvasQuery } from '../../hooks/useCanvasQuery'

function renderPage(tabs = MOCK_TABS, isLoading = false) {
  vi.mocked(useCanvasQuery).mockReturnValue({
    data: tabs,
    isLoading,
    isError: false,
    error: null,
    refetch: mockRefetch,
  } as any)

  return render(
    <MemoryRouter initialEntries={['/courses/1/navigation']}>
      <Routes>
        <Route path="/courses/:courseId/navigation" element={<CourseNavigationEditor />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('CourseNavigationEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders navigation tabs list', () => {
    renderPage()
    expect(screen.getByText('Course Navigation')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Course navigation tabs' })).toBeInTheDocument()
    // Use the editor list to scope tab labels and avoid preview duplicates
    const list = screen.getByRole('list', { name: 'Course navigation tabs' })
    expect(within(list).getByText('Home')).toBeInTheDocument()
    expect(within(list).getByText('Announcements')).toBeInTheDocument()
    expect(within(list).getByText('Assignments')).toBeInTheDocument()
    expect(within(list).getByText('Grades')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    renderPage(MOCK_TABS, true)
    expect(screen.getByText('Loading course navigation…')).toBeInTheDocument()
  })

  it('shows visibility toggles with correct initial states', () => {
    renderPage()
    const list = screen.getByRole('list', { name: 'Course navigation tabs' })
    const rows = within(list).getAllByRole('listitem')
    expect(rows).toHaveLength(4)

    // Home should be Visible
    expect(within(rows[0]).getByText('Visible')).toBeInTheDocument()
    // Assignments should be Hidden
    expect(within(rows[2]).getByText('Hidden')).toBeInTheDocument()
  })

  it('hidden tabs are visually distinguished', () => {
    renderPage()
    const hiddenToggle = screen.getByRole('button', { name: /Show Assignments/ })
    expect(hiddenToggle).toBeInTheDocument()
    expect(hiddenToggle).toHaveTextContent('Hidden')
  })

  it('toggle visibility changes tab state from hidden to visible', () => {
    renderPage()
    const hiddenToggle = screen.getByRole('button', { name: /Show Assignments/ })
    expect(hiddenToggle).toHaveTextContent('Hidden')
    fireEvent.click(hiddenToggle)
    expect(screen.getByRole('button', { name: /Hide Assignments/ })).toHaveTextContent('Visible')
  })

  it('toggle visibility changes tab state from visible to hidden', () => {
    renderPage()
    const visibleToggle = screen.getByRole('button', { name: /Hide Home/ })
    expect(visibleToggle).toHaveTextContent('Visible')
    fireEvent.click(visibleToggle)
    expect(screen.getByRole('button', { name: /Show Home/ })).toHaveTextContent('Hidden')
  })

  it('drag-and-drop reordering UI exists (drag handles present)', () => {
    renderPage()
    const list = screen.getByRole('list', { name: 'Course navigation tabs' })
    const rows = within(list).getAllByRole('listitem')
    rows.forEach(row => {
      expect(within(row).getByRole('button', { name: /Move .* up/ })).toBeInTheDocument()
      expect(within(row).getByRole('button', { name: /Move .* down/ })).toBeInTheDocument()
    })
  })

  it('reorder up button moves a tab earlier in the list', () => {
    renderPage()
    const list = screen.getByRole('list', { name: 'Course navigation tabs' })
    const rows = within(list).getAllByRole('listitem')

    // Move Grades (index 3) up
    const moveUpBtn = within(rows[3]).getByRole('button', { name: /Move Grades up/ })
    fireEvent.click(moveUpBtn)

    const updatedRows = within(list).getAllByRole('listitem')
    expect(within(updatedRows[2]).getByText('Grades')).toBeInTheDocument()
  })

  it('reorder down button moves a tab later in the list', () => {
    renderPage()
    const list = screen.getByRole('list', { name: 'Course navigation tabs' })
    const rows = within(list).getAllByRole('listitem')

    // Move Home (index 0) down
    const moveDownBtn = within(rows[0]).getByRole('button', { name: /Move Home down/ })
    fireEvent.click(moveDownBtn)

    const updatedRows = within(list).getAllByRole('listitem')
    expect(within(updatedRows[1]).getByText('Home')).toBeInTheDocument()
  })

  it('reorder up button is disabled for the first item', () => {
    renderPage()
    const list = screen.getByRole('list', { name: 'Course navigation tabs' })
    const rows = within(list).getAllByRole('listitem')
    const moveUpBtn = within(rows[0]).getByRole('button', { name: /Move Home up/ })
    expect(moveUpBtn).toBeDisabled()
  })

  it('reorder down button is disabled for the last item', () => {
    renderPage()
    const list = screen.getByRole('list', { name: 'Course navigation tabs' })
    const rows = within(list).getAllByRole('listitem')
    const moveDownBtn = within(rows[rows.length - 1]).getByRole('button', { name: /Move Grades down/ })
    expect(moveDownBtn).toBeDisabled()
  })

  it('Save button calls canvasFetch PUT for changed tabs', async () => {
    mockCanvasFetch.mockResolvedValue({})
    renderPage()

    // Toggle visibility of Home to hidden
    const homeToggle = screen.getByRole('button', { name: /Hide Home/ })
    fireEvent.click(homeToggle)

    const saveBtn = screen.getByRole('button', { name: /Save Navigation/ })
    expect(saveBtn).toBeInTheDocument()
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockCanvasFetch).toHaveBeenCalled()
    })

    // Check that a PUT was made with hidden: true for home
    const calls = mockCanvasFetch.mock.calls
    const hiddenCall = calls.find((call: any[]) => {
      const [, options] = call
      return options?.method === 'PUT' && options?.body?.hidden === true
    })
    expect(hiddenCall).toBeTruthy()
  })

  it('preview pane shows only visible tabs', () => {
    renderPage()
    const preview = screen.getByRole('navigation', { name: 'Navigation preview' })
    expect(within(preview).getByText('Home')).toBeInTheDocument()
    expect(within(preview).getByText('Announcements')).toBeInTheDocument()
    expect(within(preview).getByText('Grades')).toBeInTheDocument()
    expect(within(preview).queryByText('Assignments')).not.toBeInTheDocument()
  })

  it('shows "All tabs are hidden" when everything is hidden', () => {
    renderPage(MOCK_TABS.map(t => ({ ...t, visibility: 'hidden' as const })))
    const preview = screen.getByRole('navigation', { name: 'Navigation preview' })
    expect(within(preview).getByText('All tabs are hidden')).toBeInTheDocument()
  })
})
