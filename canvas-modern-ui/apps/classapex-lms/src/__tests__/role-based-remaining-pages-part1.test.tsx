/**
 * Role-Based Remaining Pages Tests — Part 1
 * ==========================================
 * Verifies AdminDashboard, Reports, Conferences,
 * ePortfolio, CourseImport, and SectionManagement
 * render correctly with mocked data and role-based behavior.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import AdminDashboard from '../pages/admin/AdminDashboard'
import ReportsPage from '../pages/Reports'
import ConferencesPage from '../pages/Conferences'
import EPortfolioPage from '../pages/ePortfolio'
import CourseImportPage from '../pages/CourseImport'
import SectionManagementPage from '../pages/SectionManagement'

import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

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

const mockedFetch = global.fetch as ReturnType<typeof vi.fn>

// ─── Helpers ────────────────────────────────────────────────────────────────

const ALL_ROLES = ['student', 'teacher', 'admin', 'observer'] as const
const TEACHER_LIKE_ROLES = ['teacher', 'admin'] as const
const STUDENT_LIKE_ROLES = ['student', 'observer'] as const

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

// ─── AdminDashboard helpers ─────────────────────────────────────────────────

const MOCK_USERS = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }))
const MOCK_COURSES = [
  { id: 1, name: 'Intro to CS', workflow_state: 'available' },
  { id: 2, name: 'Advanced Math', workflow_state: 'unpublished' },
  { id: 3, name: 'History 101', workflow_state: 'completed' },
]
const MOCK_SUB_ACCOUNTS = [{ id: 1, name: 'Sub 1' }, { id: 2, name: 'Sub 2' }]
const MOCK_NOTIFICATIONS = [{ id: 1, subject: 'Welcome' }]

function mockAdminDashboardData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/accounts/1/users') {
      return { data: MOCK_USERS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint === '/api/v1/accounts/1/courses') {
      return { data: MOCK_COURSES, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint === '/api/v1/accounts/1/sub_accounts') {
      return { data: MOCK_SUB_ACCOUNTS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint === '/api/v1/accounts/1/account_notifications') {
      return { data: MOCK_NOTIFICATIONS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderAdminDashboard() {
  mockNotifications()
  mockAdminDashboardData()
  return render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  )
}

// ─── Reports helpers ────────────────────────────────────────────────────────

const MOCK_REPORT_INSTANCES = [
  { id: 1, report: 'last_enrollment_activity_csv', status: 'complete', progress: 100, created_at: '2026-05-01T00:00:00Z', ended_at: '2026-05-01T01:00:00Z', file_url: 'https://example.com/report1.csv' },
  { id: 2, report: 'grade_export_csv', status: 'running', progress: 45, created_at: '2026-05-02T00:00:00Z', started_at: '2026-05-02T00:00:00Z' },
  { id: 3, report: 'zero_activity_csv', status: 'error', progress: 0, created_at: '2026-05-03T00:00:00Z' },
]

const MOCK_COURSES_FOR_REPORTS = [
  { id: 1, name: 'Course A' },
  { id: 2, name: 'Course B' },
]

function mockReportsData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/courses') {
      return { data: MOCK_COURSES_FOR_REPORTS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function mockFetchForReports(instances: any[] = MOCK_REPORT_INSTANCES) {
  instances.forEach((inst) => {
    mockedFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([inst]) } as Response)
  })
  mockedFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) } as Response)
}

function renderReports() {
  mockNotifications()
  mockReportsData()
  return render(
    <MemoryRouter>
      <ReportsPage />
    </MemoryRouter>
  )
}

// ─── Conferences helpers ────────────────────────────────────────────────────

const MOCK_CONFERENCES = [
  { id: 1, title: 'Weekly Q&A', conference_type: 'BigBlueButton', duration: 60, status: 'active', started_at: '2026-05-20T10:00:00Z', join_url: 'https://bbb.example.com/join/1' },
  { id: 2, title: 'Office Hours', conference_type: 'BigBlueButton', duration: 30, status: 'ready', started_at: null, join_url: 'https://bbb.example.com/join/2' },
  { id: 3, title: 'Last Week Lecture', conference_type: 'BigBlueButton', status: 'concluded', started_at: '2026-05-15T10:00:00Z' },
]

function mockConferencesData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/conferences')) {
      return { data: { conferences: MOCK_CONFERENCES }, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderConferences(role: string) {
  mockRole(role)
  mockNotifications()
  mockConferencesData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/conferences']}>
      <Routes>
        <Route path="/courses/:courseId/conferences" element={<ConferencesPage />} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── ePortfolio helpers ─────────────────────────────────────────────────────

function mockEPortfolioData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/eportfolios') {
      return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderEPortfolio() {
  mockNotifications()
  mockEPortfolioData()
  return render(
    <MemoryRouter>
      <EPortfolioPage />
    </MemoryRouter>
  )
}

// ─── CourseImport helpers ───────────────────────────────────────────────────

const MOCK_SOURCE_COURSES = [
  { id: 1, name: 'Source Course A' },
  { id: 2, name: 'Source Course B' },
  { id: 3, name: 'Current Course' },
]

const MOCK_MIGRATIONS = [
  { id: 1, migration_type: 'course_copy_importer', workflow_state: 'completed', created_at: '2026-05-01T00:00:00Z', progress: 100 },
  { id: 2, migration_type: 'canvas_cartridge_importer', workflow_state: 'running', created_at: '2026-05-10T00:00:00Z', progress: 60 },
]

function mockCourseImportData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/courses') {
      return { data: MOCK_SOURCE_COURSES, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/content_migrations')) {
      return { data: MOCK_MIGRATIONS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderCourseImport(role: string) {
  mockRole(role)
  mockNotifications()
  mockCourseImportData()
  return render(
    <MemoryRouter initialEntries={['/courses/3/import']}>
      <Routes>
        <Route path="/courses/:courseId/import" element={<CourseImportPage />} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── SectionManagement helpers ──────────────────────────────────────────────

const MOCK_SECTIONS = [
  { id: 1, name: 'Section A', sis_section_id: 'SIS-001', students_count: 25, students: [{ id: 1, name: 'Alice' }], start_at: '2026-01-15T00:00:00Z', end_at: '2026-05-15T00:00:00Z' },
  { id: 2, name: 'Section B', sis_section_id: null, students_count: 18, students: [], start_at: null, end_at: null },
]

function mockSectionManagementData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/sections')) {
      return { data: MOCK_SECTIONS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderSectionManagement(role: string) {
  mockRole(role)
  mockNotifications()
  mockSectionManagementData()
  return render(
    <MemoryRouter initialEntries={['/courses/1/sections']}>
      <Routes>
        <Route path="/courses/:courseId/sections" element={<SectionManagementPage />} />
      </Routes>
    </MemoryRouter>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  AdminDashboard
// ═════════════════════════════════════════════════════════════════════════════

describe('AdminDashboard — System Overview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders admin dashboard page without crashing', () => {
    renderAdminDashboard()
    expect(screen.getByRole('heading', { name: /Admin Dashboard/i })).toBeInTheDocument()
    expect(screen.getByText(/Institution overview and quick actions/i)).toBeInTheDocument()
  })

  it('displays stats cards with mocked data', () => {
    renderAdminDashboard()
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('12+')).toBeInTheDocument()
    expect(screen.getByText('Total Courses')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getAllByText('Sub-Accounts').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Active Announcements')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows quick action buttons', () => {
    renderAdminDashboard()
    expect(screen.getByRole('button', { name: /Users/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Course Management/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /SIS Imports/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Roles & Permissions/i })).toBeInTheDocument()
  })

  it('shows recent activity with course names and status badges', () => {
    renderAdminDashboard()
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('Intro to CS')).toBeInTheDocument()
    expect(screen.getByText('Advanced Math')).toBeInTheDocument()
    expect(screen.getByText('History 101')).toBeInTheDocument()
    expect(screen.getByText('available')).toBeInTheDocument()
    expect(screen.getByText('unpublished')).toBeInTheDocument()
    expect(screen.getByText('completed')).toBeInTheDocument()
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  Reports
// ═════════════════════════════════════════════════════════════════════════════

describe('Reports — Analytics & Exports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedFetch.mockReset()
  })

  it('renders reports page without crashing', async () => {
    mockedFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) } as Response)
    renderReports()
    expect(screen.getByRole('status')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText(/No reports found/i)).toBeInTheDocument()
    })
  })

  it('displays mocked report instances with correct stats', async () => {
    mockFetchForReports()
    renderReports()
    await waitFor(() => {
      expect(screen.getByText('3 reports')).toBeInTheDocument()
    })
    expect(screen.getAllByText('Student Activity').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Grade Export').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Zero Activity').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('filters reports by search term', async () => {
    mockFetchForReports()
    renderReports()
    await waitFor(() => {
      expect(screen.getByText('3 reports')).toBeInTheDocument()
    })
    const searchInput = screen.getByPlaceholderText(/Search reports/i)
    fireEvent.change(searchInput, { target: { value: 'grade' } })
    await waitFor(() => {
      expect(screen.getByText('2 reports')).toBeInTheDocument()
    })
  })

  it('filters reports by status dropdown', async () => {
    mockFetchForReports()
    renderReports()
    await waitFor(() => {
      expect(screen.getByText('3 reports')).toBeInTheDocument()
    })
    const statusSelect = screen.getByDisplayValue('All Status')
    fireEvent.change(statusSelect, { target: { value: 'complete' } })
    await waitFor(() => {
      expect(screen.getByText('1 report')).toBeInTheDocument()
    })
  })

  it('opens generate report modal when clicking New Report', async () => {
    mockedFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) } as Response)
    renderReports()
    await waitFor(() => {
      expect(screen.getByText(/No reports found/i)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /New Report/i }))
    expect(screen.getByRole('dialog', { name: /Generate report/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Report Type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Course/i)).toBeInTheDocument()
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  Conferences
// ═════════════════════════════════════════════════════════════════════════════

describe('Conferences — Role-Based Access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders conferences page with active and concluded lists', () => {
        renderConferences(role)
        expect(screen.getByRole('heading', { level: 2, name: /Conferences/i })).toBeInTheDocument()
        expect(screen.getByText('Weekly Q&A')).toBeInTheDocument()
        expect(screen.getByText('Office Hours')).toBeInTheDocument()
        expect(screen.getByText('Last Week Lecture')).toBeInTheDocument()
      })

      it('shows create conference button for teacher/admin', () => {
        renderConferences(role)
        expect(screen.getByRole('button', { name: /^Conference$/i })).toBeInTheDocument()
      })

      it('shows join button for active conferences', () => {
        renderConferences(role)
        const joinButtons = screen.getAllByRole('button', { name: /Join/i })
        expect(joinButtons.length).toBe(2)
      })

      it('shows end button for teacher/admin on active conferences', () => {
        renderConferences(role)
        const endButtons = screen.getAllByRole('button', { name: /End/i })
        expect(endButtons.length).toBe(2)
      })

      it('opens create conference modal on click', () => {
        renderConferences(role)
        fireEvent.click(screen.getByRole('button', { name: /^Conference$/i }))
        expect(screen.getByRole('heading', { name: /Create Web Conference/i })).toBeInTheDocument()
      })
    })
  })

  STUDENT_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('shows conference list but hides create button', () => {
        renderConferences(role)
        expect(screen.getByText('Weekly Q&A')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /^Conference$/i })).not.toBeInTheDocument()
      })

      it('shows join button but no end button', () => {
        renderConferences(role)
        const joinButtons = screen.getAllByRole('button', { name: /Join/i })
        expect(joinButtons.length).toBe(2)
        expect(screen.queryByRole('button', { name: /End/i })).not.toBeInTheDocument()
      })
    })
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  ePortfolio
// ═════════════════════════════════════════════════════════════════════════════

describe('ePortfolio — Student Showcase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders ePortfolio page without crashing', () => {
    renderEPortfolio()
    expect(screen.getByRole('heading', { name: /ePortfolios/i })).toBeInTheDocument()
  })

  it('displays default portfolio data', () => {
    renderEPortfolio()
    expect(screen.getByText('Jane Doe Capstone & Research Showcase')).toBeInTheDocument()
    expect(screen.getByText('Introduction & Biography')).toBeInTheDocument()
    expect(screen.getByText('Biochemistry Lab Reports')).toBeInTheDocument()
    expect(screen.getAllByText('Welcome to my academic page').length).toBeGreaterThanOrEqual(1)
  })

  it('toggles preview mode on and off', () => {
    renderEPortfolio()
    const previewButton = screen.getByRole('button', { name: /Preview Portfolio/i })
    fireEvent.click(previewButton)
    expect(screen.getByRole('button', { name: /Edit Portfolio/i })).toBeInTheDocument()
    expect(screen.getByText('Public Access')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Edit Portfolio/i }))
    expect(screen.getByRole('button', { name: /Preview Portfolio/i })).toBeInTheDocument()
  })

  it('opens create portfolio modal', () => {
    renderEPortfolio()
    fireEvent.click(screen.getByRole('button', { name: /Create ePortfolio/i }))
    expect(screen.getByRole('heading', { name: /Create New ePortfolio/i })).toBeInTheDocument()
  })

  it('allows adding a new section', () => {
    renderEPortfolio()
    const sectionInput = screen.getByPlaceholderText(/New Section/i)
    fireEvent.change(sectionInput, { target: { value: 'New Test Section' } })
    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }))
    expect(screen.getByText('New Test Section')).toBeInTheDocument()
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  CourseImport
// ═════════════════════════════════════════════════════════════════════════════

describe('CourseImport — Role-Based Access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders import page with form for teacher/admin', () => {
        renderCourseImport(role)
        expect(screen.getByRole('heading', { name: /Import Content/i })).toBeInTheDocument()
        expect(screen.getByText('Import Source')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Start Import/i })).toBeInTheDocument()
      })

      it('shows import history with mocked migrations', () => {
        renderCourseImport(role)
        expect(screen.getByText(/Import History/i)).toBeInTheDocument()
        expect(screen.getByText('Course Copy Importer')).toBeInTheDocument()
        expect(screen.getByText('Canvas Cartridge Importer')).toBeInTheDocument()
      })

      it('shows source course selector when copy type is selected', () => {
        renderCourseImport(role)
        expect(screen.getByText((content) => content === 'Source Course')).toBeInTheDocument()
      })

      it('allows toggling content type checkboxes', () => {
        renderCourseImport(role)
        const assignmentsCheckbox = screen.getByLabelText('Assignments')
        expect(assignmentsCheckbox).toBeChecked()
        fireEvent.click(screen.getByRole('button', { name: /^Deselect All$/i }))
        expect(assignmentsCheckbox).not.toBeChecked()
        fireEvent.click(screen.getByRole('button', { name: /^Select All$/i }))
        expect(assignmentsCheckbox).toBeChecked()
      })
    })
  })

  STUDENT_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('shows permission denied message', () => {
        renderCourseImport(role)
        expect(screen.getByText(/You do not have permission/i)).toBeInTheDocument()
      })

      it('does not show import form', () => {
        renderCourseImport(role)
        expect(screen.queryByRole('button', { name: /Start Import/i })).not.toBeInTheDocument()
      })
    })
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  SectionManagement
// ═════════════════════════════════════════════════════════════════════════════

describe('SectionManagement — Role-Based Access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  TEACHER_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('renders sections page with mocked data', () => {
        renderSectionManagement(role)
        expect(screen.getByRole('heading', { name: /Sections/i })).toBeInTheDocument()
        expect(screen.getByText('Section A')).toBeInTheDocument()
        expect(screen.getByText('Section B')).toBeInTheDocument()
      })

      it('shows new section button for teacher/admin', () => {
        renderSectionManagement(role)
        expect(screen.getByRole('button', { name: /New Section/i })).toBeInTheDocument()
      })

      it('shows edit and delete buttons for each section', () => {
        renderSectionManagement(role)
        const editButtons = screen.getAllByRole('button', { name: /Edit/i })
        const deleteButtons = screen.getAllByRole('button', { name: /Delete/i })
        expect(editButtons.length).toBe(2)
        expect(deleteButtons.length).toBe(2)
      })

      it('opens new section modal when clicking New Section', () => {
        renderSectionManagement(role)
        fireEvent.click(screen.getByRole('button', { name: /New Section/i }))
        expect(screen.getByRole('heading', { name: /New Section/i })).toBeInTheDocument()
      })

      it('opens edit section modal when clicking Edit', () => {
        renderSectionManagement(role)
        fireEvent.click(screen.getAllByRole('button', { name: /Edit/i })[0])
        expect(screen.getByRole('heading', { name: /Edit Section/i })).toBeInTheDocument()
      })
    })
  })

  STUDENT_LIKE_ROLES.forEach((role) => {
    describe(`role: ${role}`, () => {
      it('shows permission denied message', () => {
        renderSectionManagement(role)
        expect(screen.getByText(/You do not have permission/i)).toBeInTheDocument()
      })

      it('does not show new section or edit/delete buttons', () => {
        renderSectionManagement(role)
        expect(screen.queryByRole('button', { name: /New Section/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /Delete/i })).not.toBeInTheDocument()
      })
    })
  })
})
