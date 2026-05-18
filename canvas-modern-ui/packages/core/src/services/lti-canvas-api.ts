import { z } from 'zod'
import { Course, Assignment, User } from '../types/canvas'

/**
 * LTI-aware Canvas API Client
 * 
 * Uses the LTI service as a proxy to access Canvas REST API
 * with proper OBO (On-Behalf-Of) token exchange
 */

export interface LTICanvasAPIConfig {
  ltiServiceUrl: string
  sessionId?: string
}

export class LTICanvasAPIClient {
  private config: LTICanvasAPIConfig

  constructor(config: LTICanvasAPIConfig) {
    this.config = config
  }

  /**
   * Generic request method that routes through LTI service
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.ltiServiceUrl}${endpoint}`
    
    // Add session ID to query params if available
    const urlWithSession = new URL(url)
    if (this.config.sessionId) {
      urlWithSession.searchParams.set('session_id', this.config.sessionId)
    }

    const response = await fetch(urlWithSession.toString(), {
      credentials: 'include', // Include cookies for session
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Canvas API request failed: ${errorData.error || response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get user courses
   */
  async getCourses(): Promise<Course[]> {
    return this.request<Course[]>('/api/canvas/courses')
  }

  /**
   * Get course details
   */
  async getCourse(courseId: string): Promise<Course> {
    return this.request<Course>(`/api/canvas/courses/${courseId}`)
  }

  /**
   * Get course assignments
   */
  async getAssignments(courseId: string): Promise<Assignment[]> {
    return this.request<Assignment[]>(`/api/canvas/courses/${courseId}/assignments`)
  }

  /**
   * Get user profile
   */
  async getUser(userId: string = 'self'): Promise<User> {
    return this.request<User>(`/api/canvas/users/${userId}`)
  }

  /**
   * NRPS: Get course membership
   */
  async getCourseMembership(courseId: string) {
    return this.request(`/api/canvas/courses/${courseId}/membership`)
  }

  /**
   * NRPS: Get course instructors
   */
  async getCourseInstructors(courseId: string) {
    return this.request(`/api/canvas/courses/${courseId}/instructors`)
  }

  /**
   * NRPS: Get course students
   */
  async getCourseStudents(courseId: string) {
    return this.request(`/api/canvas/courses/${courseId}/students`)
  }

  /**
   * AGS: Get line items (gradebook columns)
   */
  async getLineItems(courseId: string) {
    return this.request(`/api/canvas/courses/${courseId}/lineitems`)
  }

  /**
   * AGS: Create line item
   */
  async createLineItem(courseId: string, lineItem: any) {
    return this.request(`/api/canvas/courses/${courseId}/lineitems`, {
      method: 'POST',
      body: JSON.stringify(lineItem),
    })
  }

  /**
   * AGS: Submit score
   */
  async submitScore(lineItemId: string, score: any) {
    return this.request(`/api/canvas/lineitems/${lineItemId}/scores`, {
      method: 'POST',
      body: JSON.stringify(score),
    })
  }

  /**
   * AGS: Get results
   */
  async getResults(lineItemId: string) {
    return this.request(`/api/canvas/lineitems/${lineItemId}/results`)
  }

  /**
   * Test OBO token exchange
   */
  async testTokenExchange() {
    return this.request('/api/canvas/token', { method: 'POST' })
  }
}

/**
 * Create LTI Canvas API client instance
 */
export function createLTICanvasAPI(config: LTICanvasAPIConfig): LTICanvasAPIClient {
  return new LTICanvasAPIClient(config)
}
