/**
 * Role-Based Remaining Pages Tests — Part 3
 * ==========================================
 * Verifies BlueprintCourses, BrandConfigs, DeveloperKeys,
 * SystemSettings, GradeChangeAudit, and LtiPlayer
 * render correctly with mocked data and interactions.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import BlueprintCoursesPage from '../pages/admin/BlueprintCourses'
import BrandConfigsPage from '../pages/admin/BrandConfigs'
import DeveloperKeysPage from '../pages/admin/DeveloperKeys'
import SystemSettingsPage from '../pages/admin/SystemSettings'
import GradeChangeAuditPage from '../pages/admin/GradeChangeAudit'
import LtiPlayer from '../pages/LtiPlayer'

import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'
import { useTheme } from '../contexts/ThemeContext'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
  useCanvasMutation: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
}))

vi.mock('../hooks/useNotification', () => ({
  useNotification: vi.fn(),
}))

vi.mock('../contexts/ThemeContext', () => ({
  useTheme: vi.fn(),
}))

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockNotifications() {
  vi.mocked(useNotification).mockReturnValue({
    showToast: vi.fn(),
    showConfirm: vi.fn().mockResolvedValue(true),
    showAlert: vi.fn(),
  } as any)
}

function mockTheme() {
  vi.mocked(useTheme).mockReturnValue({
    setBrandConfig: vi.fn(),
  } as any)
}

// ─── BlueprintCourses helpers ───────────────────────────────────────────────

function renderBlueprintCourses() {
  mockNotifications()
  return render(<BlueprintCoursesPage />)
}

// ─── BrandConfigs helpers ───────────────────────────────────────────────────

const MOCK_BRAND_CONFIG_DATA = {
  variables: {
    ic_brand_primary: '#0f62fe',
    ic_brand_button: '#0f62fe',
    ic_brand_button_text: '#ffffff',
    ic_brand_header_image: '',
    ic_brand_favicon: '',
  },
}

function mockBrandConfigsData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/accounts/1/brand_configs/current') {
      return {
        data: MOCK_BRAND_CONFIG_DATA,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderBrandConfigs() {
  mockNotifications()
  mockTheme()
  mockBrandConfigsData()
  return render(<BrandConfigsPage />)
}

// ─── DeveloperKeys helpers ──────────────────────────────────────────────────

const MOCK_DEVELOPER_KEYS = [
  {
    id: 1,
    name: 'Key A',
    workflow_state: 'active' as const,
    created_at: '2026-05-01T00:00:00Z',
    redirect_uris: 'https://a.com/callback',
    email: 'a@example.com',
  },
  {
    id: 2,
    name: 'Key B',
    workflow_state: 'inactive' as const,
    created_at: '2026-05-02T00:00:00Z',
    redirect_uris: '',
    email: '',
  },
]

function mockDeveloperKeysData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/accounts/1/developer_keys') {
      return {
        data: MOCK_DEVELOPER_KEYS,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderDeveloperKeys() {
  mockNotifications()
  mockDeveloperKeysData()
  return render(<DeveloperKeysPage />)
}

// ─── SystemSettings helpers ─────────────────────────────────────────────────

const MOCK_ACCOUNT_DATA = {
  name: 'Test Institution',
  default_time_zone: 'America/New_York',
  default_storage_quota_mb: 500,
  users_can_edit_name: true,
  users_can_edit_comm_channels: true,
  restrict_student_past_view: false,
  restrict_student_future_view: false,
}

const MOCK_FEATURES_DATA = [
  {
    feature: 'new_analytics',
    feature_flag: {
      feature: 'new_analytics',
      state: 'on',
      locked: false,
      display_name: 'New Analytics',
      description: 'Better analytics dashboard',
    },
  },
  {
    feature: 'improved_dashboard',
    feature_flag: {
      feature: 'improved_dashboard',
      state: 'off',
      locked: false,
      display_name: 'Improved Dashboard',
      description: 'Redesigned student dashboard',
    },
  },
]

function mockSystemSettingsData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/accounts/1') {
      return {
        data: MOCK_ACCOUNT_DATA,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    if (endpoint === '/api/v1/accounts/1/features') {
      return {
        data: MOCK_FEATURES_DATA,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderSystemSettings() {
  mockNotifications()
  mockSystemSettingsData()
  return render(<SystemSettingsPage />)
}

// ─── GradeChangeAudit helpers ───────────────────────────────────────────────

const MOCK_GRADE_CHANGES = {
  events: [
    {
      id: '1',
      created_at: '2026-05-01T10:00:00Z',
      event_type: 'grade_change',
      excused_before: false,
      excused_after: false,
      grade_before: 'B',
      grade_after: 'A',
      grader_id: 10,
      student_id: 100,
      assignment_id: 1000,
      course_id: 100,
    },
    {
      id: '2',
      created_at: '2026-05-02T10:00:00Z',
      event_type: 'grade_change',
      excused_before: false,
      excused_after: true,
      grade_before: 'C',
      grade_after: 'Excused',
      grader_id: 10,
      student_id: 101,
      assignment_id: 1001,
      course_id: 200,
    },
  ],
}

function mockGradeChangeData() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/audit/grade_change') {
      return {
        data: MOCK_GRADE_CHANGES,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderGradeChangeAudit() {
  mockGradeChangeData()
  return render(<GradeChangeAuditPage />)
}

// ─── LtiPlayer helpers ──────────────────────────────────────────────────────

function renderLtiPlayer(initialEntry: string) {
  mockNotifications()
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/courses/:courseId/lti" element={<LtiPlayer />} />
        <Route path="/accounts/:accountId/lti" element={<LtiPlayer />} />
        <Route path="/lti" element={<LtiPlayer />} />
      </Routes>
    </MemoryRouter>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  BlueprintCourses
// ═════════════════════════════════════════════════════════════════════════════

describe('BlueprintCourses — Content Sync Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page without crashing', () => {
    renderBlueprintCourses()
    expect(
      screen.getByRole('heading', { name: /Blueprint Courses/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Lookup/i })).toBeInTheDocument()
  })

  it('shows mocked templates after lookup', async () => {
    vi.mocked(canvasFetch).mockResolvedValueOnce([
      { id: 1, course_id: 101, name: 'Template A' },
      { id: 2, course_id: 101, name: 'Template B' },
    ])
    renderBlueprintCourses()
    fireEvent.change(
      screen.getByPlaceholderText(/Enter blueprint course Canvas ID/i),
      { target: { value: '101' } }
    )
    fireEvent.click(screen.getByRole('button', { name: /Lookup/i }))
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Template A/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /Template B/i })
      ).toBeInTheDocument()
    })
  })

  it('shows associated courses and sync history after selecting a template', async () => {
    vi.mocked(canvasFetch)
      .mockResolvedValueOnce([
        { id: 1, course_id: 101, name: 'Template A' },
      ])
      .mockResolvedValueOnce([
        { id: 10, name: 'Assoc Course', course_code: 'AC101' },
      ])
      .mockResolvedValueOnce([
        {
          id: 100,
          workflow_state: 'completed',
          created_at: '2026-05-01T00:00:00Z',
        },
      ])
    renderBlueprintCourses()
    fireEvent.change(
      screen.getByPlaceholderText(/Enter blueprint course Canvas ID/i),
      { target: { value: '101' } }
    )
    fireEvent.click(screen.getByRole('button', { name: /Lookup/i }))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Template A/i })
      ).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: /Template A/i }))
    await waitFor(() => {
      expect(screen.getByText('Associated Courses')).toBeInTheDocument()
      expect(screen.getByText('Assoc Course')).toBeInTheDocument()
      expect(screen.getByText('Recent Sync History')).toBeInTheDocument()
      expect(screen.getByText('Migration #100')).toBeInTheDocument()
    })
  })

  it('allows associating a new course', async () => {
    const showToast = vi.fn()
    vi.mocked(useNotification).mockReturnValue({
      showToast,
      showConfirm: vi.fn().mockResolvedValue(true),
      showAlert: vi.fn(),
    } as any)
    vi.mocked(canvasFetch)
      .mockResolvedValueOnce([
        { id: 1, course_id: 101, name: 'Template A' },
      ])
      .mockResolvedValueOnce([
        { id: 10, name: 'Assoc Course', course_code: 'AC101' },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce([
        { id: 10, name: 'Assoc Course', course_code: 'AC101' },
      ])
      .mockResolvedValueOnce([])
    render(<BlueprintCoursesPage />)
    fireEvent.change(
      screen.getByPlaceholderText(/Enter blueprint course Canvas ID/i),
      { target: { value: '101' } }
    )
    fireEvent.click(screen.getByRole('button', { name: /Lookup/i }))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Template A/i })
      ).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: /Template A/i }))
    await waitFor(() =>
      expect(screen.getByText('Associated Courses')).toBeInTheDocument()
    )
    fireEvent.change(
      screen.getByPlaceholderText(/Course ID to associate/i),
      { target: { value: '200' } }
    )
    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }))
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Course associated', type: 'success' })
      )
    })
  })

  it('triggers content sync when clicking Sync Now', async () => {
    const showToast = vi.fn()
    vi.mocked(useNotification).mockReturnValue({
      showToast,
      showConfirm: vi.fn().mockResolvedValue(true),
      showAlert: vi.fn(),
    } as any)
    vi.mocked(canvasFetch)
      .mockResolvedValueOnce([
        { id: 1, course_id: 101, name: 'Template A' },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({
        id: 99,
        workflow_state: 'queued',
        created_at: '2026-05-01T00:00:00Z',
      })
    render(<BlueprintCoursesPage />)
    fireEvent.change(
      screen.getByPlaceholderText(/Enter blueprint course Canvas ID/i),
      { target: { value: '101' } }
    )
    fireEvent.click(screen.getByRole('button', { name: /Lookup/i }))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Template A/i })
      ).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: /Template A/i }))
    await waitFor(() =>
      expect(screen.getByText('Associated Courses')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: /Sync Now/i }))
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Sync started', type: 'success' })
      )
    })
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  BrandConfigs
// ═════════════════════════════════════════════════════════════════════════════

describe('BrandConfigs — Theme Customization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page without crashing', async () => {
    renderBrandConfigs()
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Theme & Branding/i })
      ).toBeInTheDocument()
    })
  })

  it('shows theme preview with mocked data', async () => {
    renderBrandConfigs()
    await waitFor(() => {
      expect(screen.getByText('Theme Preview')).toBeInTheDocument()
      expect(screen.getByText('Your Logo')).toBeInTheDocument()
      expect(screen.getByText('Sample Button')).toBeInTheDocument()
    })
  })

  it('allows editing primary color and applying theme', async () => {
    const showToast = vi.fn()
    vi.mocked(useNotification).mockReturnValue({
      showToast,
      showConfirm: vi.fn().mockResolvedValue(true),
      showAlert: vi.fn(),
    } as any)
    vi.mocked(canvasFetch).mockRejectedValueOnce(new Error('API unavailable'))
    mockTheme()
    mockBrandConfigsData()
    render(<BrandConfigsPage />)
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: /Theme & Branding/i })
      ).toBeInTheDocument()
    )
    const textInputs = screen.getAllByDisplayValue('#0f62fe')
    expect(textInputs.length).toBeGreaterThanOrEqual(1)
    fireEvent.change(textInputs[0], { target: { value: '#ff0000' } })
    fireEvent.click(screen.getByRole('button', { name: /Apply Theme/i }))
    await waitFor(() => {
      expect(showToast).toHaveBeenCalled()
    })
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  DeveloperKeys
// ═════════════════════════════════════════════════════════════════════════════

describe('DeveloperKeys — API Key Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page without crashing', () => {
    renderDeveloperKeys()
    expect(
      screen.getByRole('heading', { name: /Developer Keys/i })
    ).toBeInTheDocument()
  })

  it('shows mocked developer keys', () => {
    renderDeveloperKeys()
    expect(screen.getByText('Key A')).toBeInTheDocument()
    expect(screen.getByText('Key B')).toBeInTheDocument()
    expect(screen.getByText('ON')).toBeInTheDocument()
    expect(screen.getByText('OFF')).toBeInTheDocument()
  })

  it('filters keys by search term', () => {
    renderDeveloperKeys()
    const searchInput = screen.getByPlaceholderText(
      /Search by name or Client ID/i
    )
    fireEvent.change(searchInput, { target: { value: 'Key A' } })
    expect(screen.getByText('Key A')).toBeInTheDocument()
    expect(screen.queryByText('Key B')).not.toBeInTheDocument()
  })

  it('shows add developer key modal when clicking Add Developer Key', () => {
    renderDeveloperKeys()
    fireEvent.click(
      screen.getByRole('button', { name: /Add Developer Key/i })
    )
    expect(
      screen.getByRole('heading', { name: /Generate Developer Key/i })
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/e.g. Zoom Integration/i)
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/e.g. admin@school.edu/i)
    ).toBeInTheDocument()
  })

  it('shows toggle checkboxes for each key', () => {
    renderDeveloperKeys()
    const toggles = screen.getAllByRole('checkbox')
    expect(toggles.length).toBe(MOCK_DEVELOPER_KEYS.length)
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  SystemSettings
// ═════════════════════════════════════════════════════════════════════════════

describe('SystemSettings — Global Canvas Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page without crashing', async () => {
    renderSystemSettings()
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /System Settings/i })
      ).toBeInTheDocument()
    })
  })

  it('shows account settings form with mocked data', async () => {
    renderSystemSettings()
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Institution')).toBeInTheDocument()
      expect(screen.getByDisplayValue('America/New_York')).toBeInTheDocument()
      expect(screen.getByDisplayValue('500')).toBeInTheDocument()
    })
    expect(
      screen.getByLabelText(/Users can edit their name/i)
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/Users can edit communication channels/i)
    ).toBeInTheDocument()
  })

  it('switches to feature flags tab and displays features', async () => {
    renderSystemSettings()
    fireEvent.click(screen.getByRole('button', { name: /Feature Flags/i }))
    await waitFor(() => {
      expect(screen.getByText('New Analytics')).toBeInTheDocument()
      expect(screen.getByText('Improved Dashboard')).toBeInTheDocument()
    })
  })

  it('filters features by search term', async () => {
    renderSystemSettings()
    fireEvent.click(screen.getByRole('button', { name: /Feature Flags/i }))
    await waitFor(() =>
      expect(screen.getByText('New Analytics')).toBeInTheDocument()
    )
    const searchInput = screen.getByPlaceholderText(/Search features/i)
    fireEvent.change(searchInput, { target: { value: 'Improved' } })
    await waitFor(() => {
      expect(screen.queryByText('New Analytics')).not.toBeInTheDocument()
      expect(screen.getByText('Improved Dashboard')).toBeInTheDocument()
    })
  })

  it('switches to backup tab and shows backup buttons', () => {
    renderSystemSettings()
    fireEvent.click(screen.getByRole('button', { name: /Backup & Demo Data/i }))
    expect(
      screen.getByRole('button', { name: /Create Backup Now/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Restore System/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Clean Up Test Records/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Import Demo Data/i })
    ).toBeInTheDocument()
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  GradeChangeAudit
// ═════════════════════════════════════════════════════════════════════════════

describe('GradeChangeAudit — Compliance Audit Trail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page without crashing', () => {
    renderGradeChangeAudit()
    expect(
      screen.getByRole('heading', { name: /Grade Change Audit/i })
    ).toBeInTheDocument()
  })

  it('shows mocked grade change events', () => {
    renderGradeChangeAudit()
    expect(screen.getAllByText('100').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('200')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('Excused')).toBeInTheDocument()
  })

  it('filters by course id input', () => {
    renderGradeChangeAudit()
    const courseInput = screen.getByPlaceholderText(/Course ID/i)
    fireEvent.change(courseInput, { target: { value: '100' } })
    expect(courseInput).toHaveValue('100')
  })

  it('filters by student id input', () => {
    renderGradeChangeAudit()
    const studentInput = screen.getByPlaceholderText(/Student ID/i)
    fireEvent.change(studentInput, { target: { value: '101' } })
    expect(studentInput).toHaveValue('101')
  })
})

// ═════════════════════════════════════════════════════════════════════════════
//  LtiPlayer
// ═════════════════════════════════════════════════════════════════════════════

describe('LtiPlayer — LTI Content Launch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', async () => {
    vi.mocked(canvasFetch).mockImplementation(() => new Promise(() => {}))
    renderLtiPlayer('/courses/101/lti?tool_id=5')
    await waitFor(() => {
      expect(document.querySelector('.cx-loading-ring')).toBeInTheDocument()
    })
  })

  it('shows iframe after successful launch', async () => {
    vi.mocked(canvasFetch).mockResolvedValueOnce({
      url: 'https://lti.example.com/launch',
    })
    renderLtiPlayer('/courses/101/lti?tool_id=5')
    await waitFor(() => {
      expect(screen.getByTitle('LTI Tool')).toBeInTheDocument()
      expect(screen.getByTitle('LTI Tool')).toHaveAttribute(
        'src',
        'https://lti.example.com/launch'
      )
    })
  })

  it('shows error when no course or account id is provided', async () => {
    renderLtiPlayer('/lti')
    await waitFor(() => {
      expect(
        screen.getByText(/No course ID or account ID provided/i)
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Go Back/i })).toBeInTheDocument()
    })
  })

  it('shows error when canvasFetch fails', async () => {
    vi.mocked(canvasFetch).mockRejectedValueOnce(
      new Error('LTI tool not found')
    )
    renderLtiPlayer('/courses/101/lti?tool_id=5')
    await waitFor(() => {
      expect(
        screen.getByText(/LTI tool not found/i)
      ).toBeInTheDocument()
    })
  })
})
