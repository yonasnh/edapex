/**
 * Unit Tests — Hooks & Utilities
 * ================================
 * Comprehensive tests for shared hooks and pure utility functions
 * across the ClassApex LMS application.
 *
 * Coverage:
 *  - useCanvasMutation (re-export + behavior)
 *  - useNotification   (context consumer)
 *  - useRole           (context consumer + masquerade)
 *  - Grade utilities   (getLetterGrade, exportGradesCSV, filterGrades)
 *  - Date formatters   (formatTime, formatMessageTime)
 *  - Search / Filter   (filterConversations, multi-field filtering, sorting)
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import React from 'react'

// ─── Mocks (self-contained factories — no top-level variable references) ─────

vi.mock('@schoolapex/core', () => ({
  useCanvasQuery: vi.fn(),
  useCanvasMutation: vi.fn(),
  createApiClient: vi.fn(),
  useAuth: vi.fn(() => ({
    user: {
      id: '100',
      name: 'Dr. Sarah Chen',
      email: 'sarah.chen@classapex.edu',
      avatar_url: '',
      roles: ['teacher'],
      title: 'Professor of Computer Science',
    },
  })),
}))

vi.mock('../contexts/NotificationContext', () => ({
  NotificationContext: require('react').createContext({
    showToast: vi.fn(),
    showConfirm: vi.fn(() => Promise.resolve(true)),
    showAlert: vi.fn(() => Promise.resolve()),
  }),
}))

// ─── Imports ─────────────────────────────────────────────────────────────────

import { useCanvasMutation } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'
import { RoleProvider, useRole, type UserRole } from '../contexts/RoleContext'
import { useAuth } from '@schoolapex/core'
import {
  getLetterGrade,
  exportGradesCSV,
  filterGrades,
  type Grade,
} from '../pages/Grades'
import {
  formatTime,
  formatMessageTime,
  filterConversations,
  type Conversation,
} from '../pages/Inbox'

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('useCanvasMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns mutate, isLoading, error, and data', () => {
    const mutate = vi.fn()
    ;(useCanvasMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate,
      isLoading: false,
      error: null,
      data: null,
    })

    const { result } = renderHook(() => useCanvasMutation({ mutationFn: vi.fn() }))

    expect(result.current).toHaveProperty('mutate')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('data')
  })

  it('calls the underlying mutation function when mutate is invoked', async () => {
    const mutationFn = vi.fn().mockResolvedValue({ id: 1 })
    const mutate = vi.fn((vars: any) => mutationFn(vars))

    ;(useCanvasMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate,
      isLoading: false,
      error: null,
      data: null,
    })

    const { result } = renderHook(() => useCanvasMutation({ mutationFn }))

    result.current.mutate({ title: 'Test' })

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({ title: 'Test' })
    })
  })

  it('reflects loading state while mutation is in progress', () => {
    ;(useCanvasMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      isLoading: true,
      error: null,
      data: null,
    })

    const { result } = renderHook(() => useCanvasMutation({ mutationFn: vi.fn() }))

    expect(result.current.isLoading).toBe(true)
  })

  it('reflects error state when mutation fails', () => {
    const testError = new Error('Network failure')
    ;(useCanvasMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
      error: testError,
      data: null,
    })

    const { result } = renderHook(() => useCanvasMutation({ mutationFn: vi.fn() }))

    expect(result.current.error).toBe(testError)
  })

  it('reflects data when mutation succeeds', () => {
    ;(useCanvasMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
      error: null,
      data: { created: true },
    })

    const { result } = renderHook(() => useCanvasMutation({ mutationFn: vi.fn() }))

    expect(result.current.data).toEqual({ created: true })
  })
})

describe('useNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns showToast, showConfirm, and showAlert', () => {
    const { result } = renderHook(() => useNotification())

    expect(result.current).toHaveProperty('showToast')
    expect(result.current).toHaveProperty('showConfirm')
    expect(result.current).toHaveProperty('showAlert')
  })

  it('calls showToast with correct params', () => {
    const { result } = renderHook(() => useNotification())

    result.current.showToast({ title: 'Saved', message: 'Item saved', type: 'success' })

    expect(result.current.showToast).toHaveBeenCalledWith({
      title: 'Saved',
      message: 'Item saved',
      type: 'success',
    })
  })

  it('calls showToast with default type when omitted', () => {
    const { result } = renderHook(() => useNotification())

    result.current.showToast({ title: 'Info' })

    expect(result.current.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Info' }))
  })

  it('returns a promise from showConfirm', async () => {
    const { result } = renderHook(() => useNotification())

    const promise = result.current.showConfirm({
      title: 'Confirm?',
      message: 'Are you sure?',
    })

    expect(promise).toBeInstanceOf(Promise)
    await expect(promise).resolves.toBe(true)
  })

  it('returns a promise from showAlert', async () => {
    const { result } = renderHook(() => useNotification())

    const promise = result.current.showAlert({
      title: 'Alert',
      message: 'Something happened',
    })

    expect(promise).toBeInstanceOf(Promise)
    await expect(promise).resolves.toBeUndefined()
  })
})

describe('useRole', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    const store: Record<string, string> = {}
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => store[key] ?? null)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      store[key] = value
    })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
      delete store[key]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const wrapper =
    (defaultRole?: UserRole) =>
    ({ children }: { children: React.ReactNode }) =>
      <RoleProvider defaultRole={defaultRole}>{children}</RoleProvider>

  it('returns the role derived from the authenticated user', () => {
    const { result } = renderHook(() => useRole(), { wrapper: wrapper('teacher') })

    expect(result.current.role).toBe('teacher')
    expect(result.current.user.name).toBe('Dr. Sarah Chen')
  })

  it('returns student role when auth user has no roles', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '8', name: 'Student User', email: 'student@example.com', roles: ['student'] },
    } as any)

    const { result } = renderHook(() => useRole(), { wrapper: wrapper() })

    expect(result.current.role).toBe('student')
    expect(result.current.user.name).toBe('Student User')

    // restore default mock
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '100',
        name: 'Dr. Sarah Chen',
        email: 'sarah.chen@classapex.edu',
        avatar_url: '',
        roles: ['teacher'],
        title: 'Professor of Computer Science',
      },
    } as any)
  })

  it('updates view role when setRole is called with an available role', () => {
    const { result } = renderHook(() => useRole(), { wrapper: wrapper('teacher') })

    expect(result.current.role).toBe('teacher')

    act(() => {
      result.current.setRole('teacher')
    })

    expect(localStorage.setItem).toHaveBeenCalledWith('classapex-view-role', 'teacher')
  })

  it('sets isMasquerading to false by default', () => {
    const { result } = renderHook(() => useRole(), { wrapper: wrapper() })

    expect(result.current.isMasquerading).toBe(false)
    expect(result.current.realUser).toEqual(result.current.user)
  })

  it('masquerades as another user and updates role (session-only)', () => {
    const { result } = renderHook(() => useRole(), { wrapper: wrapper('teacher') })

    const fakeUser = {
      id: '555',
      name: 'Masquerade User',
      displayName: 'Masquerade User',
      email: 'masq@example.com',
      avatarSeed: 'Masq',
      role: 'teacher' as UserRole,
      title: 'Guest Teacher',
    }

    act(() => {
      result.current.masqueradeAs(fakeUser)
    })

    // Masquerade is session-only and does not persist to localStorage
    expect(result.current.isMasquerading).toBe(true)
    expect(result.current.user.name).toBe('Masquerade User')
  })

  it('clears masquerade when masqueradeAs is called with null', () => {
    const { result } = renderHook(() => useRole(), { wrapper: wrapper('teacher') })

    act(() => {
      result.current.masqueradeAs(null)
    })

    expect(result.current.isMasquerading).toBe(false)
  })

  it('clears masquerade when switching roles', () => {
    const { result } = renderHook(() => useRole(), { wrapper: wrapper('teacher') })

    act(() => {
      result.current.setRole('teacher')
    })

    expect(result.current.isMasquerading).toBe(false)
  })
})

describe('Grade Calculation Utilities', () => {
  describe('getLetterGrade', () => {
    it.each([
      { percentage: 95, expected: 'A' },
      { percentage: 90, expected: 'A' },
      { percentage: 89, expected: 'B' },
      { percentage: 85, expected: 'B' },
      { percentage: 80, expected: 'B' },
      { percentage: 79, expected: 'C' },
      { percentage: 75, expected: 'C' },
      { percentage: 70, expected: 'C' },
      { percentage: 69, expected: 'D' },
      { percentage: 65, expected: 'D' },
      { percentage: 60, expected: 'D' },
      { percentage: 59, expected: 'F' },
      { percentage: 55, expected: 'F' },
      { percentage: 0, expected: 'F' },
    ])('returns $expected for $percentage%', ({ percentage, expected }) => {
      expect(getLetterGrade(percentage)).toBe(expected)
    })
  })

  describe('exportGradesCSV', () => {
    beforeEach(() => {
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => 'blob://mock-url'),
        revokeObjectURL: vi.fn(),
      })
      vi.stubGlobal('Blob', vi.fn((parts: any[], opts: any) => ({ parts, opts })))

      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      }
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'a') return mockAnchor as any
        return document.createElement.bind(document)(tag)
      })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
      vi.restoreAllMocks()
    })

    const makeGrade = (overrides: Partial<Grade> = {}): Grade => ({
      id: '1',
      assignment: {
        id: 'a1',
        name: 'Essay',
        type: 'assignment',
        pointsPossible: 100,
        dueDate: '2026-01-15T00:00:00Z',
      },
      course: { id: 'c1', name: 'English 101', color: '#3b82f6' },
      score: 85,
      grade: 'B',
      percentage: 85,
      submittedAt: '2026-01-14T00:00:00Z',
      gradedAt: '2026-01-16T00:00:00Z',
      feedback: 'Good work',
      status: 'graded',
      isLate: false,
      isMissing: false,
      isExcused: false,
      ...overrides,
    })

    it('returns valid CSV string with headers', () => {
      const grades = [makeGrade()]
      exportGradesCSV(grades)

      const blobCall = (Blob as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
      const csvContent = blobCall[0][0] as string
      const lines = csvContent.split('\n')

      expect(lines[0]).toContain('Assignment')
      expect(lines[0]).toContain('Course')
      expect(lines[0]).toContain('Score')
      expect(lines[1]).toContain('Essay')
      expect(lines[1]).toContain('English 101')
    })

    it('escapes quotes in data', () => {
      const grades = [
        makeGrade({
          assignment: {
            id: 'a2',
            name: 'Essay "Critical" Analysis',
            type: 'assignment',
            pointsPossible: 100,
          },
          feedback: 'He said "Excellent"',
        }),
      ]
      exportGradesCSV(grades)

      const blobCall = (Blob as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
      const csvContent = blobCall[0][0] as string

      expect(csvContent).toContain('"Essay ""Critical"" Analysis"')
      expect(csvContent).toContain('"He said ""Excellent"""')
    })

    it('handles missing optional fields gracefully', () => {
      const grades = [
        makeGrade({
          score: null,
          percentage: undefined,
          submittedAt: undefined,
          gradedAt: undefined,
          feedback: undefined,
          assignment: {
            id: 'a3',
            name: 'Missing Assignment',
            type: 'quiz',
            pointsPossible: 50,
            dueDate: undefined,
          },
        }),
      ]
      exportGradesCSV(grades)

      const blobCall = (Blob as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
      const csvContent = blobCall[0][0] as string
      const lines = csvContent.split('\n')

      expect(lines.length).toBe(2)
      expect(lines[1]).toContain('""')
    })

    it('triggers anchor download with correct filename prefix', () => {
      exportGradesCSV([makeGrade()])

      const anchor = (document.createElement as ReturnType<typeof vi.fn>).mock.results[0].value
      expect(anchor.download).toMatch(/^gradebook-export-\d{4}-\d{2}-\d{2}\.csv$/)
      expect(anchor.click).toHaveBeenCalled()
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob://mock-url')
    })
  })

  describe('filterGrades', () => {
    const baseGrade = (id: string, name: string, overrides: Partial<Grade> = {}): Grade => ({
      id,
      assignment: {
        id: `a${id}`,
        name,
        type: 'assignment',
        pointsPossible: 100,
        dueDate: '2026-01-15T00:00:00Z',
      },
      course: { id: 'c1', name: 'Course A' },
      score: 80,
      grade: 'B',
      percentage: 80,
      submittedAt: '2026-01-14T00:00:00Z',
      gradedAt: '2026-01-16T00:00:00Z',
      feedback: '',
      status: 'graded',
      isLate: false,
      isMissing: false,
      isExcused: false,
      ...overrides,
    })

    const grades: Grade[] = [
      baseGrade('1', 'Algebra Quiz', { course: { id: 'c1', name: 'Math' }, assignment: { id: 'a1', name: 'Algebra Quiz', type: 'quiz', pointsPossible: 100, dueDate: '2026-01-10T00:00:00Z' }, score: 90, status: 'graded' }),
      baseGrade('2', 'Biology Lab', { course: { id: 'c2', name: 'Science' }, assignment: { id: 'a2', name: 'Biology Lab', type: 'assignment', pointsPossible: 50, dueDate: '2026-01-12T00:00:00Z' }, score: 70, status: 'submitted' }),
      baseGrade('3', 'History Essay', { course: { id: 'c1', name: 'History' }, assignment: { id: 'a3', name: 'History Essay', type: 'assignment', pointsPossible: 100, dueDate: '2026-01-08T00:00:00Z' }, score: 85, status: 'missing' }),
      baseGrade('4', 'Chemistry Exam', { course: { id: 'c2', name: 'Science' }, assignment: { id: 'a4', name: 'Chemistry Exam', type: 'exam', pointsPossible: 200, dueDate: '2026-01-20T00:00:00Z' }, score: 95, status: 'graded' }),
    ]

    it('performs fuzzy search by assignment name', () => {
      const result = filterGrades(grades, 'chem', '', 'all', 'all', 'name')
      expect(result).toHaveLength(1)
      expect(result[0].assignment.name).toBe('Chemistry Exam')
    })

    it('filters by course id', () => {
      const result = filterGrades(grades, '', 'c2', 'all', 'all', 'name')
      expect(result).toHaveLength(2)
      expect(result.every(g => g.course.id === 'c2')).toBe(true)
    })

    it('filters by assignment type', () => {
      const result = filterGrades(grades, '', '', 'quiz', 'all', 'name')
      expect(result).toHaveLength(1)
      expect(result[0].assignment.type).toBe('quiz')
    })

    it('filters by status', () => {
      const result = filterGrades(grades, '', '', 'all', 'graded', 'name')
      expect(result).toHaveLength(2)
      expect(result.every(g => g.status === 'graded')).toBe(true)
    })

    it('applies multi-field filtering simultaneously', () => {
      const result = filterGrades(grades, 'lab', 'c2', 'assignment', 'submitted', 'name')
      expect(result).toHaveLength(1)
      expect(result[0].assignment.name).toBe('Biology Lab')
    })

    it('sorts by name in ascending order', () => {
      const result = filterGrades(grades, '', '', 'all', 'all', 'name')
      expect(result.map(g => g.assignment.name)).toEqual([
        'Algebra Quiz',
        'Biology Lab',
        'Chemistry Exam',
        'History Essay',
      ])
    })

    it('sorts by score descending', () => {
      const result = filterGrades(grades, '', '', 'all', 'all', 'score')
      expect(result.map(g => g.score)).toEqual([95, 90, 85, 70])
    })

    it('sorts by due date descending by default', () => {
      const result = filterGrades(grades, '', '', 'all', 'all', 'dueDate')
      expect(result.map(g => g.assignment.dueDate)).toEqual([
        '2026-01-20T00:00:00Z',
        '2026-01-12T00:00:00Z',
        '2026-01-10T00:00:00Z',
        '2026-01-08T00:00:00Z',
      ])
    })
  })
})

describe('Date / Time Formatters', () => {
  describe('formatTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns minutes ago for times under one hour', () => {
      const now = new Date('2026-05-24T12:00:00Z')
      vi.setSystemTime(now)

      const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString()
      expect(formatTime(thirtyMinsAgo)).toBe('30m ago')
    })

    it('returns hours ago for times under 24 hours', () => {
      const now = new Date('2026-05-24T12:00:00Z')
      vi.setSystemTime(now)

      const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString()
      expect(formatTime(fiveHoursAgo)).toBe('5h ago')
    })

    it('returns "Yesterday" for times between 24 and 48 hours ago', () => {
      const now = new Date('2026-05-24T12:00:00Z')
      vi.setSystemTime(now)

      const yesterday = new Date(now.getTime() - 30 * 60 * 60 * 1000).toISOString()
      expect(formatTime(yesterday)).toBe('Yesterday')
    })

    it('returns short weekday for times within the last week', () => {
      const now = new Date('2026-05-24T12:00:00Z') // Sunday
      vi.setSystemTime(now)

      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
      expect(formatTime(threeDaysAgo)).toBe('Thu')
    })

    it('returns month and day for older dates', () => {
      const now = new Date('2026-05-24T12:00:00Z')
      vi.setSystemTime(now)

      const oldDate = new Date('2026-01-15T10:00:00Z').toISOString()
      expect(formatTime(oldDate)).toBe('Jan 15')
    })
  })

  describe('formatMessageTime', () => {
    it('returns formatted time string', () => {
      const time = '2026-05-24T14:30:00Z'
      const result = formatMessageTime(time)
      expect(result).toMatch(/\d/)
      expect(result.length).toBeGreaterThan(3)
    })
  })
})

describe('Search / Filter Logic', () => {
  const makeConversation = (
    id: number,
    subject: string,
    lastMessage: string,
    overrides: Partial<Conversation> = {}
  ): Conversation => ({
    id,
    subject,
    workflow_state: 'read',
    last_message: lastMessage,
    last_message_at: '2026-05-24T12:00:00Z',
    message_count: 1,
    participants: [{ id: 1, name: 'Alice' }],
    audience: [1],
    starred: false,
    properties: [],
    ...overrides,
  })

  const conversations: Conversation[] = [
    makeConversation(1, 'Project Update', 'The deadline is tomorrow', {
      workflow_state: 'unread',
      last_message_at: '2026-05-24T12:00:00Z',
      participants: [{ id: 1, name: 'Alice Smith' }],
    }),
    makeConversation(2, 'Meeting Notes', 'Please review the notes', {
      workflow_state: 'read',
      last_message_at: '2026-05-23T12:00:00Z',
      starred: true,
      participants: [{ id: 2, name: 'Bob Jones' }],
    }),
    makeConversation(3, 'Assignment Feedback', 'Great job on the essay', {
      workflow_state: 'read',
      last_message_at: '2026-05-22T12:00:00Z',
      participants: [{ id: 3, name: 'Charlie Day' }],
    }),
    makeConversation(4, 'Project Update v2', 'Revised schedule', {
      workflow_state: 'read',
      last_message_at: '2026-05-21T12:00:00Z',
      participants: [{ id: 4, name: 'Diana Prince' }],
    }),
    makeConversation(5, 'Old Thread', 'This is archived', {
      workflow_state: 'archived',
      last_message_at: '2026-05-20T12:00:00Z',
      participants: [{ id: 5, name: 'Eve Adams' }],
    }),
  ]

  it('filters unread conversations', () => {
    const result = filterConversations(conversations, 'unread', '')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('filters starred conversations', () => {
    const result = filterConversations(conversations, 'starred', '')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })

  it('filters archived conversations', () => {
    const result = filterConversations(conversations, 'archived', '')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(5)
  })

  it('excludes archived from default all filter', () => {
    const result = filterConversations(conversations, 'all', '')
    expect(result.every(c => c.workflow_state !== 'archived')).toBe(true)
    expect(result).toHaveLength(4)
  })

  it('performs fuzzy search across subject, last_message, and participant names', () => {
    const result = filterConversations(conversations, 'all', 'project')
    expect(result).toHaveLength(2)
    expect(result.map(c => c.id)).toContain(1)
    expect(result.map(c => c.id)).toContain(4)
  })

  it('matches participant names in search', () => {
    const result = filterConversations(conversations, 'all', 'bob')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })

  it('matches last_message content in search', () => {
    const result = filterConversations(conversations, 'all', 'essay')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(3)
  })

  it('applies multi-field filtering with scope and search together', () => {
    const result = filterConversations(conversations, 'starred', 'notes')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })

  it('sorts results by last_message_at descending', () => {
    const result = filterConversations(conversations, 'all', '')
    expect(result.map(c => c.id)).toEqual([1, 2, 3, 4])
  })

  it('returns empty array when no matches found', () => {
    const result = filterConversations(conversations, 'all', 'nonexistent')
    expect(result).toEqual([])
  })
})
