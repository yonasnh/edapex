# Canvas Modern UI - Code Guidelines

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [Canvas-Specific Patterns](#canvas-specific-patterns)
4. [Design System Migration](#design-system-migration)
5. [TypeScript Guidelines](#typescript-guidelines)
6. [React Component Guidelines](#react-component-guidelines)
7. [State Management](#state-management)
8. [Styling Guidelines](#styling-guidelines)
9. [Testing Standards](#testing-standards)
10. [Performance Guidelines](#performance-guidelines)
11. [Accessibility Standards](#accessibility-standards)
12. [Code Organization](#code-organization)

---

## Overview

This document establishes coding standards and best practices for Canvas Modern UI (CMUI) development. These guidelines ensure consistency, maintainability, and high-quality code across the entire project.

### Core Principles

- **Component-Driven Development**: Build reusable, composable components
- **Model-Driven Architecture**: Use TypeScript interfaces and schemas for data modeling
- **Mobile-First**: Design and develop for mobile devices first
- **Accessibility-First**: Build inclusive experiences from the ground up
- **Performance-Conscious**: Optimize for speed and efficiency
- **Test-Driven**: Write tests alongside development

---

## Architecture Principles

### 1. Layered Architecture

```
┌─────────────────────────────────────┐
│           Presentation Layer        │  ← React Components
├─────────────────────────────────────┤
│           Business Logic Layer      │  ← Hooks & Services
├─────────────────────────────────────┤
│           Data Access Layer         │  ← API Clients & State
├─────────────────────────────────────┤
│           Infrastructure Layer      │  ← Utilities & Config
└─────────────────────────────────────┘
```

### 2. Dependency Injection

```typescript
// ✅ Good: Use dependency injection for testability
interface ApiClient {
  getCourses(): Promise<Course[]>
}

const useCourses = (apiClient: ApiClient) => {
  return useQuery(['courses'], () => apiClient.getCourses())
}

// ❌ Bad: Direct dependency on concrete implementation
const useCourses = () => {
  return useQuery(['courses'], () => canvasApi.getCourses())
}
```

### 3. Separation of Concerns

```typescript
// ✅ Good: Separate data fetching, business logic, and presentation
const CourseList: React.FC = () => {
  const { courses, isLoading, error } = useCourses()
  const { filteredCourses } = useCourseFiltering(courses)

  if (isLoading) return <CourseListSkeleton />
  if (error) return <ErrorMessage error={error} />

  return <CourseGrid courses={filteredCourses} />
}

// ❌ Bad: Mixed concerns in single component
const CourseList: React.FC = () => {
  const [courses, setCourses] = useState([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetch('/api/courses').then(/* ... */)
  }, [])

  // Filtering logic mixed with component
  const filtered = courses.filter(/* ... */)

  return (
    <div>
      <input onChange={(e) => setFilter(e.target.value)} />
      {/* Rendering logic */}
    </div>
  )
}
```

---

## Canvas-Specific Patterns

### 1. Educational Data Models

```typescript
// ✅ Good: Comprehensive Canvas domain models
import { z } from 'zod'

// Core educational entities
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  avatar_url: z.string().url().optional(),
  roles: z.array(z.enum(['student', 'teacher', 'ta', 'observer', 'admin'])),
  pronouns: z.string().optional(),
  locale: z.string().default('en'),
  timezone: z.string().default('UTC')
})

const CourseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  course_code: z.string().regex(/^[A-Z]{2,4}\d{3,4}$/),
  sis_course_id: z.string().optional(),
  term: TermSchema,
  workflow_state: z.enum(['unpublished', 'available', 'completed', 'deleted']),
  enrollments: z.array(EnrollmentSchema),
  settings: CourseSettingsSchema,
  permissions: CoursePermissionsSchema,
  created_at: z.date(),
  updated_at: z.date()
})

const AssignmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  due_at: z.date().nullable(),
  unlock_at: z.date().nullable(),
  lock_at: z.date().nullable(),
  points_possible: z.number().min(0).nullable(),
  grading_type: z.enum(['pass_fail', 'percent', 'letter_grade', 'gpa_scale', 'points']),
  submission_types: z.array(z.enum(['online_text_entry', 'online_upload', 'online_url', 'media_recording'])),
  workflow_state: z.enum(['published', 'unpublished', 'deleted']),
  course_id: z.string().uuid(),
  assignment_group_id: z.string().uuid(),
  position: z.number().int().min(1)
})

type User = z.infer<typeof UserSchema>
type Course = z.infer<typeof CourseSchema>
type Assignment = z.infer<typeof AssignmentSchema>
```

### 2. Canvas API Integration Patterns

```typescript
// ✅ Good: Canvas-specific API client with proper error handling
import { z } from 'zod'

class CanvasApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public canvasErrorCode?: string,
    public canvasErrorDetails?: Record<string, any>
  ) {
    super(message)
    this.name = 'CanvasApiError'
  }
}

class CanvasApiClient {
  private baseUrl: string
  private authToken: string

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl
    this.authToken = authToken
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    schema: z.ZodSchema<T>
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1${endpoint}`

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json+canvas-string-ids',
          ...options.headers
        },
        ...options
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new CanvasApiError(
          errorData.message || `Canvas API error: ${response.statusText}`,
          response.status,
          errorData.error_code,
          errorData.errors
        )
      }

      const data = await response.json()
      return schema.parse(data)

    } catch (error) {
      if (error instanceof CanvasApiError) {
        throw error
      }

      if (error instanceof z.ZodError) {
        throw new CanvasApiError(
          `Invalid Canvas API response: ${error.message}`,
          500,
          'VALIDATION_ERROR'
        )
      }

      throw new CanvasApiError(
        'Network error occurred',
        0,
        'NETWORK_ERROR'
      )
    }
  }

  // Canvas-specific pagination handling
  async getCourses(params: {
    enrollment_type?: string
    enrollment_state?: string
    include?: string[]
    per_page?: number
    page?: number
  } = {}): Promise<{ courses: Course[], hasMore: boolean, nextPage?: number }> {
    const queryParams = new URLSearchParams()

    if (params.enrollment_type) queryParams.set('enrollment_type', params.enrollment_type)
    if (params.enrollment_state) queryParams.set('enrollment_state', params.enrollment_state)
    if (params.include) queryParams.set('include[]', params.include.join(','))
    queryParams.set('per_page', String(params.per_page || 20))
    if (params.page) queryParams.set('page', String(params.page))

    const endpoint = `/courses?${queryParams.toString()}`
    const courses = await this.request(endpoint, { method: 'GET' }, z.array(CourseSchema))

    // Canvas pagination handling
    const linkHeader = response.headers.get('Link')
    const hasMore = linkHeader?.includes('rel="next"') || false
    const nextPage = hasMore ? (params.page || 1) + 1 : undefined

    return { courses, hasMore, nextPage }
  }
}
```

### 3. Canvas Component Patterns

```typescript
// ✅ Good: Canvas-specific component patterns
import React, { memo, forwardRef } from 'react'
import { Button, Card } from '@carbon/react'
import { Course, User } from '@/types/canvas'
import { useCanvasPermissions } from '@/hooks/useCanvasPermissions'
import { useCanvasNavigation } from '@/hooks/useCanvasNavigation'

interface CanvasCourseCardProps {
  course: Course
  currentUser: User
  variant?: 'dashboard' | 'catalog' | 'admin'
  showEnrollmentInfo?: boolean
  onEnroll?: (courseId: string) => Promise<void>
  onUnenroll?: (courseId: string) => Promise<void>
  className?: string
}

/**
 * CanvasCourseCard displays course information with Canvas-specific features
 * Handles enrollment states, permissions, and navigation patterns
 */
export const CanvasCourseCard = memo(forwardRef<HTMLDivElement, CanvasCourseCardProps>(
  ({
    course,
    currentUser,
    variant = 'dashboard',
    showEnrollmentInfo = true,
    onEnroll,
    onUnenroll,
    className,
    ...props
  }, ref) => {
    const { canEnroll, canUnenroll, canManage } = useCanvasPermissions(course, currentUser)
    const { navigateToCourse, navigateToGradebook } = useCanvasNavigation()

    const enrollment = course.enrollments.find(e => e.user_id === currentUser.id)
    const isEnrolled = !!enrollment
    const enrollmentRole = enrollment?.role

    const handleCourseClick = () => {
      navigateToCourse(course.id)
    }

    const handleEnrollClick = async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isEnrolled && onUnenroll) {
        await onUnenroll(course.id)
      } else if (!isEnrolled && onEnroll) {
        await onEnroll(course.id)
      }
    }

    const getEnrollmentBadge = () => {
      if (!showEnrollmentInfo || !enrollment) return null

      const roleLabels = {
        student: 'Student',
        teacher: 'Teacher',
        ta: 'Teaching Assistant',
        observer: 'Observer',
        admin: 'Admin'
      }

      return (
        <span className="enrollment-badge" data-role={enrollmentRole}>
          {roleLabels[enrollmentRole] || enrollmentRole}
        </span>
      )
    }

    return (
      <Card
        ref={ref}
        className={`canvas-course-card canvas-course-card--${variant} ${className}`}
        onClick={handleCourseClick}
        {...props}
      >
        <div className="course-header">
          <h3 className="course-name">{course.name}</h3>
          <span className="course-code">{course.course_code}</span>
          {getEnrollmentBadge()}
        </div>

        <div className="course-term">
          {course.term.name}
        </div>

        {variant === 'catalog' && (
          <div className="course-actions">
            <Button
              size="sm"
              kind={isEnrolled ? 'secondary' : 'primary'}
              onClick={handleEnrollClick}
              disabled={!canEnroll && !canUnenroll}
            >
              {isEnrolled ? 'Unenroll' : 'Enroll'}
            </Button>
          </div>
        )}

        {variant === 'dashboard' && canManage && (
          <div className="course-admin-actions">
            <Button
              size="sm"
              kind="ghost"
              onClick={(e) => {
                e.stopPropagation()
                navigateToGradebook(course.id)
              }}
            >
              Gradebook
            </Button>
          </div>
        )}
      </Card>
    )
  }
))

CanvasCourseCard.displayName = 'CanvasCourseCard'
```

---

## Design System Migration

### 1. InstUI to Carbon Migration Strategy

```typescript
// ✅ Good: Component migration with backward compatibility
import React from 'react'
import { Button as CarbonButton } from '@carbon/react'
import { Button as InstUIButton } from '@instructure/ui-buttons'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

interface MigratedButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  // Legacy InstUI props for backward compatibility
  color?: 'primary' | 'secondary'
  margin?: string
}

/**
 * Migrated Button component that supports both Carbon and InstUI
 * Uses feature flags to control which implementation is used
 */
export const Button: React.FC<MigratedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  // Legacy props
  color,
  margin,
  ...props
}) => {
  const useCarbonComponents = useFeatureFlag('carbon_components')

  if (useCarbonComponents) {
    // Map InstUI props to Carbon props
    const carbonKind = variant === 'ghost' ? 'ghost' :
                      variant === 'secondary' ? 'secondary' : 'primary'

    return (
      <CarbonButton
        kind={carbonKind}
        size={size}
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        {children}
      </CarbonButton>
    )
  }

  // Fallback to InstUI implementation
  const instUIColor = color || (variant === 'primary' ? 'primary' : 'secondary')

  return (
    <InstUIButton
      color={instUIColor}
      size={size}
      disabled={disabled}
      onClick={onClick}
      margin={margin}
      {...props}
    >
      {children}
    </InstUIButton>
  )
}

// Migration utility for component detection
export const withMigrationSupport = <P extends object>(
  CarbonComponent: React.ComponentType<P>,
  InstUIComponent: React.ComponentType<P>,
  featureFlagKey: string
) => {
  return (props: P) => {
    const useCarbonComponents = useFeatureFlag(featureFlagKey)

    if (useCarbonComponents) {
      return <CarbonComponent {...props} />
    }

    return <InstUIComponent {...props} />
  }
}
```

### 2. Theme Migration Patterns

```typescript
// ✅ Good: Theme migration with Canvas brand consistency
import { Theme as CarbonTheme } from '@carbon/react'
import { canvas as canvasInstUITheme } from '@instructure/ui-themes'

// Canvas brand variables mapping
export const canvasBrandMapping = {
  // Primary colors
  primary: {
    carbon: '#0374B5', // Canvas primary blue
    instui: canvasInstUITheme.colors.brand
  },

  // Secondary colors
  secondary: {
    carbon: '#8B969E',
    instui: canvasInstUITheme.colors.licorice
  },

  // Educational context colors
  success: {
    carbon: '#24A148', // Canvas success green
    instui: canvasInstUITheme.colors.shamrock
  },

  warning: {
    carbon: '#F1C21B', // Canvas warning yellow
    instui: canvasInstUITheme.colors.fire
  },

  danger: {
    carbon: '#DA1E28', // Canvas danger red
    instui: canvasInstUITheme.colors.crimson
  }
}

// Create Canvas-specific Carbon theme
export const createCanvasCarbonTheme = () => ({
  ...CarbonTheme,
  colors: {
    ...CarbonTheme.colors,
    // Override Carbon colors with Canvas brand colors
    interactive01: canvasBrandMapping.primary.carbon,
    interactive02: canvasBrandMapping.secondary.carbon,
    support01: canvasBrandMapping.danger.carbon,
    support02: canvasBrandMapping.success.carbon,
    support03: canvasBrandMapping.warning.carbon,

    // Educational-specific colors
    courseBlue: '#1E88E5',
    assignmentOrange: '#FF9800',
    discussionGreen: '#4CAF50',
    quizPurple: '#9C27B0'
  },

  spacing: {
    ...CarbonTheme.spacing,
    // Educational-optimized spacing
    contentPadding: '1.5rem',
    cardGap: '1rem',
    sectionGap: '2rem'
  },

  typography: {
    ...CarbonTheme.typography,
    // Canvas font stack
    fontFamily: 'LatoWeb, "Lato Extended", Lato, "Helvetica Neue", Helvetica, Arial, sans-serif'
  }
})

// Theme provider with migration support
export const CanvasThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const useCarbonTheme = useFeatureFlag('carbon_theme')

  if (useCarbonTheme) {
    const carbonTheme = createCanvasCarbonTheme()
    return (
      <ThemeProvider theme={carbonTheme}>
        {children}
      </ThemeProvider>
    )
  }

  // Fallback to InstUI theme
  return (
    <InstUISettingsProvider theme={canvasInstUITheme}>
      {children}
    </InstUISettingsProvider>
  )
}
```

### 3. Migration Testing Patterns

```typescript
// ✅ Good: Migration testing utilities
import { render, screen } from '@testing-library/react'
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext'

// Test utility for component migration
export const renderWithMigrationFlags = (
  component: React.ReactElement,
  flags: Record<string, boolean> = {}
) => {
  return render(
    <FeatureFlagProvider flags={flags}>
      {component}
    </FeatureFlagProvider>
  )
}

// Migration test suite pattern
describe('Button Migration', () => {
  it('renders InstUI button when carbon flag is disabled', () => {
    renderWithMigrationFlags(
      <Button>Test Button</Button>,
      { carbon_components: false }
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass('instui-button') // InstUI specific class
  })

  it('renders Carbon button when carbon flag is enabled', () => {
    renderWithMigrationFlags(
      <Button>Test Button</Button>,
      { carbon_components: true }
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bx--btn') // Carbon specific class
  })

  it('maintains consistent behavior across implementations', async () => {
    const handleClick = jest.fn()

    // Test InstUI implementation
    const { rerender } = renderWithMigrationFlags(
      <Button onClick={handleClick}>Test Button</Button>,
      { carbon_components: false }
    )

    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)

    // Test Carbon implementation
    handleClick.mockClear()
    rerender(
      <FeatureFlagProvider flags={{ carbon_components: true }}>
        <Button onClick={handleClick}>Test Button</Button>
      </FeatureFlagProvider>
    )

    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

---

## TypeScript Guidelines

### 1. Strict Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 2. Interface Design

```typescript
// ✅ Good: Comprehensive interface with proper documentation
/**
 * Represents a Canvas course with all relevant metadata
 */
interface Course {
  readonly id: string
  readonly name: string
  readonly code: string
  readonly term: Term
  readonly enrollments: readonly Enrollment[]
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly settings: CourseSettings
}

interface CourseSettings {
  readonly isPublic: boolean
  readonly allowStudentDiscussions: boolean
  readonly gradingScheme?: GradingScheme
}

// ❌ Bad: Vague, incomplete interface
interface Course {
  id: string
  name: string
  data?: any
}
```

### 3. Type Guards and Validation

```typescript
// ✅ Good: Runtime type validation
import { z } from 'zod'

const CourseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  code: z.string().regex(/^[A-Z]{2,4}\d{3,4}$/),
  term: TermSchema,
  enrollments: z.array(EnrollmentSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
  settings: CourseSettingsSchema
})

type Course = z.infer<typeof CourseSchema>

const isCourse = (data: unknown): data is Course => {
  return CourseSchema.safeParse(data).success
}

// ❌ Bad: No runtime validation
interface Course {
  id: string
  name: string
}

const isCourse = (data: any): data is Course => {
  return typeof data.id === 'string' && typeof data.name === 'string'
}
```

### 4. Generic Constraints

```typescript
// ✅ Good: Proper generic constraints
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>
  save(entity: T): Promise<T>
  delete(id: string): Promise<void>
}

interface ApiResponse<T> {
  data: T
  meta: {
    total: number
    page: number
    perPage: number
  }
}

// ❌ Bad: Unconstrained generics
interface Repository<T> {
  findById(id: any): Promise<T>
  save(entity: any): Promise<T>
}
```

---

## React Component Guidelines

### 1. Component Structure

```typescript
// ✅ Good: Well-structured component with proper typing
import React, { memo, forwardRef } from 'react'
import { Button } from '@carbon/react'
import { Course } from '@/types/course'
import { useCourseActions } from '@/hooks/useCourseActions'
import styles from './CourseCard.module.css'

interface CourseCardProps {
  course: Course
  variant?: 'compact' | 'detailed'
  onEnroll?: (courseId: string) => void
  className?: string
  'data-testid'?: string
}

/**
 * CourseCard displays course information with enrollment actions
 *
 * @example
 * <CourseCard
 *   course={course}
 *   variant="detailed"
 *   onEnroll={handleEnroll}
 * />
 */
export const CourseCard = memo(forwardRef<HTMLDivElement, CourseCardProps>(
  ({ course, variant = 'detailed', onEnroll, className, ...props }, ref) => {
    const { enroll, isEnrolling } = useCourseActions()

    const handleEnroll = async () => {
      await enroll(course.id)
      onEnroll?.(course.id)
    }

    return (
      <div
        ref={ref}
        className={`${styles.courseCard} ${styles[variant]} ${className}`}
        {...props}
      >
        <h3 className={styles.title}>{course.name}</h3>
        <p className={styles.code}>{course.code}</p>

        <Button
          onClick={handleEnroll}
          disabled={isEnrolling}
          size="sm"
        >
          {isEnrolling ? 'Enrolling...' : 'Enroll'}
        </Button>
      </div>
    )
  }
))

CourseCard.displayName = 'CourseCard'
```

### 2. Hook Guidelines

```typescript
// ✅ Good: Custom hook with proper error handling and typing
interface UseCourseOptions {
  refetchInterval?: number
  enabled?: boolean
}

interface UseCourseReturn {
  course: Course | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const useCourse = (
  courseId: string,
  options: UseCourseOptions = {}
): UseCourseReturn => {
  const { refetchInterval = 0, enabled = true } = options

  const {
    data: course,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseApi.getCourse(courseId),
    enabled: enabled && !!courseId,
    refetchInterval,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })

  return {
    course: course ?? null,
    isLoading,
    error: error as Error | null,
    refetch
  }
}

// ❌ Bad: Hook without proper error handling or typing
export const useCourse = (courseId: string) => {
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/courses/${courseId}`)
      .then(res => res.json())
      .then(setCourse)
      .finally(() => setLoading(false))
  }, [courseId])

  return { course, loading }
}
```

### 3. Error Boundaries

```typescript
// ✅ Good: Comprehensive error boundary
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<
  PropsWithChildren<{ fallback?: ComponentType<{ error: Error }> }>,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Log to monitoring service
    logger.error('Component error boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback ?? DefaultErrorFallback
      return <FallbackComponent error={this.state.error!} />
    }

    return this.props.children
  }
}
```

---

## State Management

### 1. Zustand Store Pattern

```typescript
// ✅ Good: Well-structured Zustand store
interface CourseState {
  courses: Course[]
  selectedCourse: Course | null
  filters: CourseFilters
  isLoading: boolean
  error: string | null
}

interface CourseActions {
  setCourses: (courses: Course[]) => void
  selectCourse: (course: Course | null) => void
  updateFilters: (filters: Partial<CourseFilters>) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

type CourseStore = CourseState & CourseActions

const initialState: CourseState = {
  courses: [],
  selectedCourse: null,
  filters: {},
  isLoading: false,
  error: null
}

export const useCourseStore = create<CourseStore>((set, get) => ({
  ...initialState,

  setCourses: (courses) => set({ courses, error: null }),

  selectCourse: (selectedCourse) => set({ selectedCourse }),

  updateFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  reset: () => set(initialState)
}))

// Create selectors for better performance
export const useCourses = () => useCourseStore((state) => state.courses)
export const useSelectedCourse = () => useCourseStore((state) => state.selectedCourse)
export const useCourseFilters = () => useCourseStore((state) => state.filters)
```

### 2. React Query Integration

```typescript
// ✅ Good: React Query with proper caching and error handling
export const courseQueries = {
  all: ['courses'] as const,
  lists: () => [...courseQueries.all, 'list'] as const,
  list: (filters: CourseFilters) => [...courseQueries.lists(), filters] as const,
  details: () => [...courseQueries.all, 'detail'] as const,
  detail: (id: string) => [...courseQueries.details(), id] as const,
}

export const useCourses = (filters: CourseFilters = {}) => {
  return useQuery({
    queryKey: courseQueries.list(filters),
    queryFn: () => courseApi.getCourses(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      logger.error('Failed to fetch courses', { error, filters })
    }
  })
}

export const useCreateCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: courseApi.createCourse,
    onSuccess: (newCourse) => {
      // Invalidate and refetch courses list
      queryClient.invalidateQueries(courseQueries.lists())

      // Add new course to cache
      queryClient.setQueryData(
        courseQueries.detail(newCourse.id),
        newCourse
      )

      // Show success notification
      toast.success('Course created successfully')
    },
    onError: (error) => {
      logger.error('Failed to create course', { error })
      toast.error('Failed to create course')
    }
  })
}
```

---

## Styling Guidelines

### 1. Carbon Design System Integration

```typescript
// ✅ Good: Proper Carbon theme customization
import { Theme } from '@carbon/react'

export const canvasTheme = {
  ...Theme,
  colors: {
    ...Theme.colors,
    // Canvas brand colors
    primary: '#394B58',
    primaryHover: '#2D3B47',
    secondary: '#8B969E',
    success: '#24A148',
    warning: '#F1C21B',
    danger: '#DA1E28',
    // Educational context colors
    courseBlue: '#1E88E5',
    assignmentOrange: '#FF9800',
    discussionGreen: '#4CAF50'
  },
  spacing: {
    ...Theme.spacing,
    // Educational-optimized spacing
    contentPadding: '1.5rem',
    cardGap: '1rem',
    sectionGap: '2rem'
  }
}

// ❌ Bad: Hardcoded colors and spacing
const styles = {
  card: {
    backgroundColor: '#ffffff',
    padding: '16px',
    margin: '8px',
    borderRadius: '4px'
  }
}
```

### 2. CSS-in-JS with Emotion

```typescript
// ✅ Good: Styled components with theme integration
import styled from '@emotion/styled'
import { Theme } from '@/types/theme'

interface CardProps {
  variant?: 'elevated' | 'outlined' | 'filled'
  size?: 'small' | 'medium' | 'large'
}

export const Card = styled.div<CardProps>`
  ${({ theme, variant = 'elevated', size = 'medium' }: { theme: Theme } & CardProps) => `
    padding: ${theme.spacing[size]};
    border-radius: ${theme.borderRadius.medium};
    transition: all 0.2s ease-in-out;

    ${variant === 'elevated' && `
      box-shadow: ${theme.shadows.card};
      background: ${theme.colors.surface};

      &:hover {
        box-shadow: ${theme.shadows.cardHover};
        transform: translateY(-2px);
      }
    `}

    ${variant === 'outlined' && `
      border: 1px solid ${theme.colors.border};
      background: ${theme.colors.surface};
    `}

    ${variant === 'filled' && `
      background: ${theme.colors.surfaceVariant};
    `}

    @media (max-width: ${theme.breakpoints.mobile}) {
      padding: ${theme.spacing.small};
    }
  `}
`

// ❌ Bad: Inline styles without theme integration
const Card = ({ children, style }) => (
  <div style={{
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    ...style
  }}>
    {children}
  </div>
)
```

### 3. Responsive Design Patterns

```typescript
// ✅ Good: Mobile-first responsive design
import { useBreakpoint } from '@/hooks/useBreakpoint'

const ResponsiveGrid = styled.div`
  display: grid;
  gap: 1rem;

  /* Mobile first */
  grid-template-columns: 1fr;

  /* Tablet */
  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  /* Desktop */
  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  /* Large desktop */
  @media (min-width: ${({ theme }) => theme.breakpoints.large}) {
    grid-template-columns: repeat(4, 1fr);
  }
`

// Component-level responsive behavior
export const CourseGrid: React.FC<{ courses: Course[] }> = ({ courses }) => {
  const { isMobile, isTablet } = useBreakpoint()

  const getColumns = () => {
    if (isMobile) return 1
    if (isTablet) return 2
    return 3
  }

  return (
    <ResponsiveGrid columns={getColumns()}>
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </ResponsiveGrid>
  )
}
```

---

## Testing Standards

### 1. Unit Testing with Jest and React Testing Library

```typescript
// ✅ Good: Comprehensive component testing
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CourseCard } from '../CourseCard'
import { mockCourse } from '@/test-utils/mocks'

describe('CourseCard', () => {
  const defaultProps = {
    course: mockCourse,
    onEnroll: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders course information correctly', () => {
    render(<CourseCard {...defaultProps} />)

    expect(screen.getByText(mockCourse.name)).toBeInTheDocument()
    expect(screen.getByText(mockCourse.code)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enroll/i })).toBeInTheDocument()
  })

  it('calls onEnroll when enroll button is clicked', async () => {
    const user = userEvent.setup()
    render(<CourseCard {...defaultProps} />)

    const enrollButton = screen.getByRole('button', { name: /enroll/i })
    await user.click(enrollButton)

    expect(defaultProps.onEnroll).toHaveBeenCalledWith(mockCourse.id)
  })

  it('shows loading state during enrollment', async () => {
    const user = userEvent.setup()
    render(<CourseCard {...defaultProps} />)

    const enrollButton = screen.getByRole('button', { name: /enroll/i })
    await user.click(enrollButton)

    expect(screen.getByText('Enrolling...')).toBeInTheDocument()
    expect(enrollButton).toBeDisabled()
  })

  it('handles enrollment error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const mockEnrollWithError = jest.fn().mockRejectedValue(new Error('Enrollment failed'))

    render(<CourseCard {...defaultProps} onEnroll={mockEnrollWithError} />)

    const enrollButton = screen.getByRole('button', { name: /enroll/i })
    await userEvent.click(enrollButton)

    await waitFor(() => {
      expect(screen.getByText(/enrollment failed/i)).toBeInTheDocument()
    })

    consoleSpy.mockRestore()
  })

  it('meets accessibility requirements', () => {
    render(<CourseCard {...defaultProps} />)

    const card = screen.getByRole('article')
    expect(card).toHaveAttribute('aria-label', expect.stringContaining(mockCourse.name))

    const enrollButton = screen.getByRole('button', { name: /enroll/i })
    expect(enrollButton).toHaveAttribute('aria-describedby')
  })
})

// ❌ Bad: Shallow testing without user interaction
describe('CourseCard', () => {
  it('renders', () => {
    const wrapper = shallow(<CourseCard course={mockCourse} />)
    expect(wrapper.find('.course-name')).toHaveLength(1)
  })
})
```

### 2. Integration Testing

```typescript
// ✅ Good: Integration test for complete user flow
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CourseDashboard } from '../CourseDashboard'
import { mockApiClient } from '@/test-utils/mockApiClient'

describe('CourseDashboard Integration', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
  })

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  it('completes course enrollment flow', async () => {
    const user = userEvent.setup()
    mockApiClient.getCourses.mockResolvedValue([mockCourse])
    mockApiClient.enrollInCourse.mockResolvedValue({ success: true })

    renderWithProviders(<CourseDashboard />)

    // Wait for courses to load
    await waitFor(() => {
      expect(screen.getByText(mockCourse.name)).toBeInTheDocument()
    })

    // Click enroll button
    const enrollButton = screen.getByRole('button', { name: /enroll/i })
    await user.click(enrollButton)

    // Verify enrollment confirmation
    await waitFor(() => {
      expect(screen.getByText(/successfully enrolled/i)).toBeInTheDocument()
    })

    // Verify API was called correctly
    expect(mockApiClient.enrollInCourse).toHaveBeenCalledWith(mockCourse.id)
  })
})
```

### 3. E2E Testing with Playwright

```typescript
// ✅ Good: End-to-end test for critical user journey
import { test, expect } from '@playwright/test'

test.describe('Course Enrollment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('user can enroll in a course', async ({ page }) => {
    // Navigate to course catalog
    await page.click('[data-testid="course-catalog-link"]')
    await expect(page).toHaveURL('/courses')

    // Search for a specific course
    await page.fill('[data-testid="course-search"]', 'Introduction to Computer Science')
    await page.press('[data-testid="course-search"]', 'Enter')

    // Wait for search results
    await page.waitForSelector('[data-testid="course-card"]')

    // Click on the first course
    const firstCourse = page.locator('[data-testid="course-card"]').first()
    await firstCourse.click()

    // Enroll in the course
    await page.click('[data-testid="enroll-button"]')

    // Verify enrollment success
    await expect(page.locator('[data-testid="enrollment-success"]')).toBeVisible()
    await expect(page.locator('[data-testid="enrollment-success"]')).toContainText('Successfully enrolled')

    // Verify course appears in dashboard
    await page.goto('/dashboard')
    await expect(page.locator('[data-testid="enrolled-course"]')).toContainText('Introduction to Computer Science')
  })

  test('handles enrollment errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('/api/courses/*/enroll', route => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({ error: 'Course is full' })
      })
    })

    await page.click('[data-testid="course-card"]')
    await page.click('[data-testid="enroll-button"]')

    // Verify error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Course is full')
  })
})
```

---

## Performance Guidelines

### 1. React Performance Optimization

```typescript
// ✅ Good: Optimized component with proper memoization
import React, { memo, useMemo, useCallback } from 'react'

interface CourseListProps {
  courses: Course[]
  filters: CourseFilters
  onCourseSelect: (course: Course) => void
}

export const CourseList = memo<CourseListProps>(({
  courses,
  filters,
  onCourseSelect
}) => {
  // Memoize expensive filtering operation
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      if (filters.term && course.term.id !== filters.term) return false
      if (filters.subject && !course.code.startsWith(filters.subject)) return false
      if (filters.search && !course.name.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })
  }, [courses, filters])

  // Memoize callback to prevent unnecessary re-renders
  const handleCourseSelect = useCallback((course: Course) => {
    onCourseSelect(course)
  }, [onCourseSelect])

  return (
    <div className="course-list">
      {filteredCourses.map(course => (
        <CourseCard
          key={course.id}
          course={course}
          onSelect={handleCourseSelect}
        />
      ))}
    </div>
  )
})

// ❌ Bad: Unoptimized component causing unnecessary re-renders
export const CourseList = ({ courses, filters, onCourseSelect }) => {
  const filteredCourses = courses.filter(course => {
    // Filtering logic runs on every render
    return course.name.includes(filters.search || '')
  })

  return (
    <div>
      {filteredCourses.map(course => (
        <CourseCard
          key={course.id}
          course={course}
          onSelect={() => onCourseSelect(course)} // New function on every render
        />
      ))}
    </div>
  )
}
```

### 2. Bundle Optimization

```typescript
// ✅ Good: Code splitting and lazy loading
import { lazy, Suspense } from 'react'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'

// Lazy load heavy components
const GradebookTable = lazy(() => import('./GradebookTable'))
const CourseAnalytics = lazy(() => import('./CourseAnalytics'))
const DiscussionForum = lazy(() => import('./DiscussionForum'))

export const CourseDetailPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'gradebook':
        return (
          <Suspense fallback={<LoadingSkeleton type="table" />}>
            <GradebookTable />
          </Suspense>
        )
      case 'analytics':
        return (
          <Suspense fallback={<LoadingSkeleton type="charts" />}>
            <CourseAnalytics />
          </Suspense>
        )
      case 'discussions':
        return (
          <Suspense fallback={<LoadingSkeleton type="list" />}>
            <DiscussionForum />
          </Suspense>
        )
      default:
        return <CourseOverview />
    }
  }

  return (
    <div>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      {renderTabContent()}
    </div>
  )
}

// ❌ Bad: Loading all components upfront
import { GradebookTable } from './GradebookTable'
import { CourseAnalytics } from './CourseAnalytics'
import { DiscussionForum } from './DiscussionForum'

export const CourseDetailPage = () => {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'gradebook' && <GradebookTable />}
      {activeTab === 'analytics' && <CourseAnalytics />}
      {activeTab === 'discussions' && <DiscussionForum />}
    </div>
  )
}
```

### 3. Virtual Scrolling for Large Lists

```typescript
// ✅ Good: Virtual scrolling for performance
import { FixedSizeList as List } from 'react-window'

interface VirtualizedCourseListProps {
  courses: Course[]
  height: number
  itemHeight: number
}

export const VirtualizedCourseList: React.FC<VirtualizedCourseListProps> = ({
  courses,
  height,
  itemHeight
}) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <CourseCard course={courses[index]} />
    </div>
  )

  return (
    <List
      height={height}
      itemCount={courses.length}
      itemSize={itemHeight}
      width="100%"
    >
      {Row}
    </List>
  )
}

// ❌ Bad: Rendering all items at once
export const CourseList = ({ courses }) => (
  <div>
    {courses.map(course => (
      <CourseCard key={course.id} course={course} />
    ))}
  </div>
)
```

---

## Accessibility Standards

### 1. WCAG 2.1 AA Compliance

```typescript
// ✅ Good: Accessible component with proper ARIA attributes
import React, { useId, useState } from 'react'

interface AccessibleFormFieldProps {
  label: string
  error?: string
  required?: boolean
  helpText?: string
  children: React.ReactElement
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  label,
  error,
  required = false,
  helpText,
  children
}) => {
  const fieldId = useId()
  const errorId = useId()
  const helpId = useId()

  const childWithProps = React.cloneElement(children, {
    id: fieldId,
    'aria-describedby': [
      error ? errorId : null,
      helpText ? helpId : null
    ].filter(Boolean).join(' '),
    'aria-invalid': !!error,
    'aria-required': required
  })

  return (
    <div className="form-field">
      <label htmlFor={fieldId} className="form-label">
        {label}
        {required && <span aria-label="required">*</span>}
      </label>

      {helpText && (
        <div id={helpId} className="help-text">
          {helpText}
        </div>
      )}

      {childWithProps}

      {error && (
        <div
          id={errorId}
          className="error-message"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  )
}

// ❌ Bad: Inaccessible form field
export const FormField = ({ label, error, children }) => (
  <div>
    <label>{label}</label>
    {children}
    {error && <div className="error">{error}</div>}
  </div>
)
```

### 2. Keyboard Navigation

```typescript
// ✅ Good: Comprehensive keyboard navigation
import React, { useRef, useCallback } from 'react'

interface KeyboardNavigableListProps {
  items: Array<{ id: string; label: string }>
  onSelect: (id: string) => void
}

export const KeyboardNavigableList: React.FC<KeyboardNavigableListProps> = ({
  items,
  onSelect
}) => {
  const listRef = useRef<HTMLUListElement>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setFocusedIndex(prev => Math.min(prev + 1, items.length - 1))
        break

      case 'ArrowUp':
        event.preventDefault()
        setFocusedIndex(prev => Math.max(prev - 1, 0))
        break

      case 'Home':
        event.preventDefault()
        setFocusedIndex(0)
        break

      case 'End':
        event.preventDefault()
        setFocusedIndex(items.length - 1)
        break

      case 'Enter':
      case ' ':
        event.preventDefault()
        onSelect(items[focusedIndex].id)
        break

      case 'Escape':
        event.preventDefault()
        // Handle escape logic
        break
    }
  }, [items, focusedIndex, onSelect])

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-label="Course list"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          role="option"
          aria-selected={index === focusedIndex}
          className={index === focusedIndex ? 'focused' : ''}
          onClick={() => onSelect(item.id)}
        >
          {item.label}
        </li>
      ))}
    </ul>
  )
}
```

### 3. Screen Reader Optimization

```typescript
// ✅ Good: Screen reader optimized component
import React from 'react'

interface CourseProgressProps {
  course: Course
  completedAssignments: number
  totalAssignments: number
}

export const CourseProgress: React.FC<CourseProgressProps> = ({
  course,
  completedAssignments,
  totalAssignments
}) => {
  const progressPercentage = (completedAssignments / totalAssignments) * 100

  return (
    <div className="course-progress">
      <h3 id={`course-${course.id}-title`}>
        {course.name}
      </h3>

      <div
        role="progressbar"
        aria-labelledby={`course-${course.id}-title`}
        aria-describedby={`course-${course.id}-description`}
        aria-valuenow={completedAssignments}
        aria-valuemin={0}
        aria-valuemax={totalAssignments}
        aria-valuetext={`${completedAssignments} of ${totalAssignments} assignments completed`}
      >
        <div
          className="progress-bar"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div id={`course-${course.id}-description`} className="sr-only">
        Course progress: {completedAssignments} out of {totalAssignments} assignments completed.
        {progressPercentage === 100 ? ' Course completed!' : ''}
      </div>

      <div aria-hidden="true" className="progress-text">
        {completedAssignments}/{totalAssignments} assignments
      </div>
    </div>
  )
}
```

---

## Code Organization

### 1. File Structure Standards

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Input, etc.)
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   ├── forms/           # Form-specific components
│   └── data-display/    # Data visualization components
├── features/            # Feature-specific modules
│   ├── courses/
│   │   ├── components/  # Course-specific components
│   │   ├── hooks/       # Course-specific hooks
│   │   ├── services/    # Course API services
│   │   ├── types/       # Course type definitions
│   │   └── utils/       # Course utilities
│   ├── gradebook/
│   └── dashboard/
├── hooks/               # Shared custom hooks
├── services/            # API services and external integrations
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── constants/           # Application constants
├── contexts/            # React contexts
└── styles/              # Global styles and themes
```

### 2. Import Organization

```typescript
// ✅ Good: Organized imports with clear sections
// React and third-party libraries
import React, { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button, DataTable } from '@carbon/react'

// Internal utilities and types
import { Course, Assignment } from '@/types'
import { formatDate, calculateGrade } from '@/utils'
import { courseApi } from '@/services/api'

// Feature-specific imports
import { useCourseFilters } from '../hooks/useCourseFilters'
import { CourseCard } from '../components/CourseCard'
import { AssignmentList } from '../components/AssignmentList'

// Styles (always last)
import styles from './CourseDashboard.module.css'

// ❌ Bad: Disorganized imports
import { CourseCard } from '../components/CourseCard'
import React, { useState } from 'react'
import styles from './CourseDashboard.module.css'
import { Button } from '@carbon/react'
import { Course } from '@/types'
import { useQuery } from '@tanstack/react-query'
```

### 3. Component Export Patterns

```typescript
// ✅ Good: Consistent export patterns
// components/CourseCard/index.ts
export { CourseCard } from './CourseCard'
export type { CourseCardProps } from './CourseCard'

// components/CourseCard/CourseCard.tsx
import React from 'react'

export interface CourseCardProps {
  course: Course
  variant?: 'compact' | 'detailed'
  onSelect?: (course: Course) => void
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  variant = 'detailed',
  onSelect
}) => {
  // Component implementation
}

// features/courses/index.ts
export { CourseDashboard } from './components/CourseDashboard'
export { CourseList } from './components/CourseList'
export { useCourses } from './hooks/useCourses'
export type { Course, CourseFilters } from './types'

// ❌ Bad: Inconsistent exports
export default CourseCard
export { CourseCard as Card }
```

---

## API Integration Patterns

### 1. Type-Safe API Client

```typescript
// ✅ Good: Type-safe API client with proper error handling
import { z } from 'zod'

// API response schemas
const CourseSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  term: z.object({
    id: z.string(),
    name: z.string()
  }),
  enrollments: z.array(z.object({
    id: z.string(),
    role: z.enum(['student', 'teacher', 'ta'])
  }))
})

const ApiResponseSchema = <T>(dataSchema: z.ZodSchema<T>) => z.object({
  data: dataSchema,
  meta: z.object({
    total: z.number(),
    page: z.number(),
    perPage: z.number()
  }).optional()
})

type Course = z.infer<typeof CourseSchema>
type ApiResponse<T> = z.infer<ReturnType<typeof ApiResponseSchema>>

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class CourseApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    schema: z.ZodSchema<T>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      if (!response.ok) {
        throw new ApiError(
          `API request failed: ${response.statusText}`,
          response.status
        )
      }

      const data = await response.json()
      return schema.parse(data)

    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      if (error instanceof z.ZodError) {
        throw new ApiError(
          `Invalid API response: ${error.message}`,
          500,
          'VALIDATION_ERROR'
        )
      }

      throw new ApiError(
        'Network error occurred',
        0,
        'NETWORK_ERROR'
      )
    }
  }

  async getCourses(filters: CourseFilters = {}): Promise<Course[]> {
    const queryParams = new URLSearchParams()

    if (filters.term) queryParams.set('term', filters.term)
    if (filters.search) queryParams.set('search', filters.search)

    const endpoint = `/courses?${queryParams.toString()}`
    const response = await this.request(
      endpoint,
      { method: 'GET' },
      ApiResponseSchema(z.array(CourseSchema))
    )

    return response.data
  }

  async getCourse(id: string): Promise<Course> {
    return this.request(
      `/courses/${id}`,
      { method: 'GET' },
      CourseSchema
    )
  }

  async enrollInCourse(courseId: string): Promise<void> {
    await this.request(
      `/courses/${courseId}/enroll`,
      { method: 'POST' },
      z.object({ success: z.boolean() })
    )
  }
}

export const courseApi = new CourseApiClient('/api/v1')
```

### 2. Error Handling Strategy

```typescript
// ✅ Good: Comprehensive error handling
import { toast } from '@/components/Toast'
import { logger } from '@/utils/logger'

export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown, context?: string) => {
    // Log error for monitoring
    logger.error('Application error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context
    })

    // Handle different error types
    if (error instanceof ApiError) {
      switch (error.status) {
        case 401:
          toast.error('Please log in to continue')
          // Redirect to login
          break
        case 403:
          toast.error('You do not have permission to perform this action')
          break
        case 404:
          toast.error('The requested resource was not found')
          break
        case 500:
          toast.error('A server error occurred. Please try again later.')
          break
        default:
          toast.error(error.message || 'An unexpected error occurred')
      }
    } else if (error instanceof Error) {
      toast.error(error.message)
    } else {
      toast.error('An unexpected error occurred')
    }
  }, [])

  return { handleError }
}

// Usage in components
export const CourseList: React.FC = () => {
  const { handleError } = useErrorHandler()

  const { data: courses, error } = useQuery({
    queryKey: ['courses'],
    queryFn: courseApi.getCourses,
    onError: (error) => handleError(error, 'CourseList.getCourses')
  })

  if (error) {
    return <ErrorFallback error={error} />
  }

  return <div>{/* Component content */}</div>
}
```

---

## Security Guidelines

### 1. Input Validation and Sanitization

```typescript
// ✅ Good: Comprehensive input validation
import { z } from 'zod'
import DOMPurify from 'dompurify'

// Input validation schemas
const CreateCourseSchema = z.object({
  name: z.string()
    .min(1, 'Course name is required')
    .max(255, 'Course name must be less than 255 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Course name contains invalid characters'),

  code: z.string()
    .regex(/^[A-Z]{2,4}\d{3,4}$/, 'Invalid course code format'),

  description: z.string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional(),

  termId: z.string().uuid('Invalid term ID')
})

// Sanitization utilities
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false
  })
}

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '')
}

// Secure form component
export const CreateCourseForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    termId: ''
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      // Validate input
      const validatedData = CreateCourseSchema.parse(formData)

      // Sanitize text inputs
      const sanitizedData = {
        ...validatedData,
        name: sanitizeInput(validatedData.name),
        description: validatedData.description
          ? sanitizeHtml(validatedData.description)
          : undefined
      }

      await courseApi.createCourse(sanitizedData)

    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        setErrors(error.flatten().fieldErrors)
      } else {
        handleError(error)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### 2. Content Security Policy

```typescript
// ✅ Good: CSP configuration for security
export const cspConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Only for development
    'https://cdn.carbon.design',
    'https://analytics.instructure.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for CSS-in-JS
    'https://fonts.googleapis.com',
    'https://cdn.carbon.design'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com'
  ],
  'img-src': [
    "'self'",
    'data:',
    'https://canvas.instructure.com',
    'https://cdn.instructure.com'
  ],
  'connect-src': [
    "'self'",
    'https://api.instructure.com',
    'https://sentry.io'
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
}
```

---

## Conclusion

These code guidelines establish the foundation for building high-quality, maintainable, and accessible Canvas Modern UI components. All team members should follow these standards to ensure consistency and excellence across the project.

### Key Takeaways

1. **Type Safety**: Use TypeScript strictly with comprehensive type definitions
2. **Component Design**: Build reusable, accessible, and performant components
3. **Testing**: Write comprehensive tests at all levels
4. **Performance**: Optimize for speed and efficiency from the start
5. **Accessibility**: Build inclusive experiences for all users
6. **Security**: Validate inputs and protect against common vulnerabilities

### Enforcement

- All code must pass ESLint and TypeScript checks
- 90%+ test coverage required
- Accessibility audits for all components
- Performance budgets enforced in CI/CD
- Code reviews mandatory for all changes

---

*This document should be reviewed and updated regularly as the project evolves and new best practices emerge.*


---

## LTI 1.3 Coding Guidelines (New)

### Backend (LTI Service)
- Use standards: OIDC for login, JWT validation (iss, aud, exp/iat skew, nonce, kid/signature)
- Keys: rotateable asymmetric keys (JWKS endpoint), short‑lived access
- Storage: secure state/nonce store; signed server session for UI bootstrap
- Validation: Zod schemas for launch claims and Deep Linking payloads
- Security: strict CSP, CSRF on non‑LTI routes, rate limiting on token flows
- Observability: structured logs (launch id, context_id), metrics, error correlation id

### Frontend (Modern UI)
- Consume minimal, signed bootstrap; never trust client claims without server
- Respect iframe constraints; implement postMessage resize/focus
- Feature‑flag Canvas REST integration; fallback to mock for local dev
- A11y: verify WCAG in iframe; test keyboard/focus trapping in modals
- Performance: lazy‑load heavy routes; avoid large synchronous work in launches

### Services (NRPS/AGS/Deep Linking)
- Scope requests to launch context; enforce role checks server‑side
- Idempotent grade writes; resilient retries with exponential backoff
- Deep Linking: sanitize titles/URLs; validate return JWT

### Testing
- Unit: claim validation, nonce/state, JWKS key selection
- Integration: end‑to‑end OIDC + launch; DL selector roundtrip; AGS passback
- E2E: iframe rendering, resize messaging, keyboard flows
