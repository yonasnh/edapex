import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom'

import AdminDashboardPage from '../pages/admin/AdminDashboard'
import AdminCourseManagementPage from '../pages/admin/CourseManagement'
import AdminUsersPage from '../pages/admin/Users'
import AdminTermsPage from '../pages/admin/Terms'
import SettingsPage from '../pages/Settings'
import ObserverDashboard from '../pages/ObserverDashboard'
import CalendarPage from '../pages/Calendar'
import AssignmentList from '../pages/AssignmentList'

import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

vi.mock('../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
  useCanvasMutation: () => ({ mutate: vi.fn(), isLoading: false, error: null, data: null }),
}))

vi.mock('../contexts/RoleContext', () => ({
  useRole: vi.fn(),
}))

vi.mock('../hooks/useNotification', () => ({
  useNotification: vi.fn(),
}))

vi.mock('../contexts/TenantContext', () => ({
  useTenant: () => ({ config: { ui: { dashboardLayout: 'cards' } } }),
}))

vi.mock('../widgets/VirtualList', () => ({
  __esModule: true,
  default: ({ items, itemHeight, children }: any) => (
    <div data-testid="virtual-list">
      {items.map((item: any) => (
        <div key={item.id} style={{ height: itemHeight }}>{children(item)}</div>
      ))}
    </div>
  ),
}))

vi.mock('../widgets/ModuleList', () => ({
  ModuleList: () => <div data-testid="module-list">Modules</div>,
}))

vi.mock('../widgets/PeopleList', () => ({
  PeopleList: () => <div data-testid="people-list">People</div>,
}))

vi.mock('../widgets/MediaLibrary', () => ({
  MediaLibrary: () => <div data-testid="media-library">Media Library</div>,
}))

vi.mock('../widgets/CourseSidebar', () => ({
  CourseSidebar: () => (
    <div data-testid="course-sidebar">
      <Link to="/courses/1/assignments">Assignments</Link>
    </div>
  ),
}))

vi.mock('@schoolapex/core', () => ({
  ThemeProvider: ({ children }: any) => <>{children}</>,
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn(), accentColor: '#6366f1', setAccentColor: vi.fn() }),
  AuthProvider: ({ children }: any) => <>{children}</>,
  RequireAuth: ({ children }: any) => <>{children}</>,
  OAuthCallbackPage: () => <div>OAuth</div>,
  useAuth: () => ({ token: 'test-token', isAuthenticated: true }),
}))

vi.mock('../contexts/I18nContext', () => ({
  I18nProvider: ({ children }: any) => <>{children}</>,
  useI18n: () => ({ locale: 'en', setLocale: vi.fn(), t: (k: string) => k }),
}))

const mockShowToast = vi.fn()
const mockShowConfirm = vi.fn().mockResolvedValue(true)

function mockRole(role: string) {
  vi.mocked(useRole).mockReturnValue({ role, masqueradeAs: vi.fn() } as any)
}

function mockNotifications() {
  vi.mocked(useNotification).mockReturnValue({
    showToast: mockShowToast,
    showConfirm: mockShowConfirm,
    showAlert: vi.fn(),
  } as any)
}

vi.mocked(canvasFetch).mockResolvedValue({ id: 999, success: true })
;(global.fetch as any).mockResolvedValue({ ok: true })

describe('Journey 10 full', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRole('admin')
    mockNotifications()
  })

  it('full flow', async () => {
    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint === '/api/v1/accounts/1/users') return { data: [{ id: 100, name: 'Dr. Sarah Chen' }], isLoading: false, isError: false, refetch: vi.fn() } as any
      if (endpoint === '/api/v1/accounts/1/courses') return { data: [{ id: 1, name: 'Existing Course' }], isLoading: false, isError: false, refetch: vi.fn() } as any
      if (endpoint === '/api/v1/accounts/1/sub_accounts') return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      if (endpoint === '/api/v1/accounts/1/account_notifications') return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      if (endpoint === '/api/v1/accounts/1/terms') return { data: { enrollment_terms: [{ id: 1, name: 'Fall 2026' }] }, isLoading: false, isError: false, refetch: vi.fn() } as any
      if (endpoint === '/api/v1/accounts/1/admins') return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
    })

    const { unmount } = render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/courses" element={<AdminCourseManagementPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Admin Dashboard')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Course Management'))
    await waitFor(() => expect(screen.getByText('Course Management')).toBeInTheDocument())

    // Try modal
    fireEvent.click(screen.getByText('New Course'))
    await waitFor(() => expect(screen.getByText('Create New Course')).toBeInTheDocument(), { timeout: 3000 })

    unmount()
  })
})


// ─── Journey 11: Observer links to student ──────────────────────────────────

describe('Journey 11: Observer links to student', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNotifications()
    vi.mocked(canvasFetch).mockResolvedValue({ id: 999, success: true })
    ;(global.fetch as any).mockResolvedValue({ ok: true })
  })

  it('student generates pairing code, observer uses it to link', async () => {
    mockRole('student')

    vi.mocked(canvasFetch).mockImplementation(async (endpoint: string, options?: any) => {
      if (endpoint === '/api/v1/users/self/observer_pairing_codes' && options?.method === 'POST') {
        return { code: 'ABC123', expires_at: '2026-12-31' }
      }
      if (endpoint === '/api/v1/users/self/observees' && options?.method === 'POST') {
        return { id: 8, name: 'PlayStudent' }
      }
      return { id: 999, success: true }
    })

    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint === '/api/v1/users/self') {
        return { data: { id: 1, name: 'PlayStudent', primary_email: 'student@example.com' }, isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/users/self/communication_channels') {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/users/self/observees') {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
    })

    const { unmount } = render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Generate Code')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Generate Code'))
    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        '/api/v1/users/self/observer_pairing_codes',
        expect.objectContaining({ method: 'POST' })
      )
    })

    await waitFor(() => expect(screen.getByText('ABC123')).toBeInTheDocument())

    unmount()
    mockRole('observer')

    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint === '/api/v1/users/self/observees') {
        return { data: [{ id: 8, name: 'PlayStudent', avatar_url: '' }], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/users/8/enrollments') {
        return { data: [{ id: 80, course_id: 1, type: 'StudentEnrollment', grades: { current_grade: 'B', current_score: 85 } }], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/users/8/missing_submissions') {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
    })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<ObserverDashboard />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Observer Dashboard')).toBeInTheDocument())

    fireEvent.click(screen.getAllByText('Link Student')[0])
    await waitFor(() => expect(screen.getByText('Link with Student')).toBeInTheDocument())

    const codeInput = screen.getByPlaceholderText('e.g. 1a2b3c4d')
    fireEvent.change(codeInput, { target: { value: 'ABC123' } })
    fireEvent.click(screen.getAllByText('Link Student')[1])

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        '/api/v1/users/self/observees',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })
})

// ─── Journey 12: Calendar event → assignment creation ───────────────────────

describe('Journey 12: Calendar event to assignment creation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRole('teacher')
    mockNotifications()
    vi.mocked(canvasFetch).mockResolvedValue({ id: 999, success: true })
    ;(global.fetch as any).mockResolvedValue({ ok: true })
  })

  it('teacher creates calendar event and sees it reflected in assignments', async () => {
    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint === '/api/v1/calendar_events') {
        return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/courses') {
        return { data: [{ id: 1, name: 'Math 101' }], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      if (endpoint === '/api/v1/courses/1/assignments') {
        return { data: [{ id: 101, name: 'Existing Assignment', points_possible: 10, due_at: '2026-06-01T23:59:59Z', course_id: 1, submission: null }], isLoading: false, isError: false, refetch: vi.fn() } as any
      }
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
    })

    vi.mocked(canvasFetch).mockImplementation(async (endpoint: string, options?: any) => {
      if (endpoint === '/api/v1/calendar_events' && options?.method === 'POST') {
        return { id: 501, title: 'Review Session', start_at: '2026-06-01T10:00:00Z' }
      }
      return { id: 999, success: true }
    })

    const { unmount } = render(
      <MemoryRouter initialEntries={['/calendar']}>
        <Routes>
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Create Event')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Create Event'))
    await waitFor(() => expect(screen.getByPlaceholderText('Event title')).toBeInTheDocument())

    fireEvent.change(screen.getByPlaceholderText('Event title'), { target: { value: 'Review Session' } })
    fireEvent.click(screen.getByText('Create'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/calendar_events',
        expect.objectContaining({ method: 'POST' })
      )
    })

    unmount()

    vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
      if (endpoint === '/api/v1/courses/1/assignments') {
        return {
          data: [
            { id: 101, name: 'Existing Assignment', points_possible: 10, due_at: '2026-06-01T23:59:59Z', course_id: 1, submission: null },
            { id: 102, name: 'Review Session', points_possible: 10, due_at: '2026-06-01T10:00:00Z', course_id: 1, submission: null },
          ],
          isLoading: false, isError: false, refetch: vi.fn(),
        } as any
      }
      return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
    })

    render(
      <MemoryRouter initialEntries={['/courses/1/assignments']}>
        <Routes>
          <Route path="/courses/:courseId/assignments" element={<AssignmentList />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Review Session')).toBeInTheDocument())
  })
})
