/**
 * Role-Based Calendar & Files Tests
 * ===================================
 * Verifies Calendar grid, events, filtering, and CRUD for all roles,
 * plus Files list, breadcrumbs, and view toggles.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import CalendarPage from '../pages/Calendar'
import FilesPage from '../pages/Files'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@schoolapex/core', () => ({
  useAuth: () => ({ user: { id: '101', name: 'Test User' }, isAuthenticated: true }),
}))

vi.mock('../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
}))

vi.mock('../contexts/RoleContext', () => ({
  useRole: vi.fn(),
}))

vi.mock('../hooks/useNotification', () => ({
  useNotification: vi.fn(),
}))

vi.mock('../components/RichEditor', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }: any) => (
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-testid="rich-editor"
    />
  ),
}))

// ─── Helpers ────────────────────────────────────────────────────────────────

const ROLES = ['student', 'teacher', 'admin', 'observer'] as const
const TEACHER_LIKE_ROLES = ['teacher', 'admin'] as const

const MOCK_COURSES = [
  { id: '10', name: 'Math 101' },
  { id: '20', name: 'History 201' },
]

const MOCK_CALENDAR_EVENTS = [
  {
    id: 'evt-1',
    title: 'Team Meeting',
    description: 'Type: meeting\nWeekly sync',
    start_at: '2026-05-15T14:00:00Z',
    end_at: '2026-05-15T15:00:00Z',
    location_name: 'Room 101',
    all_day: false,
    context_code: 'course_10',
  },
  {
    id: 'evt-2',
    title: 'Guest Lecture',
    description: 'Type: lecture\nGuest speaker',
    start_at: '2026-05-20T10:00:00Z',
    end_at: '2026-05-20T11:00:00Z',
    location_name: 'Hall A',
    all_day: false,
    context_code: 'course_20',
  },
]

const MOCK_CALENDAR_ASSIGNMENTS = [
  {
    id: 'assignment_1',
    title: 'Math Homework',
    description: '<p>Solve problems</p>',
    start_at: '2026-05-18T09:00:00Z',
    end_at: '2026-05-18T23:59:59Z',
    all_day: false,
    context_code: 'course_10',
  },
]

const MOCK_FILES = [
  {
    id: 'file_1',
    display_name: 'syllabus.pdf',
    filename: 'syllabus.pdf',
    mime_class: 'pdf',
    size: 102400,
    updated_at: '2026-05-01T00:00:00Z',
    url: 'https://example.com/syllabus.pdf',
  },
  {
    id: 'file_2',
    display_name: 'notes.docx',
    filename: 'notes.docx',
    mime_class: 'doc',
    size: 51200,
    updated_at: '2026-05-02T00:00:00Z',
    url: 'https://example.com/notes.docx',
  },
]

const MOCK_FOLDERS = [
  {
    id: 101,
    name: 'Week 1',
    parent_folder_id: 1,
    updated_at: '2026-05-01T00:00:00Z',
    created_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 102,
    name: 'Week 2',
    parent_folder_id: 1,
    updated_at: '2026-05-02T00:00:00Z',
    created_at: '2026-05-02T00:00:00Z',
  },
]

const MOCK_ROOT_FOLDER = { id: 1, name: 'root', parent_folder_id: null }

function mockRole(role: string) {
  vi.mocked(useRole).mockReturnValue({ role } as any)
}

function mockNotifications() {
  vi.mocked(useNotification).mockReturnValue({
    showToast: vi.fn(),
    showConfirm: vi.fn().mockResolvedValue(true),
    showAlert: vi.fn(),
  } as any)
}

function mockCalendarData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string, params?: any) => {
    if (endpoint === '/api/v1/courses') {
      return { data: MOCK_COURSES, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint === '/api/v1/calendar_events') {
      if (params?.type === 'event') {
        return { data: MOCK_CALENDAR_EVENTS, isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (params?.type === 'assignment') {
        return { data: MOCK_CALENDAR_ASSIGNMENTS, isLoading: false, isError: false, refetch: vi.fn() } as any
      }
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function mockFilesData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/users/self/files') {
      return { data: MOCK_FILES, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint === '/api/v1/users/self/folders') {
      return { data: MOCK_FOLDERS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint === '/api/v1/users/self/folders/root') {
      return { data: MOCK_ROOT_FOLDER, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint === '/api/v1/courses') {
      return { data: MOCK_COURSES, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderCalendar(role: string) {
  mockRole(role)
  mockNotifications()
  mockCalendarData()
  return render(
    <MemoryRouter>
      <CalendarPage />
    </MemoryRouter>
  )
}

function renderFiles() {
  mockNotifications()
  mockFilesData()
  return render(
    <MemoryRouter>
      <FilesPage />
    </MemoryRouter>
  )
}

// ─── Calendar Tests ─────────────────────────────────────────────────────────

describe('Calendar — Role-Based Access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders calendar grid', () => {
        renderCalendar(role)
        expect(screen.getByText('Sun')).toBeInTheDocument()
        expect(screen.getByText('Mon')).toBeInTheDocument()
      })

      it('shows events and assignments in the grid', () => {
        renderCalendar(role)
        expect(screen.getByText('Team Meeting')).toBeInTheDocument()
        expect(screen.getByText('Math Homework')).toBeInTheDocument()
      })

      it('course filter works', () => {
        renderCalendar(role)
        const courseSelect = screen.getByDisplayValue('All Courses')
        fireEvent.change(courseSelect, { target: { value: '10' } })

        expect(screen.getByText('Team Meeting')).toBeInTheDocument()
        expect(screen.queryByText('Guest Lecture')).not.toBeInTheDocument()
      })

      it('clicking an event shows detail modal', () => {
        renderCalendar(role)
        fireEvent.click(screen.getByText('Team Meeting'))

        expect(screen.getByRole('heading', { name: 'Team Meeting' })).toBeInTheDocument()
        expect(screen.getByText('Room 101')).toBeInTheDocument()
      })
    })
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role} — teacher capabilities`, () => {
      it('"Create Event" button is visible', () => {
        renderCalendar(role)
        expect(screen.getByRole('button', { name: /Create Event/i })).toBeInTheDocument()
      })

      it('create event modal opens', () => {
        renderCalendar(role)
        fireEvent.click(screen.getByRole('button', { name: /Create Event/i }))
        expect(screen.getByRole('heading', { name: /Create Event/i })).toBeInTheDocument()
      })

      it('can submit new event via fetch', async () => {
        vi.mocked(global.fetch as any).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ id: '999', title: 'New Event' }),
        } as any)
        renderCalendar(role)

        fireEvent.click(screen.getByRole('button', { name: /Create Event/i }))

        const titleInput = screen.getByPlaceholderText(/Event title/i)
        fireEvent.change(titleInput, { target: { value: 'New Event' } })

        const startInput = document.querySelectorAll('input[type="datetime-local"]')[0] as HTMLInputElement
        fireEvent.change(startInput, { target: { value: '2026-05-25T10:00' } })

        fireEvent.click(screen.getByRole('button', { name: /^Create$/i }))

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            '/api/v1/calendar_events',
            expect.objectContaining({ method: 'POST' })
          )
        })
      })

      it('edit event works', async () => {
        vi.mocked(global.fetch as any).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ id: 'evt-1', title: 'Updated Meeting' }),
        } as any)
        renderCalendar(role)

        fireEvent.click(screen.getByText('Team Meeting'))
        fireEvent.click(screen.getByRole('button', { name: /Edit/i }))

        expect(screen.getByRole('heading', { name: /Edit Event/i })).toBeInTheDocument()

        const titleInput = screen.getByDisplayValue('Team Meeting')
        fireEvent.change(titleInput, { target: { value: 'Updated Meeting' } })

        fireEvent.click(screen.getByRole('button', { name: /^Update$/i }))

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            '/api/v1/calendar_events/evt-1',
            expect.objectContaining({ method: 'PUT' })
          )
        })
      })

      it('assignment events show "Delete Disabled"', () => {
        renderCalendar(role)

        fireEvent.click(screen.getByText('Math Homework'))
        fireEvent.click(screen.getByRole('button', { name: /Edit/i }))

        expect(screen.getByText('Delete Disabled')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /^Delete$/i })).not.toBeInTheDocument()
      })
    })
  })
})

// ─── Files Tests ────────────────────────────────────────────────────────────

describe('Files — All Roles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders file list', () => {
    renderFiles()
    expect(screen.getByText('syllabus.pdf')).toBeInTheDocument()
    expect(screen.getByText('notes.docx')).toBeInTheDocument()
  })

  it('shows folders and files with icons', () => {
    renderFiles()
    expect(screen.getByText('Week 1')).toBeInTheDocument()
    expect(screen.getByText('Week 2')).toBeInTheDocument()
    expect(screen.getByText('syllabus.pdf')).toBeInTheDocument()
  })

  it('breadcrumb navigation renders', () => {
    renderFiles()
    expect(screen.getByRole('button', { name: /My Files/i })).toBeInTheDocument()
  })

  it('grid/list view toggle works', () => {
    renderFiles()
    expect(document.querySelector('.cx-file-card-grid')).toBeInTheDocument()

    const viewButtons = document.querySelectorAll('button.cx-view-btn')
    expect(viewButtons.length).toBe(2)

    fireEvent.click(viewButtons[1])
    expect(document.querySelector('.cx-table-container')).toBeInTheDocument()
  })
})

describe('Files — Teacher/Admin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('"Upload" button is visible', () => {
    renderFiles()
    expect(screen.getByRole('button', { name: /Upload/i })).toBeInTheDocument()
  })

  it('"Create Folder" button is visible', () => {
    renderFiles()
    expect(screen.getByRole('button', { name: /New Folder/i })).toBeInTheDocument()
  })
})
