# ClassApex Integration Testing Guide

> **Stack:** React 18, TypeScript, Vitest 1.2.0, React Testing Library, jsdom  
> **Location:** `canvas-modern-ui/apps/classapex-lms/src/__tests__/integration/`  
> **Test Runner:** `node node_modules/vitest/vitest.mjs run`

---

## Table of Contents

1. [Introduction to Integration Testing](#introduction-to-integration-testing)
2. [Testing Philosophy & Best Practices](#testing-philosophy--best-practices)
3. [Integration Test Categories for ClassApex](#integration-test-categories-for-classapex)
4. [Test File Organization](#test-file-organization)
5. [Mocking Strategy](#mocking-strategy)
6. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
7. [Example Test Patterns](#example-test-patterns)
8. [Running Integration Tests](#running-integration-tests)
9. [Quality Gates](#quality-gates)

---

## Introduction to Integration Testing

Integration tests verify that **multiple units work together correctly**. They sit between unit tests and E2E tests on the testing pyramid:

| Test Type | Scope | Speed | Confidence | Cost |
|-----------|-------|-------|------------|------|
| **Unit** | Function / hook in isolation | Fast | Low | Low |
| **Integration** | Components + hooks + contexts + router | Medium | High | Medium |
| **E2E** | Full browser + real API | Slow | Very High | High |

For ClassApex (a React SPA), integration tests are the **sweet spot**. They catch bugs in data flow, routing, context composition, and API integration—without the fragility of full E2E suites.

### Why Integration Tests Matter for React SPAs

- **Context wiring:** `RoleContext` + `NotificationContext` + `ThemeContext` + `TenantContext` + `I18nContext` must compose without runtime errors.
- **Router ↔ Component coupling:** Route params, lazy-loaded routes, and redirects are only exercisable when rendered together.
- **Data synchronization:** `useCanvasQuery` caching, refetching, and mutation invalidation affect UI state across component trees.
- **Form lifecycles:** Validation, submission, error display, and success redirects span hooks, components, and API layers.

---

## Testing Philosophy & Best Practices

Follow the principles of [Kent C. Dodds](https://kentcdodds.com/) and the [Testing Library](https://testing-library.com/docs/guiding-principles) ecosystem:

### The Golden Rules

1. **Test behavior, not implementation.** Ask: *"Can a user accomplish the task?"* Not: *"Did `useState` update?"*
2. **The more your tests resemble the way your software is used, the more confidence they give.** Query by text, label, role, and placeholder—exactly how users interact with the DOM.
3. **Avoid testing implementation details.** Never assert on internal state, prop names, or private methods. Refactoring should not break tests.

### Practical Guidelines

| Guideline | Do | Don't |
|-----------|----|-------|
| Events | `userEvent.click(screen.getByRole('button'))` | `fireEvent.click(element)` |
| Queries | `getByRole`, `getByLabelText`, `getByPlaceholderText` | `getByTestId` (unless no alternative) |
| Async (singular) | `findByRole` | `waitFor(() => expect(...))` |
| Async (plural) | `findAllByText` | `setTimeout` in tests |
| Async state changes | `waitFor(() => expect(mockFn).toHaveBeenCalled())` | `waitFor` around every render |
| Cleanup | Rely on `cleanup` in `setupTests.ts` | Manual unmount in every test |

### Key Takeaways

- Use **`userEvent`** over `fireEvent`—it simulates full user interactions (focus, keyboard, pointer).
- Use **`screen`** queries that reflect how users find elements.
- Prefer **`findBy`** for async appearance, **`getBy`** for synchronous presence.
- Use **`waitFor` sparingly**—only for actual async state changes (mocked API callbacks, timers).
- Clean up properly between tests via `afterEach(cleanup)` in `setupTests.ts`.

---

## Integration Test Categories for ClassApex

### 1. Provider Integration
Verify that `RoleContext`, `NotificationContext`, `ThemeContext`, `TenantContext`, and `I18nContext` compose correctly. Test that a component consuming all five renders without throwing and responds to context updates.

### 2. Router Integration
Exercise `MemoryRouter` in tests to validate route params, navigation, redirects, query params, and `React.lazy` + `Suspense` fallback UI.

### 3. API Integration
Test `useCanvasQuery` + `canvasFetch` working together: loading states, success paths, error paths, caching, mutation invalidation, and manual `refetch`.

### 4. Form Integration
Cover multi-step forms (assignment creation, course settings): validation, cross-field checks, submit payload, network errors, and success redirects via `useNavigate`.

### 5. Component Tree Integration
Verify props/callbacks flow correctly, URL query params synchronize siblings, and list + detail views update on selection change.

### 6. Error Boundary Integration
Confirm runtime errors are caught, fallback UI renders with a friendly message and "Reload" action, and recovery re-mounts children cleanly.

### 7. Cross-Feature Integration
Test interacting features: search + filter + sort preserves state; pagination + sorting yields correct API params (`page=2&sort=name`).

---

## Test File Organization

### Naming & Location

```
src/
└── __tests__/
    ├── integration/
    │   ├── integration-router-context.test.tsx
    │   ├── integration-form-api.test.tsx
    │   ├── integration-error-boundary.test.tsx
    │   └── integration-search-filter.test.tsx
    ├── unit-hooks-utilities.test.tsx
    └── test-utils.tsx
```

- **Naming:** `integration-{scope}.test.tsx`
- **Location:** `src/__tests__/integration/`
- **One describe block per integration scenario**
- **Pattern:** Arrange → Act → Assert
- **Shared setup** in `beforeEach`

### Example Structure

```tsx
describe('Dashboard renders with role-based data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDashboardData()
  })

  it('shows admin stats when user is admin', async () => {
    // Arrange
    renderWithProviders(<DashboardV2 />, { role: 'admin' })
    // Act
    const heading = await screen.findByRole('heading', { name: /admin dashboard/i })
    // Assert
    expect(heading).toBeInTheDocument()
    expect(screen.getByText(/12 courses/i)).toBeInTheDocument()
  })
})
```

---

## Mocking Strategy

### What to Mock

| Mock | Reason | How |
|------|--------|-----|
| `canvasFetch` / `fetch` | External API is outside test scope | `vi.fn()` or MSW handlers |
| Browser APIs (`matchMedia`, `IntersectionObserver`, `ResizeObserver`, `clipboard`) | Missing in jsdom | `vi.fn()` in `setupTests.ts` |
| `localStorage` / `sessionStorage` | Side effects leak across tests | `vi.spyOn(Storage.prototype, 'getItem')` |

### What NOT to Mock

- **Internal hooks** (`useRole`, `useCanvasQuery`) in integration tests. Mocking them turns the test into a unit test and destroys confidence.
- **React Router**—use `MemoryRouter` instead.
- **Child components**—render the real tree.

### MSW Pattern (Preferred for API Mocking)

Although ClassApex currently uses direct `vi.mock`, the MSW pattern is the industry standard for scalable API mocking:

```ts
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const server = setupServer(
  http.get('/api/v1/courses', () => {
    return HttpResponse.json([{ id: 1, name: 'Math 101' }])
  })
)

// In test file:
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Keep Mocks Minimal

> Only mock what you cannot control.

If a utility is pure and deterministic, use the real implementation. If it hits the network or the file system, mock it.

---

## Anti-Patterns to Avoid

| Anti-Pattern | Why It Hurts | Fix |
|--------------|--------------|-----|
| Testing component internals (`state`, `refs`) | Breaks on every refactor | Query the DOM |
| Snapshot testing for dynamic content | Creates noise; hides real bugs | Assert on specific text/roles |
| Testing third-party libraries | Their maintainers already do | Trust the dependency; test your glue code |
| Mocking everything | Becomes a unit test with no confidence | Mock only boundaries (API, browser) |
| Tests that pass when the app is broken | False confidence | Write assertions from the user's perspective |
| Tests that fail when implementation changes but behavior doesn't | High maintenance cost | Avoid implementation details |
| `waitFor` wrapping every assertion | Slow, flaky tests | Use `findBy` for DOM; `waitFor` for side effects only |

---

## Example Test Patterns

### Example 1: Router + Context Integration

```tsx
// src/__tests__/integration/integration-router-context.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RoleProvider } from '../../contexts/RoleContext'
import { NotificationProvider } from '../../contexts/NotificationContext'
import CourseDetail from '../../pages/CourseDetail'
import CourseList from '../../pages/CourseList'

function renderWithProviders(ui: React.ReactElement, { initialEntries = ['/'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <RoleProvider defaultRole="teacher">
        <NotificationProvider>{ui}</NotificationProvider>
      </RoleProvider>
    </MemoryRouter>
  )
}

vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn((endpoint: string) => {
    if (endpoint.includes('/courses/1')) {
      return { data: { id: 1, name: 'Math 101' }, isLoading: false, isError: false, refetch: vi.fn() }
    }
    return { data: [], isLoading: false, isError: false, refetch: vi.fn() }
  }),
}))

describe('Router + Context integration', () => {
  it('navigates from course list to detail and preserves role context', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
      </Routes>
    )
    await userEvent.click(screen.getByRole('link', { name: /math 101/i }))
    expect(await screen.findByRole('heading', { name: /math 101/i })).toBeInTheDocument()
  })
})
```

### Example 2: Form Submission with API Mocking

```tsx
// src/__tests__/integration/integration-form-api.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CreateAssignment from '../../pages/CreateAssignment'
import * as useCanvasQueryModule from '../../hooks/useCanvasQuery'

describe('Form submission with API mocking', () => {
  const mockPost = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useCanvasQueryModule, 'canvasFetch').mockImplementation(mockPost)
  })

  it('creates an assignment and shows success notification', async () => {
    mockPost.mockResolvedValueOnce({ id: 42, name: 'New Essay' })
    render(<MemoryRouter><CreateAssignment /></MemoryRouter>)
    await userEvent.type(screen.getByLabelText(/assignment name/i), 'New Essay')
    await userEvent.type(screen.getByLabelText(/points possible/i), '100')
    await userEvent.click(screen.getByRole('button', { name: /create assignment/i }))
    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith('/api/v1/courses/:courseId/assignments', expect.any(Object))
    )
    expect(await screen.findByText(/assignment created/i)).toBeInTheDocument()
  })
})
```

### Example 3: Error Boundary Catching Async Error

```tsx
// src/__tests__/integration/integration-error-boundary.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorBoundary from '../../components/ErrorBoundary'
import BuggyComponent from '../../pages/BuggyComponent'

vi.spyOn(console, 'error').mockImplementation(() => {})

describe('Error Boundary integration', () => {
  it('catches runtime error and renders fallback UI', async () => {
    render(<ErrorBoundary><BuggyComponent shouldThrow={true} /></ErrorBoundary>)
    expect(await screen.findByRole('heading', { name: /something went wrong/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('recovers when user clicks retry', async () => {
    const { rerender } = render(<ErrorBoundary><BuggyComponent shouldThrow={true} /></ErrorBoundary>)
    await userEvent.click(await screen.findByRole('button', { name: /try again/i }))
    rerender(<ErrorBoundary><BuggyComponent shouldThrow={false} /></ErrorBoundary>)
    expect(screen.getByText(/content loaded/i)).toBeInTheDocument()
  })
})
```

### Example 4: Multi-Component Data Flow (Search → Filter → Results)

```tsx
// src/__tests__/integration/integration-search-filter.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CourseDirectory from '../../pages/CourseDirectory'

const mockUseCanvasQuery = vi.fn()
vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: (...args: any[]) => mockUseCanvasQuery(...args),
}))

describe('Search + Filter + Results integration', () => {
  it('applies search and sort together', async () => {
    mockUseCanvasQuery.mockReturnValue({
      data: [{ id: 1, name: 'Advanced Math' }, { id: 2, name: 'Basic History' }],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    render(<CourseDirectory />)
    await userEvent.type(screen.getByPlaceholderText(/search courses/i), 'math')
    await userEvent.selectOptions(screen.getByLabelText(/sort by/i), 'name')
    expect(await screen.findAllByRole('row')).toHaveLength(3) // header + 2 rows
    expect(screen.getByText(/advanced math/i)).toBeInTheDocument()
  })
})
```

---

## Running Integration Tests

```bash
# Run all integration tests
node node_modules/vitest/vitest.mjs run src/__tests__/integration/

# Run with coverage (generates text/json/html/lcov in ./coverage/)
node node_modules/vitest/vitest.mjs run --coverage
# Or via package script:
pnpm test:coverage

# Run with UI for debugging
node node_modules/vitest/vitest.mjs --ui

# Watch mode during development
node node_modules/vitest/vitest.mjs --watch

# Run a specific integration file
node node_modules/vitest/vitest.mjs run src/__tests__/integration/integration-form-api.test.tsx
```

---

## Quality Gates

| Gate | Requirement | Enforcement |
|------|-------------|-------------|
| **Pass Rate** | 100% of integration tests must pass before merge | CI pipeline (`Jenkinsfile.js`) |
| **Console Noise** | No `console.error` / `console.warn` during test runs | Custom Vitest reporter; exceptions allowed for error-state tests wrapped in `expect(console.error).toHaveBeenCalled()` |
| **Coverage** | Integration paths ≥ 80% branch coverage *(current baseline: 67% branches, 48% lines)* | `pnpm test:coverage` gate |
| **Flakiness** | Zero flaky tests tolerated | Rerun 5× in CI; if any fail, ticket must be created to fix or remove within 48 hours |
| **Speed** | Integration suite completes in < 120 seconds | `pool: 'forks'` with `maxForks: 2` configured in `vitest.config.ts` |

### Flaky Test Policy

1. Identify the flaky test via CI logs.
2. Attempt to fix root cause (race condition, missing `await`, imprecise selector).
3. If not fixed within 48 hours, **quarantine** the test in a separate `__tests__/quarantine/` directory.
4. Create a JIRA ticket linking the quarantined test and assign to the feature owner.

---

## Quick Reference

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// Render with router
render(<MemoryRouter initialEntries={['/courses/1']}><App /></MemoryRouter>)

// Preferred queries (in order)
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)
screen.getByPlaceholderText(/search/i)
screen.getByText(/loading/i)
screen.getByTestId('fallback') // last resort

// Async patterns
await screen.findByRole('heading')   // element appears
await screen.findByText(/saved/i)    // text appears
await waitFor(() => expect(mockFn).toHaveBeenCalled()) // side effect
```

---

*Last updated: 2026-05-24*  
*Maintainers: ClassApex Frontend Team*
