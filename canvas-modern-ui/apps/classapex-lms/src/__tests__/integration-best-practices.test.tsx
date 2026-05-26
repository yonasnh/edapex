/**
 * Integration Tests — Industry Best Practices
 * ============================================
 * These tests verify that multiple units (components, hooks, contexts)
 * work correctly TOGETHER, following the Testing Library philosophy:
 *
 *   "The more your tests resemble the way your software is used,
 *    the more confidence they give."
 *
 * Principles applied:
 *   - Test behavior, not implementation (no state/prop inspection)
 *   - Use userEvent over fireEvent
 *   - Query by role/label/text (how users find elements)
 *   - Mock external APIs only; keep internal logic real
 *   - One assertion per logical concept (Arrange-Act-Assert)
 */

import React, { useState } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom'

// ─── Real contexts (no mocks — integration tests verify they work together) ───
import { RoleProvider, useRole, type UserRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'
import { NotificationProvider } from '../contexts/NotificationContext'
import { PremiumErrorBoundary } from '../components/PremiumErrorBoundary'

// ─── Mock only external dependencies ──────────────────────────────────────────
vi.mock('../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
}))

vi.mock('@schoolapex/core', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn(), accentColor: '#6366f1', setAccentColor: vi.fn() }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  RequireAuth: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  OAuthCallbackPage: () => <div>OAuth</div>,
  useAuth: () => ({ token: 'test-token', isAuthenticated: true }),
}))

vi.mock('../contexts/TenantContext', () => ({
  TenantProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTenant: () => ({ config: { ui: { dashboardLayout: 'cards' } } }),
}))

vi.mock('../contexts/I18nContext', () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useI18n: () => ({ locale: 'en', setLocale: vi.fn(), t: (k: string) => k }),
}))

import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'

// ═══════════════════════════════════════════════════════════════════════════════
// Test Components (mimic real app patterns without importing heavy pages)
// ═══════════════════════════════════════════════════════════════════════════════

/** Component that consumes RoleContext */
function RoleAwareGreeting() {
  const { role, user } = useRole()
  return (
    <div>
      <h1 data-testid="greeting">Hello, {user.displayName}</h1>
      <p data-testid="role-badge">Role: {role}</p>
    </div>
  )
}

/** Component that triggers notifications */
function ActionWithToast() {
  const { showToast } = useNotification()
  return (
    <button onClick={() => showToast({ title: 'Saved!', message: 'Your changes were saved.', type: 'success' })}>
      Save Changes
    </button>
  )
}

/** Component that throws an error when `shouldThrow` is true */
function BombComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('💥 Intentional test explosion')
  }
  return <div data-testid="safe">All clear</div>
}

/** Route-aware component that reads params */
function CourseDetailPage() {
  const { courseId } = useParams()
  const { role } = useRole()
  const navigate = useNavigate()
  const { data: course, isLoading } = useCanvasQuery<{ name: string }>(`/api/v1/courses/${courseId}`)

  if (isLoading) return <div data-testid="loading">Loading course…</div>
  if (!course) return <div data-testid="not-found">Course not found</div>

  return (
    <div>
      <h1 data-testid="course-name">{course.name}</h1>
      <p data-testid="role-context">Viewing as {role}</p>
      <button data-testid="goto-grades" onClick={() => navigate(`/courses/${courseId}/grades`)}>
        View Grades
      </button>
      <Link data-testid="back-link" to="/courses">Back to Courses</Link>
    </div>
  )
}

/** Course list with navigation */
function CourseListPage() {
  const { data: courses, isLoading } = useCanvasQuery<{ id: number; name: string }[]>('/api/v1/courses')
  const navigate = useNavigate()

  if (isLoading) return <div data-testid="loading">Loading courses…</div>

  return (
    <div>
      <h1>Courses</h1>
      <ul>
        {(courses || []).map(c => (
          <li key={c.id}>
            <button data-testid={`course-${c.id}`} onClick={() => navigate(`/courses/${c.id}`)}>
              {c.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Multi-step form with validation and API submission */
function EnrollmentForm() {
  const [email, setEmail] = useState('')
  const [courseId, setCourseId] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useNotification()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.includes('@')) {
      setError('Please enter a valid email')
      return
    }
    if (!courseId) {
      setError('Please select a course')
      return
    }

    setSubmitting(true)
    try {
      await canvasFetch('/api/v1/enrollments', {
        method: 'POST',
        body: { enrollment: { user_id: 'self', course_id: Number(courseId), type: 'StudentEnrollment' } },
      })
      showToast({ title: 'Enrolled!', type: 'success' })
      setEmail('')
      setCourseId('')
    } catch (err: any) {
      setError(err.message || 'Enrollment failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Enrollment form">
      <label>
        Email
        <input
          type="text"
          value={email}
          onChange={e => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-errormessage="form-error"
        />
      </label>
      <label>
        Course
        <select value={courseId} onChange={e => setCourseId(e.target.value)}>
          <option value="">Select…</option>
          <option value="1">Introduction to Testing</option>
          <option value="2">Advanced React Patterns</option>
        </select>
      </label>
      {error && (
        <div id="form-error" role="alert" data-testid="form-error">
          {error}
        </div>
      )}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Enrolling…' : 'Enroll'}
      </button>
    </form>
  )
}

/** Search + Filter + Results integration */
function SearchableCatalog() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  const items = [
    { id: 1, name: 'React Basics', category: 'frontend' },
    { id: 2, name: 'Node.js API Design', category: 'backend' },
    { id: 3, name: 'CSS Grid Mastery', category: 'frontend' },
    { id: 4, name: 'Database Optimization', category: 'backend' },
  ]

  const filtered = items.filter(i => {
    const matchesQuery = i.name.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = category === 'all' || i.category === category
    return matchesQuery && matchesCategory
  })

  return (
    <div>
      <input
        type="search"
        placeholder="Search courses…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        aria-label="Search courses"
      />
      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        aria-label="Filter by category"
      >
        <option value="all">All</option>
        <option value="frontend">Frontend</option>
        <option value="backend">Backend</option>
      </select>
      <ul aria-label="Course results">
        {filtered.map(i => (
          <li key={i.id} data-testid={`result-${i.id}`}>{i.name}</li>
        ))}
      </ul>
      {filtered.length === 0 && <p data-testid="no-results">No courses found</p>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helper: render with ALL real providers (no shortcuts in integration tests)
// ═══════════════════════════════════════════════════════════════════════════════

function renderWithProviders(
  ui: React.ReactElement,
  { initialEntries = ['/'], role = 'student' as UserRole } = {}
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <RoleProvider defaultRole={role}>
        <NotificationProvider>
          {ui}
        </NotificationProvider>
      </RoleProvider>
    </MemoryRouter>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Test Suite
// ═══════════════════════════════════════════════════════════════════════════════

describe('Integration Tests — Industry Best Practices', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. ERROR BOUNDARY INTEGRATION
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Error Boundary Integration', () => {
    it('catches runtime errors and renders fallback UI', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const consoleGroup = vi.spyOn(console, 'group').mockImplementation(() => {})
      const consoleGroupEnd = vi.spyOn(console, 'groupEnd').mockImplementation(() => {})

      render(
        <PremiumErrorBoundary>
          <BombComponent shouldThrow={true} />
        </PremiumErrorBoundary>
      )

      // Error boundary should show fallback, not crash the test
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

      consoleError.mockRestore()
      consoleGroup.mockRestore()
      consoleGroupEnd.mockRestore()
    })

    it('renders children normally when no error occurs', () => {
      render(
        <PremiumErrorBoundary>
          <BombComponent shouldThrow={false} />
        </PremiumErrorBoundary>
      )

      expect(screen.getByTestId('safe')).toHaveTextContent('All clear')
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. CONTEXT PROVIDER INTEGRATION
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Context Provider Integration', () => {
    it('RoleProvider provides correct user data to consuming components', () => {
      renderWithProviders(<RoleAwareGreeting />, { role: 'teacher' })

      expect(screen.getByTestId('greeting')).toHaveTextContent('Hello, Dr. Sarah Chen')
      expect(screen.getByTestId('role-badge')).toHaveTextContent('Role: teacher')
    })

    it('NotificationProvider allows components to trigger toasts', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ActionWithToast />)

      const button = screen.getByRole('button', { name: /save changes/i })
      await user.click(button)

      // Toast should appear in the DOM
      await waitFor(() => {
        expect(screen.getByText('Saved!')).toBeInTheDocument()
      })
    })

    it('all providers work together without conflicts', () => {
      renderWithProviders(
        <>
          <RoleAwareGreeting />
          <ActionWithToast />
        </>,
        { role: 'admin' }
      )

      expect(screen.getByTestId('role-badge')).toHaveTextContent('Role: admin')
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. ROUTER + CONTEXT + API INTEGRATION
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Router + Context + API Integration', () => {
    it('renders course detail from route param with role context', async () => {
      const mockedUseCanvasQuery = useCanvasQuery as unknown as ReturnType<typeof vi.fn>
      mockedUseCanvasQuery.mockReturnValue({
        data: { name: 'Advanced Testing Patterns' },
        isLoading: false,
        isError: false,
      })

      renderWithProviders(
        <Routes>
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        </Routes>,
        { initialEntries: ['/courses/42'], role: 'student' }
      )

      await waitFor(() => {
        expect(screen.getByTestId('course-name')).toHaveTextContent('Advanced Testing Patterns')
      })
      expect(screen.getByTestId('role-context')).toHaveTextContent('Viewing as student')
    })

    it('shows loading state while API fetches', () => {
      const mockedUseCanvasQuery = useCanvasQuery as unknown as ReturnType<typeof vi.fn>
      mockedUseCanvasQuery.mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
      })

      renderWithProviders(
        <Routes>
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        </Routes>,
        { initialEntries: ['/courses/42'] }
      )

      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('navigates between routes and preserves context', async () => {
      const mockedUseCanvasQuery = useCanvasQuery as unknown as ReturnType<typeof vi.fn>
      mockedUseCanvasQuery
        .mockReturnValueOnce({
          data: [{ id: 1, name: 'Intro to Testing' }],
          isLoading: false,
        })
        .mockReturnValueOnce({
          data: { name: 'Intro to Testing' },
          isLoading: false,
        })

      const user = userEvent.setup()

      renderWithProviders(
        <Routes>
          <Route path="/courses" element={<CourseListPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/courses/:courseId/grades" element={<div data-testid="grades-page">Grades Page</div>} />
        </Routes>,
        { initialEntries: ['/courses'], role: 'teacher' }
      )

      // Wait for list to load
      await waitFor(() => {
        expect(screen.getByTestId('course-1')).toBeInTheDocument()
      })

      // Click to navigate to detail
      await user.click(screen.getByTestId('course-1'))

      await waitFor(() => {
        expect(screen.getByTestId('course-name')).toHaveTextContent('Intro to Testing')
      })
      expect(screen.getByTestId('role-context')).toHaveTextContent('Viewing as teacher')

      // Click grades button
      await user.click(screen.getByTestId('goto-grades'))

      await waitFor(() => {
        expect(screen.getByTestId('grades-page')).toBeInTheDocument()
      })
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. FORM + VALIDATION + API INTEGRATION
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Form + Validation + API Integration', () => {
    it('validates email before submission', async () => {
      const user = userEvent.setup()
      renderWithProviders(<EnrollmentForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitBtn = screen.getByRole('button', { name: /enroll/i })

      await user.type(emailInput, 'not-an-email')
      // Ensure React state is flushed before submitting
      await waitFor(() => expect(emailInput).toHaveValue('not-an-email'))
      await user.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByTestId('form-error')).toHaveTextContent('valid email')
      })
      expect(canvasFetch).not.toHaveBeenCalled()
    })

    it('validates course selection before submission', async () => {
      const user = userEvent.setup()
      renderWithProviders(<EnrollmentForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitBtn = screen.getByRole('button', { name: /enroll/i })

      await user.type(emailInput, 'student@example.com')
      await user.click(submitBtn)

      expect(screen.getByTestId('form-error')).toHaveTextContent('select a course')
      expect(canvasFetch).not.toHaveBeenCalled()
    })

    it('submits form with valid data and shows success toast', async () => {
      const mockedFetch = canvasFetch as unknown as ReturnType<typeof vi.fn>
      mockedFetch.mockResolvedValue({ id: 99 })

      const user = userEvent.setup()
      renderWithProviders(<EnrollmentForm />)

      await user.type(screen.getByLabelText(/email/i), 'student@example.com')
      await user.selectOptions(screen.getByLabelText(/course/i), '1')
      await user.click(screen.getByRole('button', { name: /enroll/i }))

      await waitFor(() => {
        expect(mockedFetch).toHaveBeenCalledWith('/api/v1/enrollments', expect.objectContaining({
          method: 'POST',
          body: expect.objectContaining({
            enrollment: expect.objectContaining({ course_id: 1 }),
          }),
        }))
      })

      // Success toast from NotificationProvider
      await waitFor(() => {
        expect(screen.getByText('Enrolled!')).toBeInTheDocument()
      })
    })

    it('shows error message when API fails', async () => {
      const mockedFetch = canvasFetch as unknown as ReturnType<typeof vi.fn>
      mockedFetch.mockRejectedValue(new Error('Course is full'))

      const user = userEvent.setup()
      renderWithProviders(<EnrollmentForm />)

      await user.type(screen.getByLabelText(/email/i), 'student@example.com')
      await user.selectOptions(screen.getByLabelText(/course/i), '1')
      await user.click(screen.getByRole('button', { name: /enroll/i }))

      await waitFor(() => {
        expect(screen.getByTestId('form-error')).toHaveTextContent('Course is full')
      })
    })

    it('disables submit button during submission to prevent double-submit', async () => {
      const mockedFetch = canvasFetch as unknown as ReturnType<typeof vi.fn>
      mockedFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      const user = userEvent.setup()
      renderWithProviders(<EnrollmentForm />)

      await user.type(screen.getByLabelText(/email/i), 'student@example.com')
      await user.selectOptions(screen.getByLabelText(/course/i), '1')
      await user.click(screen.getByRole('button', { name: /enroll/i }))

      expect(screen.getByRole('button', { name: /enrolling/i })).toBeDisabled()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. CROSS-FEATURE INTEGRATION (Search → Filter → Results)
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Cross-Feature Integration: Search + Filter + Results', () => {
    it('filters results by search query', async () => {
      const user = userEvent.setup()
      render(<SearchableCatalog />)

      const searchInput = screen.getByRole('searchbox', { name: /search courses/i })
      await user.type(searchInput, 'React')

      expect(screen.getByTestId('result-1')).toHaveTextContent('React Basics')
      expect(screen.queryByTestId('result-2')).not.toBeInTheDocument()
      expect(screen.queryByTestId('result-4')).not.toBeInTheDocument()
    })

    it('filters results by category dropdown', async () => {
      const user = userEvent.setup()
      render(<SearchableCatalog />)

      const categorySelect = screen.getByRole('combobox', { name: /filter by category/i })
      await user.selectOptions(categorySelect, 'backend')

      expect(screen.queryByTestId('result-1')).not.toBeInTheDocument()
      expect(screen.getByTestId('result-2')).toHaveTextContent('Node.js API Design')
      expect(screen.getByTestId('result-4')).toHaveTextContent('Database Optimization')
    })

    it('combines search and category filters', async () => {
      const user = userEvent.setup()
      render(<SearchableCatalog />)

      await user.type(screen.getByRole('searchbox'), 'API')
      await user.selectOptions(screen.getByRole('combobox', { name: /filter by category/i }), 'frontend')

      // "API" matches nothing in frontend category
      expect(screen.getByTestId('no-results')).toBeInTheDocument()
      expect(screen.queryByTestId('result-2')).not.toBeInTheDocument() // backend match hidden
    })

    it('shows all results when filters are cleared', async () => {
      const user = userEvent.setup()
      render(<SearchableCatalog />)

      await user.type(screen.getByRole('searchbox'), 'React')
      await user.clear(screen.getByRole('searchbox'))

      expect(screen.getByTestId('result-1')).toBeInTheDocument()
      expect(screen.getByTestId('result-2')).toBeInTheDocument()
      expect(screen.getByTestId('result-3')).toBeInTheDocument()
      expect(screen.getByTestId('result-4')).toBeInTheDocument()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. ACCESSIBILITY INTEGRATION
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Accessibility Integration', () => {
    it('form has proper ARIA attributes for screen readers', () => {
      renderWithProviders(<EnrollmentForm />)

      const form = screen.getByRole('form', { name: /enrollment form/i })
      expect(form).toBeInTheDocument()

      const emailInput = within(form).getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('aria-invalid', 'false')
      expect(emailInput).toHaveAttribute('aria-errormessage', 'form-error')
    })

    it('error alert is announced to screen readers', async () => {
      const user = userEvent.setup()
      renderWithProviders(<EnrollmentForm />)

      await user.click(screen.getByRole('button', { name: /enroll/i }))

      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('id', 'form-error')
      expect(alert).toHaveTextContent(/valid email/i)
    })

    it('course results list has accessible label', () => {
      render(<SearchableCatalog />)

      expect(screen.getByRole('list', { name: /course results/i })).toBeInTheDocument()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. ROLE-BASED NAVIGATION INTEGRATION
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Role-Based Navigation Integration', () => {
    function NavWithRoleCheck() {
      const { role } = useRole()
      return (
        <nav aria-label="Main">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/grades">Grades</Link>
          {role === 'teacher' || role === 'admin' ? (
            <Link to="/gradebook">Gradebook</Link>
          ) : null}
          {role === 'admin' ? <Link to="/admin">Admin</Link> : null}
        </nav>
      )
    }

    it('shows all nav items for admin', () => {
      renderWithProviders(<NavWithRoleCheck />, { role: 'admin' })

      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /grades/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /gradebook/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument()
    })

    it('hides admin link for teacher', () => {
      renderWithProviders(<NavWithRoleCheck />, { role: 'teacher' })

      expect(screen.queryByRole('link', { name: /admin/i })).not.toBeInTheDocument()
      expect(screen.getByRole('link', { name: /gradebook/i })).toBeInTheDocument()
    })

    it('hides gradebook and admin for student', () => {
      renderWithProviders(<NavWithRoleCheck />, { role: 'student' })

      expect(screen.queryByRole('link', { name: /gradebook/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /admin/i })).not.toBeInTheDocument()
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    })
  })
})
