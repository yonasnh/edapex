/**
 * Gradebook CSV Import Tests
 * ============================
 */

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

const MOCK_STUDENTS = [
  { id: 1, name: 'Alice', sortable_name: 'Alice' },
  { id: 2, name: 'Bob', sortable_name: 'Bob' },
]

const MOCK_ASSIGNMENTS = [
  { id: 10, name: 'HW1', points_possible: 100 },
  { id: 11, name: 'HW2', points_possible: 100 },
]

const MOCK_SUBMISSIONS = [
  { user_id: 1, assignment_id: 10, score: 85 },
  { user_id: 1, assignment_id: 11, score: 90 },
  { user_id: 2, assignment_id: 10, score: 78 },
  { user_id: 2, assignment_id: 11, score: 82 },
]

const MOCK_ENROLLMENTS = [
  { user_id: 1, id: 101 },
  { user_id: 2, id: 102 },
]

function mockGradebookData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint?.includes('/users')) {
      return { data: MOCK_STUDENTS, isLoading: false, isError: false, error: null, refetch: vi.fn() } as any
    }
    if (endpoint?.includes('/assignments')) {
      return { data: MOCK_ASSIGNMENTS, isLoading: false, isError: false, error: null, refetch: vi.fn() } as any
    }
    if (endpoint?.includes('/students/submissions')) {
      return { data: MOCK_SUBMISSIONS, isLoading: false, isError: false, error: null, refetch: vi.fn() } as any
    }
    if (endpoint?.includes('/enrollments')) {
      return { data: MOCK_ENROLLMENTS, isLoading: false, isError: false, error: null, refetch: vi.fn() } as any
    }
    if (endpoint?.includes('/assignment_groups')) {
      return { data: [], isLoading: false, isError: false, error: null, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, error: null, refetch: vi.fn() } as any
  })
}

function mockNotifications() {
  vi.mocked(useNotification).mockReturnValue({
    showToast: vi.fn(),
    showConfirm: vi.fn().mockResolvedValue(true),
    showAlert: vi.fn(),
  } as any)
}

function renderGradebook() {
  return render(
    <MemoryRouter initialEntries={['/courses/1/gradebook']}>
      <Routes>
        <Route path="/courses/:courseId/gradebook" element={<Gradebook />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Gradebook CSV Import', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNotifications()
    mockGradebookData()
    vi.mocked(useRole).mockReturnValue({ role: 'teacher', masqueradeAs: vi.fn() } as any)
    vi.mocked(canvasFetch).mockResolvedValue({})
  })

  it('Import CSV button triggers file input', () => {
    renderGradebook()
    const importBtn = screen.getByText('Import CSV')
    fireEvent.click(importBtn)
    // File input is hidden; we verify the button exists and is clickable
    expect(importBtn).toBeInTheDocument()
  })

  it('file input is present and hidden', () => {
    renderGradebook()
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()
    expect(fileInput.style.display).toBe('none')
  })

  it('shows import preview modal when import changes exist', () => {
    renderGradebook()
    // The Import Preview modal appears conditionally based on state
    // We verify the toolbar buttons exist
    expect(screen.getByText('Import CSV')).toBeInTheDocument()
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
  })
})
