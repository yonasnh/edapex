import { z } from 'zod'
import {
  CanvasApiError,
  Course,
  CourseSchema,
  CourseFilters,
  Assignment,
  AssignmentSchema,
  AssignmentFilters,
  User,
  UserSchema,
} from '../types/canvas'

/**
 * Canvas API Client with proper error handling and type safety
 * Follows Canvas LMS API v1 specifications
 */
export class CanvasApiClient {
  private baseUrl: string
  private authToken: string

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.authToken = authToken
  }

  /**
   * Generic request method with type safety and error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    schema: z.ZodSchema<T>
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1${endpoint}`

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json+canvas-string-ids',
          ...options.headers,
        },
        ...options,
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

      throw new CanvasApiError('Network error occurred', 0, 'NETWORK_ERROR')
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.request('/users/self', { method: 'GET' }, z.any())
    return UserSchema.parse(response)
  }

  /**
   * Get courses with pagination and filtering
   */
  async getCourses(
    params: CourseFilters = {}
  ): Promise<{ courses: Course[]; hasMore: boolean; nextPage?: number | undefined }> {
    const queryParams = new URLSearchParams()

    if (params.enrollment_type) queryParams.set('enrollment_type', params.enrollment_type)
    if (params.enrollment_state) queryParams.set('enrollment_state', params.enrollment_state)
    if (params.include) queryParams.set('include[]', params.include.join(','))
    if (params.state) queryParams.set('state[]', params.state.join(','))
    if (params.search_term) queryParams.set('search_term', params.search_term)
    queryParams.set('per_page', String(params.per_page || 20))
    if (params.page) queryParams.set('page', String(params.page))

    const endpoint = `/courses?${queryParams.toString()}`
    const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        Accept: 'application/json+canvas-string-ids',
      },
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

    const courses = z.array(CourseSchema).parse(await response.json())

    // Canvas pagination handling
    const linkHeader = response.headers.get('Link')
    const hasMore = linkHeader?.includes('rel="next"') || false
    const nextPage = hasMore ? (params.page || 1) + 1 : undefined

    return { courses, hasMore, nextPage }
  }

  /**
   * Get a specific course by ID
   */
  async getCourse(courseId: string, include?: string[]): Promise<Course> {
    const queryParams = new URLSearchParams()
    if (include) queryParams.set('include[]', include.join(','))

    const endpoint = `/courses/${courseId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await this.request(endpoint, { method: 'GET' }, z.any())
    return CourseSchema.parse(response)
  }

  /**
   * Get assignments for a course
   */
  async getAssignments(
    courseId: string,
    params: AssignmentFilters = {}
  ): Promise<{ assignments: Assignment[]; hasMore: boolean; nextPage?: number | undefined }> {
    const queryParams = new URLSearchParams()

    if (params.include) queryParams.set('include[]', params.include.join(','))
    if (params.search_term) queryParams.set('search_term', params.search_term)
    if (params.order_by) queryParams.set('order_by', params.order_by)
    queryParams.set('per_page', String(params.per_page || 20))
    if (params.page) queryParams.set('page', String(params.page))

    const endpoint = `/courses/${courseId}/assignments?${queryParams.toString()}`
    const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        Accept: 'application/json+canvas-string-ids',
      },
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

    const assignments = z.array(AssignmentSchema).parse(await response.json())

    // Canvas pagination handling
    const linkHeader = response.headers.get('Link')
    const hasMore = linkHeader?.includes('rel="next"') || false
    const nextPage = hasMore ? (params.page || 1) + 1 : undefined

    return { assignments, hasMore, nextPage }
  }

  /**
   * Enroll in a course
   */
  async enrollInCourse(courseId: string): Promise<{ success: boolean }> {
    const endpoint = `/courses/${courseId}/enrollments`
    const response = await this.request(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify({
          enrollment: {
            type: 'StudentEnrollment',
            enrollment_state: 'active',
          },
        }),
      },
      z.object({ success: z.boolean() })
    )

    return response
  }
}

/**
 * Default Canvas API client instance
 * Uses environment variables for configuration
 */
export const createCanvasApiClient = (): CanvasApiClient => {
  // Handle both Node.js and browser environments
  const getEnvVar = (key: string, defaultValue: string = '') => {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue
    }
    // For browser environment, return demo values
    if (key === 'CANVAS_API_URL') return 'https://canvas.instructure.com'
    if (key === 'CANVAS_API_TOKEN') return 'demo-token'
    return defaultValue
  }

  const baseUrl = getEnvVar('CANVAS_API_URL', 'http://localhost:3000')
  const authToken = getEnvVar('CANVAS_API_TOKEN', '')

  if (!authToken || authToken === 'demo-token') {
    console.warn('SchoolApex Demo: Using demo Canvas API client. Real API calls will be mocked.')
  }

  return new CanvasApiClient(baseUrl, authToken)
}

// Export singleton instance
export const canvasApi = createCanvasApiClient()
