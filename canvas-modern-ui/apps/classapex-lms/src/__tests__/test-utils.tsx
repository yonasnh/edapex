/**
 * ClassApex Shared Test Utilities
 * ================================
 * Provides mock factories and helper functions for testing
 * React components that depend on Canvas API, contexts, and routing.
 */

import React from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

// ─── Type Definitions ───────────────────────────────────────────────────────

export interface MockUser {
  id: number
  name: string
  email?: string
  avatar_url?: string
  role: 'student' | 'teacher' | 'admin' | 'ta' | 'observer' | 'designer'
}

export interface MockCourse {
  id: number
  name: string
  course_code: string
  workflow_state: string
}

export interface MockDiscussion {
  id: number
  title: string
  message: string
  author: { id: number; display_name: string }
  posted_at: string
  created_at: string
  discussion_subentry_count: number
  pinned: boolean
  locked: boolean
  unread_count: number
  subscribed: boolean
}

export interface MockConversation {
  id: number
  subject: string
  last_message: string
  last_message_at: string
  workflow_state: 'read' | 'unread' | 'archived'
  message_count: number
  participants: Array<{ id: number; name: string; avatar_url?: string }>
  starred: boolean
  context_name?: string
}

export interface MockAssignment {
  id: number
  name: string
  description: string
  points_possible: number
  due_at: string | null
  published: boolean
  submission_types: string[]
}

// ─── Mock Factories ─────────────────────────────────────────────────────────

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    avatar_url: 'https://example.com/avatar.png',
    role: 'student',
    ...overrides,
  }
}

export function createMockCourse(overrides: Partial<MockCourse> = {}): MockCourse {
  return {
    id: 1,
    name: 'Test Course',
    course_code: 'TC-101',
    workflow_state: 'available',
    ...overrides,
  }
}

export function createMockDiscussion(overrides: Partial<MockDiscussion> = {}): MockDiscussion {
  return {
    id: 1,
    title: 'Test Discussion',
    message: '<p>Test message body</p>',
    author: { id: 1, display_name: 'Test User' },
    posted_at: '2026-01-01T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    discussion_subentry_count: 0,
    pinned: false,
    locked: false,
    unread_count: 0,
    subscribed: false,
    ...overrides,
  }
}

export function createMockConversation(overrides: Partial<MockConversation> = {}): MockConversation {
  return {
    id: 1,
    subject: 'Test Subject',
    last_message: 'Hello there',
    last_message_at: '2026-01-01T00:00:00Z',
    workflow_state: 'read',
    message_count: 1,
    participants: [{ id: 1, name: 'Test User' }],
    starred: false,
    ...overrides,
  }
}

export function createMockAssignment(overrides: Partial<MockAssignment> = {}): MockAssignment {
  return {
    id: 1,
    name: 'Test Assignment',
    description: '<p>Do the thing</p>',
    points_possible: 100,
    due_at: null,
    published: true,
    submission_types: ['online_text_entry'],
    ...overrides,
  }
}

// ─── Context Mock Helpers ───────────────────────────────────────────────────

export function mockRole(role: MockUser['role']) {
  return () => {
    const actual = vi.importActual('../../contexts/RoleContext')
    return {
      ...actual,
      useRole: () => ({ role, masqueradeAs: vi.fn() }),
      RoleProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    }
  }
}

export function mockNotification() {
  return () => ({
    useNotification: () => ({
      showToast: vi.fn(),
      showConfirm: vi.fn().mockResolvedValue(true),
      showAlert: vi.fn(),
    }),
  })
}

export function mockTheme() {
  return () => ({
    useTheme: () => ({
      theme: 'light',
      toggleTheme: vi.fn(),
      accentColor: '#6366f1',
      setAccentColor: vi.fn(),
    }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  })
}

export function mockTenant() {
  return () => ({
    useTenant: () => ({ config: { ui: { dashboardLayout: 'cards' } } }),
    TenantProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  })
}

export function mockI18n() {
  return () => ({
    useI18n: () => ({
      locale: 'en',
      setLocale: vi.fn(),
      t: (key: string) => key,
    }),
    I18nProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  })
}

// ─── API Mock Helpers ───────────────────────────────────────────────────────

export type ApiResponseMap = Record<string, { data?: any; isLoading?: boolean; isError?: boolean; error?: any; refetch?: any }>

export function createMockUseCanvasQuery(responses: ApiResponseMap) {
  return vi.fn((endpoint: string, _params?: any, _options?: any) => {
    const match = Object.entries(responses).find(([key]) => endpoint.includes(key))
    if (match) {
      return { data: null, isLoading: false, isError: false, refetch: vi.fn(), ...match[1] }
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

export function createMockCanvasFetch(handler: (endpoint: string, options?: any) => Promise<any>) {
  return vi.fn(handler)
}

// ─── Render Helper ──────────────────────────────────────────────────────────

interface CustomRenderOptions extends RenderOptions {
  initialEntries?: string[]
}

export function renderWithRouter(
  ui: React.ReactElement,
  { initialEntries = ['/'], ...options }: CustomRenderOptions = {}
): ReturnType<typeof rtlRender> {
  return rtlRender(
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>,
    options
  )
}

// ─── Role-Based Test Matrix ─────────────────────────────────────────────────

export const ALL_ROLES: MockUser['role'][] = ['student', 'teacher', 'admin', 'ta', 'observer', 'designer']

export function forEachRole(
  cb: (role: MockUser['role']) => void,
  roles: MockUser['role'][] = ALL_ROLES
) {
  roles.forEach((role) => {
    describe(`role: ${role}`, () => {
      cb(role)
    })
  })
}
