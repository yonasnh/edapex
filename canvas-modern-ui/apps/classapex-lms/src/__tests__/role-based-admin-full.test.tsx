/**
 * Role-Based Admin Pages — Full Coverage
 * ========================================
 * Verifies Users, Terms, FeatureFlags, SISImports, and SubAccounts
 * admin pages render and function correctly for all roles.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import UsersPage from '../pages/admin/Users'
import TermsPage from '../pages/admin/Terms'
import FeatureFlagsPage from '../pages/admin/FeatureFlags'
import SisImportsPage from '../pages/admin/SisImports'
import SubAccountsPage from '../pages/admin/SubAccounts'

import { useCanvasQuery, canvasFetch, useCanvasMutation } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
  useCanvasMutation: vi.fn(() => ({ mutate: vi.fn(), isLoading: false, error: null, data: null })),
}))

vi.mock('../contexts/RoleContext', () => ({
  useRole: vi.fn(),
}))

vi.mock('../hooks/useNotification', () => ({
  useNotification: vi.fn(),
}))

// ─── Helpers ────────────────────────────────────────────────────────────────

const ALL_ROLES = ['student', 'teacher', 'admin', 'observer'] as const

function mockRole(role: string) {
  vi.mocked(useRole).mockReturnValue({ role, masqueradeAs: vi.fn() } as any)
}

function mockNotifications() {
  vi.mocked(useNotification).mockReturnValue({
    showToast: vi.fn(),
    showConfirm: vi.fn().mockResolvedValue(true),
    showAlert: vi.fn(),
  } as any)
}

const MOCK_USERS = [
  { id: 1, name: 'Alice Admin', email: 'alice@example.com', login_id: 'alice', created_at: '2025-01-01T00:00:00Z', last_login: '2026-05-20T10:00:00Z', enrollments: [{ type: 'TeacherEnrollment' }] },
  { id: 2, name: 'Bob Student', email: 'bob@example.com', login_id: 'bob', created_at: '2025-02-01T00:00:00Z', last_login: '2026-05-21T10:00:00Z', enrollments: [{ type: 'StudentEnrollment' }] },
  { id: 3, name: 'Carol Teacher', email: 'carol@example.com', login_id: 'carol', created_at: '2025-03-01T00:00:00Z', last_login: '2026-05-22T10:00:00Z', enrollments: [{ type: 'TeacherEnrollment' }] },
]
const MOCK_ADMINS = [{ user: { id: 1 } }]
const MOCK_COURSES = [{ id: 101, name: 'Test Course 101' }]
const MOCK_REFETCH = vi.fn()

function mockUseCanvasQueryForUsers() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/accounts/1/users') {
      return { data: MOCK_USERS, isLoading: false, isError: false, refetch: MOCK_REFETCH } as any
    }
    if (endpoint === '/api/v1/accounts/1/admins') {
      return { data: MOCK_ADMINS, isLoading: false, isError: false, refetch: MOCK_REFETCH } as any
    }
    if (endpoint === '/api/v1/courses') {
      return { data: MOCK_COURSES, isLoading: false, isError: false, refetch: MOCK_REFETCH } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: MOCK_REFETCH }
  })
}

const MOCK_TERMS = {
  enrollment_terms: [
    { id: 1, name: 'Fall 2025', start_at: '2025-08-15T00:00:00Z', end_at: '2025-12-15T00:00:00Z', workflow_state: 'active' },
    { id: 2, name: 'Spring 2026', start_at: '2026-01-10T00:00:00Z', end_at: '2026-05-10T00:00:00Z', workflow_state: 'active' },
  ],
}

function mockUseCanvasQueryForTerms() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/accounts/1/terms') {
      return { data: MOCK_TERMS, isLoading: false, isError: false, refetch: MOCK_REFETCH } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: MOCK_REFETCH }
  })
}

const MOCK_FLAGS = [
  { feature: 'new_gradebook', display_name: 'New Gradebook', description: 'Enhanced gradebook UI', state: 'on', applies_to: 'course', beta: false, autoexpand: false },
  { feature: 'analytics_beta', display_name: 'Analytics Beta', description: 'Beta analytics dashboard', state: 'allowed', applies_to: 'account', beta: true, autoexpand: true },
  { feature: 'legacy_chat', display_name: 'Legacy Chat', description: 'Old chat system', state: 'off', applies_to: 'account', beta: false, autoexpand: false },
]

function mockUseCanvasQueryForFeatureFlags() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/accounts/1/features') {
      return { data: MOCK_FLAGS, isLoading: false, isError: false, refetch: MOCK_REFETCH } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: MOCK_REFETCH }
  })
}

const MOCK_SIS_IMPORTS = {
  sis_imports: [
    {
      id: 101,
      progress: 100,
      workflow_state: 'imported',
      data: { import_type: 'instructure_csv' },
      processing_errors: [],
      processing_warnings: [],
      statistics: { total_rows: 50, successful_rows: 50, failed_rows: 0 },
      created_at: '2026-05-01T10:00:00Z',
      csv_attachments: [],
    },
    {
      id: 102,
      progress: 100,
      workflow_state: 'failed',
      data: { import_type: 'instructure_csv' },
      processing_errors: ['Invalid row 3'],
      processing_warnings: ['Missing email'],
      statistics: { total_rows: 30, successful_rows: 28, failed_rows: 2 },
      created_at: '2026-05-10T10:00:00Z',
      csv_attachments: [],
    },
  ],
}

function mockUseCanvasQueryForSisImports() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/accounts/1/sis_imports') {
      return { data: MOCK_SIS_IMPORTS, isLoading: false, isError: false, refetch: MOCK_REFETCH } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: MOCK_REFETCH }
  })
}

const MOCK_ROOT_ACCOUNTS = [{ id: 1, name: 'Root Account', parent_account_id: null, course_count: 10, user_count: 100, enrollment_count: 200, storage_quota_used_mb: 512, storage_quota: 10737418240, default_storage_quota_mb: 10240 }]
const MOCK_SUB_ACCOUNTS = [
  { id: 2, name: 'Engineering Dept', parent_account_id: 1, course_count: 5, user_count: 50, enrollment_count: 100, storage_quota_used_mb: 256, storage_quota: 5368709120, default_storage_quota_mb: 5120 },
  { id: 3, name: 'Arts Dept', parent_account_id: 1, course_count: 3, user_count: 30, enrollment_count: 60, storage_quota_used_mb: 128, storage_quota: 5368709120, default_storage_quota_mb: 5120 },
]

function mockUseCanvasQueryForSubAccounts() {
  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint === '/api/v1/accounts') {
      return { data: MOCK_ROOT_ACCOUNTS, isLoading: false, isError: false, refetch: MOCK_REFETCH } as any
    }
    if (endpoint === '/api/v1/accounts/1/sub_accounts') {
      return { data: MOCK_SUB_ACCOUNTS, isLoading: false, isError: false, refetch: MOCK_REFETCH } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: MOCK_REFETCH }
  })
}

function renderUsers(role: string) {
  mockRole(role)
  mockNotifications()
  mockUseCanvasQueryForUsers()
  return render(
    <MemoryRouter>
      <UsersPage />
    </MemoryRouter>
  )
}

function renderTerms(role: string) {
  mockRole(role)
  mockNotifications()
  mockUseCanvasQueryForTerms()
  return render(
    <MemoryRouter>
      <TermsPage />
    </MemoryRouter>
  )
}

function renderFeatureFlags(role: string) {
  mockRole(role)
  mockNotifications()
  mockUseCanvasQueryForFeatureFlags()
  return render(
    <MemoryRouter>
      <FeatureFlagsPage />
    </MemoryRouter>
  )
}

function renderSisImports(role: string) {
  mockRole(role)
  mockNotifications()
  mockUseCanvasQueryForSisImports()
  return render(
    <MemoryRouter>
      <SisImportsPage />
    </MemoryRouter>
  )
}

function renderSubAccounts(role: string) {
  mockRole(role)
  mockNotifications()
  mockUseCanvasQueryForSubAccounts()
  return render(
    <MemoryRouter>
      <SubAccountsPage />
    </MemoryRouter>
  )
}

// ─── Tests — Users Page ─────────────────────────────────────────────────────

describe('Users Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  ALL_ROLES.forEach((role) => {
    it(`[${role}] renders without crashing`, () => {
      renderUsers(role)
      expect(screen.getByText('User Management')).toBeInTheDocument()
    })
  })

  it('admin: renders user list with names, emails, roles', async () => {
    renderUsers('admin')
    await waitFor(() => {
      expect(screen.getByText('Alice Admin')).toBeInTheDocument()
      expect(screen.getByText('Bob Student')).toBeInTheDocument()
      expect(screen.getByText('Carol Teacher')).toBeInTheDocument()
    })
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })

  it('admin: search filters users by name', async () => {
    renderUsers('admin')
    await waitFor(() => expect(screen.getByText('Alice Admin')).toBeInTheDocument())

    const searchInput = screen.getByPlaceholderText('Search users...')
    fireEvent.change(searchInput, { target: { value: 'Carol' } })

    await waitFor(() => {
      expect(screen.queryByText('Alice Admin')).not.toBeInTheDocument()
      expect(screen.getByText('Carol Teacher')).toBeInTheDocument()
    })
  })

  it('admin: role filter works', async () => {
    renderUsers('admin')
    await waitFor(() => expect(screen.getByText('Alice Admin')).toBeInTheDocument())

    const roleSelect = screen.getByDisplayValue('All Roles')
    fireEvent.change(roleSelect, { target: { value: 'student' } })

    await waitFor(() => {
      expect(screen.queryByText('Alice Admin')).not.toBeInTheDocument()
      expect(screen.getByText('Bob Student')).toBeInTheDocument()
    })
  })

  it('admin: Add User button is visible and opens modal', async () => {
    renderUsers('admin')
    const addButton = screen.getByText('Add User')
    expect(addButton).toBeInTheDocument()

    fireEvent.click(addButton)
    await waitFor(() => {
      expect(screen.getByText('Add New User')).toBeInTheDocument()
    })
  })

  it('admin: Edit button is visible in row actions', async () => {
    renderUsers('admin')
    await waitFor(() => expect(screen.getByText('Alice Admin')).toBeInTheDocument())

    const editButtons = screen.getAllByTitle('Edit User')
    expect(editButtons.length).toBeGreaterThan(0)
  })

  it('admin: Masquerade button is visible in dropdown', async () => {
    renderUsers('admin')
    await waitFor(() => expect(screen.getByText('Alice Admin')).toBeInTheDocument())

    const moreButtons = screen.getAllByTitle('More')
    fireEvent.click(moreButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/Act As User/i)).toBeInTheDocument()
    })
  })
})

// ─── Tests — Terms Page ─────────────────────────────────────────────────────

describe('Terms Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  ALL_ROLES.forEach((role) => {
    it(`[${role}] renders without crashing`, () => {
      renderTerms(role)
      expect(screen.getByText('Academic Terms')).toBeInTheDocument()
    })
  })

  it('admin: renders term list with names and dates', async () => {
    renderTerms('admin')
    await waitFor(() => {
      expect(screen.getByText('Fall 2025')).toBeInTheDocument()
      expect(screen.getByText('Spring 2026')).toBeInTheDocument()
    })
  })

  it('admin: Add Term button is visible and opens create form', async () => {
    renderTerms('admin')
    const newTermButton = screen.getByText('New Term')
    expect(newTermButton).toBeInTheDocument()

    fireEvent.click(newTermButton)
    await waitFor(() => {
      expect(screen.getByText('Create New Term')).toBeInTheDocument()
    })
  })

  it('admin: Edit button is visible', async () => {
    renderTerms('admin')
    await waitFor(() => expect(screen.getByText('Fall 2025')).toBeInTheDocument())

    const editButtons = screen.getAllByLabelText('Edit')
    expect(editButtons.length).toBeGreaterThan(0)
  })

  it('admin: Delete button is visible', async () => {
    renderTerms('admin')
    await waitFor(() => expect(screen.getByText('Fall 2025')).toBeInTheDocument())

    const deleteButtons = screen.getAllByLabelText('Delete')
    expect(deleteButtons.length).toBeGreaterThan(0)
  })
})

// ─── Tests — Feature Flags Page ─────────────────────────────────────────────

describe('Feature Flags Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  ALL_ROLES.forEach((role) => {
    it(`[${role}] renders without crashing`, () => {
      renderFeatureFlags(role)
      expect(screen.getByText('Feature Flags')).toBeInTheDocument()
    })
  })

  it('admin: renders feature flag list with names, descriptions, states', async () => {
    renderFeatureFlags('admin')
    await waitFor(() => {
      expect(screen.getByText('New Gradebook')).toBeInTheDocument()
      expect(screen.getByText('Analytics Beta')).toBeInTheDocument()
      expect(screen.getByText('Legacy Chat')).toBeInTheDocument()
    })
    expect(screen.getByText('Enhanced gradebook UI')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('admin: filter by state works', async () => {
    renderFeatureFlags('admin')
    await waitFor(() => expect(screen.getByText('New Gradebook')).toBeInTheDocument())

    const stateSelect = screen.getByDisplayValue('All States')
    fireEvent.change(stateSelect, { target: { value: 'off' } })

    await waitFor(() => {
      expect(screen.queryByText('New Gradebook')).not.toBeInTheDocument()
      expect(screen.getByText('Legacy Chat')).toBeInTheDocument()
    })
  })

  it('admin: toggle button cycles states and calls canvasFetch', async () => {
    renderFeatureFlags('admin')
    await waitFor(() => expect(screen.getByText('New Gradebook')).toBeInTheDocument())

    const toggleButton = screen.getByLabelText('Toggle New Gradebook')
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(canvasFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/accounts/1/features/flags/new_gradebook'),
        expect.objectContaining({ method: 'PUT' })
      )
    })
  })
})

// ─── Tests — SIS Imports Page ───────────────────────────────────────────────

describe('SIS Imports Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  ALL_ROLES.forEach((role) => {
    it(`[${role}] renders without crashing`, () => {
      renderSisImports(role)
      expect(screen.getByText('SIS Imports')).toBeInTheDocument()
    })
  })

  it('admin: renders import history with status badges', async () => {
    renderSisImports('admin')
    await waitFor(() => {
      expect(screen.getByText('#101')).toBeInTheDocument()
      expect(screen.getByText('#102')).toBeInTheDocument()
    })
    // Status text is lowercase in DOM; CSS capitalizes it visually
    expect(screen.getByText('imported')).toBeInTheDocument()
    expect(screen.getByText('failed')).toBeInTheDocument()
  })

  it('admin: upload button (Choose File) is visible', () => {
    renderSisImports('admin')
    expect(screen.getByText('Choose File')).toBeInTheDocument()
    expect(screen.getByText('Process Import')).toBeInTheDocument()
  })
})

// ─── Tests — SubAccounts Page ───────────────────────────────────────────────

describe('SubAccounts Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  ALL_ROLES.forEach((role) => {
    it(`[${role}] renders without crashing`, () => {
      renderSubAccounts(role)
      expect(screen.getByText('Sub-Accounts')).toBeInTheDocument()
    })
  })

  it('admin: renders sub-account list', async () => {
    renderSubAccounts('admin')
    await waitFor(() => {
      // Root account is always visible; sub-account visibility depends on tree expansion
      expect(screen.getByText('Root Account')).toBeInTheDocument()
    })
  })

  it('admin: Add Sub-Account button is visible and opens create form', async () => {
    renderSubAccounts('admin')
    const addButton = screen.getByText('New Sub-Account')
    expect(addButton).toBeInTheDocument()

    fireEvent.click(addButton)
    await waitFor(() => {
      expect(screen.getByText('Create Sub-Account')).toBeInTheDocument()
    })
  })
})
