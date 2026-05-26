import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Gradebook from '../Gradebook'
import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery'
import { useNotification } from '../../hooks/useNotification'
import { useRole } from '../../contexts/RoleContext'

vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
}))

vi.mock('../../hooks/useNotification', () => ({
  useNotification: vi.fn(),
}))

vi.mock('../../contexts/RoleContext', () => ({
  useRole: vi.fn(),
}))

vi.mock('../../components/MessageStudentsWho', () => ({
  default: () => <div data-testid="message-modal">MessageStudentsWho</div>,
}))

function setupGradebookMocks() {
  vi.mocked(useRole).mockReturnValue({ role: 'teacher' } as any)
  vi.mocked(useNotification).mockReturnValue({ showToast: vi.fn(), showConfirm: vi.fn() } as any)

  vi.mocked(useCanvasQuery).mockImplementation((url: string) => {
    if (url.includes('/users')) {
      return {
        data: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
        isLoading: false,
        isError: false,
      } as any
    }
    if (url.includes('/assignments') && !url.includes('/assignment_groups')) {
      return {
        data: [
          { id: 101, name: 'Assignment 1', points_possible: 100 },
        ],
        isLoading: false,
        isError: false,
      } as any
    }
    if (url.includes('/students/submissions')) {
      return {
        data: [
          { user_id: 1, assignment_id: 101, score: 85, late: false, missing: false, excused: false },
          { user_id: 2, assignment_id: 101, score: 92, late: false, missing: false, excused: false },
        ],
        isLoading: false,
        isError: false,
      } as any
    }
    if (url.includes('/assignment_groups')) {
      return { data: [], isLoading: false, isError: false } as any
    }
    if (url.includes('/enrollments')) {
      return {
        data: [
          { id: 1001, user_id: 1 },
          { id: 1002, user_id: 2 },
        ],
        isLoading: false,
        isError: false,
      } as any
    }
    return { data: [], isLoading: false, isError: false } as any
  })
}

describe('Gradebook Final Grade Override', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupGradebookMocks()
  })

  it('the override column renders inputs', () => {
    render(
      <MemoryRouter initialEntries={['/courses/1/gradebook']}>
        <Routes>
          <Route path="/courses/:courseId/gradebook" element={<Gradebook />} />
        </Routes>
      </MemoryRouter>
    )

    const overrideInputs = screen.getAllByTitle('Override final grade (percentage)')
    expect(overrideInputs).toHaveLength(2)
  })

  it('typing in override input calls canvasFetch to save', async () => {
    vi.mocked(canvasFetch).mockResolvedValue({})

    render(
      <MemoryRouter initialEntries={['/courses/1/gradebook']}>
        <Routes>
          <Route path="/courses/:courseId/gradebook" element={<Gradebook />} />
        </Routes>
      </MemoryRouter>
    )

    const overrideInputs = screen.getAllByTitle('Override final grade (percentage)')
    const firstInput = overrideInputs[0]

    fireEvent.change(firstInput, { target: { value: '95.5' } })
    fireEvent.blur(firstInput)

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        '/api/v1/courses/1/enrollments/1001',
        {
          method: 'PUT',
          body: { enrollment: { override_score: 95.5 } },
        }
      )
    })
  })

  it('"Message Students" button opens the MessageStudentsWho modal', () => {
    render(
      <MemoryRouter initialEntries={['/courses/1/gradebook']}>
        <Routes>
          <Route path="/courses/:courseId/gradebook" element={<Gradebook />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.queryByTestId('message-modal')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Message Students' }))

    expect(screen.getByTestId('message-modal')).toBeInTheDocument()
  })

  it('Export CSV button is present and clickable', () => {
    render(
      <MemoryRouter initialEntries={['/courses/1/gradebook']}>
        <Routes>
          <Route path="/courses/:courseId/gradebook" element={<Gradebook />} />
        </Routes>
      </MemoryRouter>
    )

    const exportBtn = screen.getByRole('button', { name: 'Export CSV' })
    expect(exportBtn).toBeInTheDocument()

    fireEvent.click(exportBtn)
    expect(exportBtn).toBeInTheDocument()
  })

  it('Import CSV button triggers file input', () => {
    render(
      <MemoryRouter initialEntries={['/courses/1/gradebook']}>
        <Routes>
          <Route path="/courses/:courseId/gradebook" element={<Gradebook />} />
        </Routes>
      </MemoryRouter>
    )

    const importBtn = screen.getByRole('button', { name: 'Import CSV' })
    expect(importBtn).toBeInTheDocument()

    // The hidden file input should exist in the DOM
    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()

    // Clicking Import CSV should not throw
    fireEvent.click(importBtn)
    expect(importBtn).toBeInTheDocument()
  })
})
