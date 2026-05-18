import { z } from 'zod'
import { 
  CourseSchema, 
  AssignmentSchema, 
  SubmissionSchema, 
  UserSchema,
  DiscussionTopicSchema,
  DiscussionEntrySchema,
  CalendarEventSchema,
  FileSchema,
  FolderSchema,
  NotificationSchema,
  Course,
  Assignment,
  User,
  DiscussionTopic,
  CalendarEvent,
  File,
  Folder,
  Notification
} from '../types/canvas'

/**
 * Enhanced Canvas API Configuration
 */
export interface EnhancedCanvasAPIConfig {
  baseUrl: string
  getAccessToken: () => string | null
  onAuthError?: () => void
  timeout?: number
  retries?: number
  enableCaching?: boolean
  cacheTimeout?: number
  enableRetry?: boolean
  enableRateLimit?: boolean
}

/**
 * API Response wrapper with enhanced metadata
 */
export interface EnhancedAPIResponse<T> {
  data: T
  pagination?: {
    current: number
    next?: number
    prev?: number
    first: number
    last: number
    total?: number
    per_page?: number
  }
  links?: {
    current: string
    next?: string
    prev?: string
    first: string
    last: string
  }
  meta?: {
    total_count?: number
    request_id?: string
    timestamp?: string
    cached?: boolean
  }
}

/**
 * Enhanced Canvas API Error with better error handling
 */
export class EnhancedCanvasAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any,
    public endpoint?: string,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'EnhancedCanvasAPIError'
  }

  isAuthError(): boolean {
    return this.status === 401 || this.status === 403
  }

  isRateLimitError(): boolean {
    return this.status === 429
  }

  isRetryable(): boolean {
    return this.retryable || this.status === 429 || (this.status !== undefined && this.status >= 500)
  }
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  params?: Record<string, any>
  body?: any
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  cache?: boolean
  skipAuth?: boolean
}

/**
 * LRU Cache for API responses with memory management
 */
class APICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number; accessCount: number }>()
  private maxSize: number
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize
    this.startCleanupTimer()
  }

  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    // If cache is full, remove least recently used item
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
    })
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    // Update access count for LRU
    entry.accessCount++
    entry.timestamp = Date.now() // Update access time

    return entry.data
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    let lruKey: string | null = null
    let lruTimestamp = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < lruTimestamp) {
        lruTimestamp = entry.timestamp
        lruKey = key
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey)
    }
  }

  /**
   * Start cleanup timer to remove expired entries
   */
  private startCleanupTimer(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key)
        }
      }
    }, 60000) // Cleanup every minute
  }

  /**
   * Stop cleanup timer
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate: number } {
    const totalAccess = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.accessCount, 0)
    const hitRate = totalAccess > 0 ? (this.cache.size / totalAccess) * 100 : 0

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: Math.round(hitRate * 100) / 100,
    }
  }
}

/**
 * Enhanced Canvas API Client with authentication, caching, and error handling
 */
export class EnhancedCanvasAPIClient {
  private config: EnhancedCanvasAPIConfig
  private cache: APICache
  private requestQueue: Map<string, Promise<any>> = new Map()

  constructor(config: EnhancedCanvasAPIConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      enableCaching: true,
      cacheTimeout: 300000, // 5 minutes
      enableRetry: true,
      enableRateLimit: true,
      ...config,
    }
    this.cache = new APICache()
  }

  /**
   * Generic request method with enhanced features
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    schema: z.ZodSchema<T>
  ): Promise<EnhancedAPIResponse<T>> {
    const {
      method = 'GET',
      params,
      body,
      headers = {},
      timeout = this.config.timeout,
      retries = this.config.retries,
      cache = this.config.enableCaching && method === 'GET',
      skipAuth = false,
    } = options

    // Build URL with parameters
    const url = new URL(`${this.config.baseUrl}/api/v1${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const cacheKey = `${method}:${url.toString()}`

    // Check cache for GET requests
    if (cache && method === 'GET') {
      const cached = this.cache.get(cacheKey)
      if (cached) {
        return {
          data: schema.parse(cached.data),
          meta: { ...cached.meta, cached: true },
          pagination: cached.pagination,
          links: cached.links,
        }
      }
    }

    // Deduplicate identical requests
    if (this.requestQueue.has(cacheKey)) {
      const result = await this.requestQueue.get(cacheKey)!
      return {
        data: schema.parse(result.data),
        meta: result.meta,
        pagination: result.pagination,
        links: result.links,
      }
    }

    // Create request promise
    const requestPromise = this.executeRequest(url.toString(), {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json+canvas-string-ids',
        ...(!skipAuth && this.config.getAccessToken() ? {
          'Authorization': `Bearer ${this.config.getAccessToken()}`
        } : {}),
        ...headers,
      },
      signal: AbortSignal.timeout(timeout!),
    }, retries!)

    this.requestQueue.set(cacheKey, requestPromise)

    try {
      const result = await requestPromise
      
      // Parse and validate response
      const data = schema.parse(result.data)
      const response: EnhancedAPIResponse<T> = {
        data,
        meta: {
          request_id: result.headers?.['x-request-id'],
          timestamp: new Date().toISOString(),
          cached: false,
        },
        pagination: result.pagination,
        links: result.links,
      }

      // Cache successful GET requests
      if (cache && method === 'GET') {
        this.cache.set(cacheKey, result, this.config.cacheTimeout)
      }

      return response
    } finally {
      this.requestQueue.delete(cacheKey)
    }
  }

  /**
   * Execute HTTP request with retry logic
   */
  private async executeRequest(
    url: string,
    options: RequestInit,
    retries: number
  ): Promise<any> {
    let lastError: Error

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options)

        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          this.config.onAuthError?.()
          throw new EnhancedCanvasAPIError(
            'Authentication failed',
            response.status,
            'AUTH_ERROR',
            undefined,
            url,
            false
          )
        }

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000
          
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }
        }

        // Handle other errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new EnhancedCanvasAPIError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData.error_code,
            errorData,
            url,
            response.status >= 500
          )
        }

        // Parse response
        const data = await response.json()
        
        // Extract pagination info from Link header
        const linkHeader = response.headers.get('Link')
        const pagination = this.parsePaginationHeader(linkHeader)

        return {
          data,
          pagination,
          links: this.parseLinkHeader(linkHeader),
          headers: Object.fromEntries(response.headers.entries()),
        }
      } catch (error) {
        lastError = error as Error
        
        // Don't retry non-retryable errors
        if (error instanceof EnhancedCanvasAPIError && !error.isRetryable()) {
          throw error
        }

        // Don't retry on last attempt
        if (attempt === retries) {
          break
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }

  /**
   * Parse Canvas Link header for pagination
   */
  private parsePaginationHeader(linkHeader: string | null): any {
    if (!linkHeader) return undefined

    const links: Record<string, string> = {}
    const parts = linkHeader.split(',')

    parts.forEach(part => {
      const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/)
      if (match) {
        links[match[2]] = match[1]
      }
    })

    return links
  }

  /**
   * Parse Link header into structured format
   */
  private parseLinkHeader(linkHeader: string | null): any {
    if (!linkHeader) return undefined

    const links: Record<string, string> = {}
    const parts = linkHeader.split(',')

    parts.forEach(part => {
      const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/)
      if (match) {
        links[match[2]] = match[1]
      }
    })

    return links
  }

  /**
   * Get courses with enhanced filtering and pagination
   */
  async getCourses(params?: {
    enrollment_type?: string
    enrollment_state?: string
    include?: string[]
    per_page?: number
    page?: number
  }): Promise<EnhancedAPIResponse<any[]>> {
    return this.request('/courses', { params }, z.array(z.any()))
  }

  /**
   * Get course by ID
   */
  async getCourse(courseId: string, include?: string[]): Promise<EnhancedAPIResponse<any>> {
    return this.request(
      `/courses/${courseId}`,
      { params: include ? { include } : undefined },
      z.any()
    )
  }

  /**
   * Get assignments for a course
   */
  async getAssignments(
    courseId: string,
    params?: {
      include?: string[]
      search_term?: string
      override_assignment_dates?: boolean
      needs_grading_count_by_section?: boolean
      bucket?: string
      assignment_ids?: string[]
      order_by?: string
      post_to_sis?: boolean
      new_quizzes?: boolean
      per_page?: number
      page?: number
    }
  ): Promise<EnhancedAPIResponse<any[]>> {
    return this.request(
      `/courses/${courseId}/assignments`,
      { params },
      z.array(z.any())
    )
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string = 'self'): Promise<EnhancedAPIResponse<any>> {
    return this.request(`/users/${userId}/profile`, {}, z.any())
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<EnhancedCanvasAPIConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

/**
 * Create enhanced Canvas API client instance
 */
export function createEnhancedCanvasAPI(config: EnhancedCanvasAPIConfig): EnhancedCanvasAPIClient {
  return new EnhancedCanvasAPIClient(config)
}
