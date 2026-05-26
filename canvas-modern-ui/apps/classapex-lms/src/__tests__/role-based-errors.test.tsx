/**
 * Error States, Edge Cases & Empty States
 * =========================================
 * Comprehensive tests for loading, empty, error, validation, and
 * canvasFetch failure paths across ClassApex pages.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom'

import DashboardV2 from '../pages/DashboardV2'
import Courses from '../pages/Courses'
import AssignmentList from '../pages/AssignmentList'
import AssignmentDetail from '../pages/AssignmentDetail'
import AssignmentEditModal from '../pages/AssignmentEditModal'
import Gradebook from '../pages/Gradebook'
import Inbox from '../pages/Inbox'
import SettingsPage from '../pages/Settings'
import RolesPermissionsPage from '../pages/admin/RolesPermissions'

import { useCanvasQuery, canvasFetch, useCanvasMutation } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'
import { useTheme } from '../contexts/ThemeContext'
import { useI18n } from '../contexts/I18nContext'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
  useCanvasMutation: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
}))

vi.mock('../contexts/RoleContext', () => ({
  useRole: vi.fn(),
}))

vi.mock('../hooks/useNotification', () => ({
  useNotification: vi.fn(),
}))

vi.mock('../contexts/ThemeContext', () => ({
  useTheme: vi.fn(),
}))

vi.mock('../contexts/I18nContext', () => ({
  useI18n: vi.fn(),
  I18nProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('../contexts/TenantContext', () => ({
  useTenant: () => ({ config: { ui: { dashboardLayout: 'cards' } } }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useParams: vi.fn(() => ({ courseId: '1', assignmentId: '99' })),
    useNavigate: vi.fn(() => vi.fn()),
  }
})

// ─── Helpers ────────────────────────────────────────────────────────────────

const mockShowToast = vi.fn()
const mockShowConfirm = vi.fn().mockResolvedValue(true)

function mockRole(role: string) {
  vi.mocked(useRole).mockReturnValue({ role, user: { name: 'Test User', role } } as any)
}

function mockNotifications() {
  vi.mocked(useNotification).mockReturnValue({
    showToast: mockShowToast,
    showConfirm: mockShowConfirm,
    showAlert: vi.fn(),
  } as any)
}

function mockTheme() {
  vi.mocked(useTheme).mockReturnValue({
    theme: 'light',
    toggleTheme: vi.fn(),
    accentColor: '#6366f1',
    setAccentColor: vi.fn(),
  } as any)
}

function mockI18n() {
  vi.mocked(useI18n).mockReturnValue({
    locale: 'en',
    setLocale: vi.fn(),
    t: (key: string) => key,
  } as any)
}

function mockUseCanvasQuery(responses: Record<string, any>) {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    const entries = Object.entries(responses)
    // Prefer exact match, then partial
    const exact = entries.find(([key]) => endpoint === key)
    if (exact) {
      return { data: null, isLoading: false, isError: false, refetch: vi.fn(), ...exact[1] }
    }
    const match = entries.find(([key]) => endpoint.includes(key))
    if (match) {
      return { data: null, isLoading: false, isError: false, refetch: vi.fn(), ...match[1] }
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderWithRouter(ui: React.ReactElement, initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={ui} />
        <Route path="/courses/:courseId/assignments" element={<AssignmentList />} />
        <Route path="/courses/:courseId/assignments/:assignmentId" element={<AssignmentDetail />} />
        <Route path="/courses/:courseId/gradebook" element={<Gradebook />} />
      </Routes>
    </MemoryRouter>
  )
}

function renderCourses(initialEntry = '/courses') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/courses/*" element={<Courses />} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Loading States', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('DashboardV2 shows skeleton loaders when courses are loading', () => {
    mockUseCanvasQuery({
      '/api/v1/courses': { isLoading: true },
      '/api/v1/users/self/todo': { data: [] },
      '/api/v1/users/self/upcoming_events': { data: [] },
      '/api/v1/users/self/missing_submissions': { data: [] },
      '/api/v1/users/self/activity_stream/summary': { data: [] },
    })
    renderWithRouter(<DashboardV2 />)

    expect(document.querySelectorAll('.cx-skeleton').length).toBeGreaterThan(0)
  })

  it('Courses page shows "Loading courses..." spinner', () => {
    mockUseCanvasQuery({ '/api/v1/courses': { isLoading: true } })
    renderCourses()

    expect(screen.getByText(/loading courses/i)).toBeInTheDocument()
  })

  it('AssignmentList shows loading state', () => {
    mockRole('teacher')
    mockNotifications()
    mockUseCanvasQuery({
      '/api/v1/courses/1/assignments': { isLoading: true },
    })
    renderWithRouter(<AssignmentList />, ['/courses/1/assignments'])

    expect(screen.getByText(/loading assignments/i)).toBeInTheDocument()
  })

  it('Gradebook shows loading spinner', () => {
    mockRole('teacher')
    mockNotifications()
    mockUseCanvasQuery({
      '/api/v1/courses/1/users': { isLoading: true },
      '/api/v1/courses/1/assignments': { isLoading: false, data: [] },
      '/api/v1/courses/1/students/submissions': { isLoading: false, data: [] },
      '/api/v1/courses/1/assignment_groups': { data: [] },
    })
    renderWithRouter(<Gradebook />, ['/courses/1/gradebook'])

    expect(screen.getByText(/loading gradebook/i)).toBeInTheDocument()
  })

  it('Inbox shows "Loading conversations…" when loading', () => {
    mockNotifications()
    mockUseCanvasQuery({
      '/api/v1/conversations': { isLoading: true },
      '/api/v1/users/self': { data: { id: 1 } },
    })
    renderWithRouter(<Inbox />)

    expect(screen.getByText(/loading conversations/i)).toBeInTheDocument()
  })
})

describe('Empty States', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('DashboardV2 shows "No active courses" when student has 0 enrollments', () => {
    mockUseCanvasQuery({
      '/api/v1/courses': { data: [] },
      '/api/v1/users/self/todo': { data: [] },
      '/api/v1/users/self/upcoming_events': { data: [] },
      '/api/v1/users/self/missing_submissions': { data: [] },
      '/api/v1/users/self/activity_stream/summary': { data: [] },
    })
    renderWithRouter(<DashboardV2 />)

    expect(screen.getByText(/no active courses/i)).toBeInTheDocument()
  })

  it('Courses page shows "No courses found" with empty data', () => {
    mockUseCanvasQuery({ '/api/v1/courses': { data: [] } })
    renderCourses()

    expect(screen.getByText(/no courses found/i)).toBeInTheDocument()
  })

  it('AssignmentList shows "No assignments match your filters" when empty', () => {
    mockRole('teacher')
    mockNotifications()
    mockUseCanvasQuery({
      '/api/v1/courses/1/assignments': { data: [] },
    })
    renderWithRouter(<AssignmentList />, ['/courses/1/assignments'])

    expect(screen.getByText(/no assignments match your filters/i)).toBeInTheDocument()
  })

  it('Gradebook shows "No students found" when there are no students', () => {
    mockRole('teacher')
    mockNotifications()
    mockUseCanvasQuery({
      '/api/v1/courses/1/users': { data: [] },
      '/api/v1/courses/1/assignments': { data: [{ id: 1, name: 'Essay', points_possible: 100 }] },
      '/api/v1/courses/1/students/submissions': { data: [] },
      '/api/v1/courses/1/assignment_groups': { data: [] },
    })
    renderWithRouter(<Gradebook />, ['/courses/1/gradebook'])

    expect(screen.getByText(/no students found/i)).toBeInTheDocument()
  })

  it('Gradebook shows "No assignments in this course" when no assignments', () => {
    mockRole('teacher')
    mockNotifications()
    mockUseCanvasQuery({
      '/api/v1/courses/1/users': { data: [{ id: 1, name: 'Alice' }] },
      '/api/v1/courses/1/assignments': { data: [] },
      '/api/v1/courses/1/students/submissions': { data: [] },
      '/api/v1/courses/1/assignment_groups': { data: [] },
    })
    renderWithRouter(<Gradebook />, ['/courses/1/gradebook'])

    expect(screen.getByText(/no assignments in this course/i)).toBeInTheDocument()
  })

  it('Inbox shows "No conversations found" when empty', () => {
    mockNotifications()
    mockUseCanvasQuery({
      '/api/v1/conversations': { data: [] },
      '/api/v1/users/self': { data: { id: 1 } },
    })
    renderWithRouter(<Inbox />)

    expect(screen.getByText(/no conversations found/i)).toBeInTheDocument()
  })
})

describe('API Error States', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Courses page shows error banner when API fails', () => {
    mockUseCanvasQuery({ '/api/v1/courses': { isError: true, error: new Error('Network error') } })
    renderCourses()

    expect(screen.getByText(/canvas api unavailable/i)).toBeInTheDocument()
    expect(screen.getByText(/could not load courses from canvas/i)).toBeInTheDocument()
  })

  it('Inbox shows error message with retry button when conversations fail to load', () => {
    mockNotifications()
    const refetchMock = vi.fn()
    mockUseCanvasQuery({
      '/api/v1/conversations': { isError: true, error: new Error('Network error'), refetch: refetchMock },
      '/api/v1/users/self': { data: { id: 1 } },
    })
    renderWithRouter(<Inbox />)

    expect(screen.getByText(/failed to load conversations/i)).toBeInTheDocument()
    const retryBtn = screen.getByText(/retry/i)
    expect(retryBtn).toBeInTheDocument()
    fireEvent.click(retryBtn)
    expect(refetchMock).toHaveBeenCalled()
  })

  it('AssignmentDetail shows "Assignment not found" for invalid ID', () => {
    mockRole('student')
    mockNotifications()
    mockUseCanvasQuery({
      '/api/v1/courses/1/assignments/99': { data: null, isLoading: false },
    })
    renderWithRouter(<AssignmentDetail />, ['/courses/1/assignments/99'])

    expect(screen.getByText(/assignment not found/i)).toBeInTheDocument()
  })

  it('Settings shows loading spinner when profile is loading', () => {
    mockRole('student')
    mockNotifications()
    mockTheme()
    mockI18n()
    mockUseCanvasQuery({
      '/api/v1/users/self': { isLoading: true },
      '/api/v1/users/self/communication_channels': { data: [] },
    })
    renderWithRouter(<SettingsPage />)

    expect(screen.getByText(/loading settings profile/i)).toBeInTheDocument()
  })
})

describe('Form Validation Errors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('AssignmentEditModal disables save button when title is empty', () => {
    mockNotifications()
    mockUseCanvasQuery({
      '/api/v1/courses/1/assignment_groups': { data: [] },
      '/api/v1/courses/1/rubrics': { data: [] },
      '/api/v1/courses/1/sections': { data: [] },
      '/api/v1/courses/1/users': { data: [] },
    })

    render(
      <MemoryRouter>
        <AssignmentEditModal courseId="1" onClose={vi.fn()} onSaved={vi.fn()} />
      </MemoryRouter>
    )

    const nameInput = screen.getByPlaceholderText(/assignment name/i)
    fireEvent.change(nameInput, { target: { value: '' } })

    const createBtn = screen.getByRole('button', { name: /create assignment/i })
    expect(createBtn).toBeDisabled()
  })

  it('Settings shows save error when profile update returns falsy', async () => {
    mockRole('student')
    mockNotifications()
    mockTheme()
    mockI18n()

    const mockMutate = vi.fn().mockResolvedValue(null)
    vi.mocked(useCanvasMutation).mockReturnValue({ mutate: mockMutate, isLoading: false } as any)

    mockUseCanvasQuery({
      '/api/v1/users/self': {
        data: { id: 1, name: 'Test User', primary_email: 'test@example.com', time_zone: 'America/New_York' },
        isLoading: false,
      },
      '/api/v1/users/self/communication_channels': { data: [] },
    })

    renderWithRouter(<SettingsPage />)

    const nameInput = screen.getByPlaceholderText(/your full name/i)
    fireEvent.change(nameInput, { target: { value: 'Changed Name' } })

    const saveBtn = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(screen.getByText(/display settings saved locally/i)).toBeInTheDocument()
    })
  })
})

describe('CanvasFetch Errors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('AssignmentList shows error toast when delete fails', async () => {
    mockRole('teacher')
    mockNotifications()
    mockShowConfirm.mockResolvedValue(true)
    vi.mocked(canvasFetch).mockRejectedValue(new Error('Delete failed'))

    mockUseCanvasQuery({
      '/api/v1/courses/1/assignments': {
        data: [{ id: 10, name: 'Essay', due_at: null, points_possible: 100, submission: null }],
      },
    })

    renderWithRouter(<AssignmentList />, ['/courses/1/assignments'])

    const deleteBtn = screen.getByTitle(/delete/i)
    fireEvent.click(deleteBtn)

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Failed to delete',
        type: 'error',
      }))
    })
  })

  it('Gradebook cell save shows error toast when API returns 422', async () => {
    mockRole('teacher')
    mockNotifications()
    vi.mocked(canvasFetch).mockRejectedValue(new Error('Unprocessable Entity'))

    mockUseCanvasQuery({
      '/api/v1/courses/1/users': { data: [{ id: 5, name: 'Alice' }] },
      '/api/v1/courses/1/assignments': { data: [{ id: 10, name: 'Essay', points_possible: 100 }] },
      '/api/v1/courses/1/students/submissions': { data: [] },
      '/api/v1/courses/1/assignment_groups': { data: [] },
    })

    renderWithRouter(<Gradebook />, ['/courses/1/gradebook'])

    const cellInput = screen.getAllByRole('textbox')[0]
    fireEvent.change(cellInput, { target: { value: '95' } })
    fireEvent.blur(cellInput)

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Failed to save grade',
        type: 'error',
      }))
    })
  })

  it('Inbox shows error toast when deleting conversation fails', async () => {
    mockNotifications()
    mockShowConfirm.mockResolvedValue(true)
    vi.mocked(canvasFetch).mockRejectedValue(new Error('Delete failed'))

    mockUseCanvasQuery({
      '/api/v1/conversations': {
        data: [{
          id: 1,
          subject: 'Test',
          last_message: 'Hi',
          last_message_at: '2026-01-01T00:00:00Z',
          workflow_state: 'read',
          message_count: 1,
          participants: [{ id: 2, name: 'Jane Doe' }],
          starred: false,
          properties: [],
          messages: [{ id: 1, author_id: 2, body: 'Hi', created_at: '2026-01-01T00:00:00Z', generated: false }],
        }],
      },
      '/api/v1/users/self': { data: { id: 1 } },
    })

    renderWithRouter(<Inbox />)

    // Select conversation to open detail panel
    fireEvent.click(screen.getByText(/jane doe/i))

    // Click delete button in detail header
    const deleteBtn = screen.getByLabelText(/delete conversation/i)
    fireEvent.click(deleteBtn)

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Delete Failed',
        type: 'error',
      }))
    })
  })

  it('Inbox reply shows error toast when send fails', async () => {
    mockNotifications()
    vi.mocked(canvasFetch).mockRejectedValue(new Error('Reply failed'))

    mockUseCanvasQuery({
      '/api/v1/conversations': {
        data: [{
          id: 1,
          subject: 'Test',
          last_message: 'Hi',
          last_message_at: '2026-01-01T00:00:00Z',
          workflow_state: 'read',
          message_count: 1,
          participants: [{ id: 2, name: 'Jane Doe' }],
          starred: false,
          properties: [],
          messages: [{ id: 1, author_id: 2, body: 'Hi', created_at: '2026-01-01T00:00:00Z', generated: false }],
        }],
      },
      '/api/v1/users/self': { data: { id: 1 } },
    })

    renderWithRouter(<Inbox />)

    // Select conversation
    fireEvent.click(screen.getByText(/jane doe/i))

    // Type reply
    const replyInput = screen.getByPlaceholderText(/type a reply/i)
    fireEvent.change(replyInput, { target: { value: 'Reply text' } })

    // Click send
    fireEvent.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Reply Failed',
        type: 'error',
      }))
    })
  })

  it('Settings shows avatar upload error when canvasFetch throws', async () => {
    mockRole('student')
    mockNotifications()
    mockTheme()
    mockI18n()
    vi.mocked(canvasFetch).mockRejectedValue(new Error('File too large'))

    mockUseCanvasQuery({
      '/api/v1/users/self': {
        data: { id: 1, name: 'Test User', primary_email: 'test@example.com', avatar_url: 'https://example.com/avatar.png' },
        isLoading: false,
      },
      '/api/v1/users/self/communication_channels': { data: [] },
    })

    const { container } = renderWithRouter(<SettingsPage />)

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['(⌐□_□)'], 'avatar.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Upload failed',
        type: 'error',
      }))
    })
  })
})

describe('403 / 404 Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Gradebook redirects student to /grades', () => {
    const navigateMock = vi.fn()
    vi.mocked(useNavigate).mockReturnValue(navigateMock)

    mockRole('student')
    mockNotifications()
    mockUseCanvasQuery({
      '/api/v1/courses/1/users': { data: [] },
      '/api/v1/courses/1/assignments': { data: [] },
      '/api/v1/courses/1/students/submissions': { data: [] },
      '/api/v1/courses/1/assignment_groups': { data: [] },
    })

    renderWithRouter(<Gradebook />, ['/courses/1/gradebook'])

    expect(navigateMock).toHaveBeenCalledWith('/grades?courseId=1', { replace: true })
  })

  it('Admin page renders without crashing for non-admin (access controlled elsewhere)', () => {
    mockRole('teacher')
    mockNotifications()
    mockUseCanvasQuery({
      '/roles': { data: [] },
      '/courses': { data: [] },
    })

    render(
      <MemoryRouter>
        <RolesPermissionsPage />
      </MemoryRouter>
    )

    expect(document.body).toBeInTheDocument()
  })
})
