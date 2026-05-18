/**
 * ClassApex Canvas API Client
 * ===========================
 * Production-grade API client for Canvas LMS REST API.
 * Handles OAuth2 auth, token refresh, pagination, rate limiting, and retries.
 */

interface ApiClientConfig {
  baseUrl: string
  accessToken?: string
  refreshToken?: string
  onTokenRefresh?: (newToken: string) => void
  onUnauthorized?: () => void
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    current: string | null
    next: string | null
    prev: string | null
    first: string | null
    last: string | null
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | string[]>
  body?: unknown
  retries?: number
}

export class CanvasApiClient {
  private config: ApiClientConfig
  private rateLimitRemaining = 700
  private rateLimitResetAt: Date | null = null

  constructor(config: ApiClientConfig) {
    this.config = config
  }

  /** Update the access token (e.g., after refresh) */
  setAccessToken(token: string) {
    this.config.accessToken = token
  }

  // ─── Core Request Method ───

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, body, retries = 2, ...fetchOptions } = options
    const url = this.buildUrl(endpoint, params)

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    }

    if (this.config.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.accessToken}`
    }

    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    // Rate limit check
    if (this.rateLimitRemaining <= 10 && this.rateLimitResetAt) {
      const waitMs = this.rateLimitResetAt.getTime() - Date.now()
      if (waitMs > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.min(waitMs, 5000)))
      }
    }

    let lastError: Error | null = null
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
        })

        // Track rate limits
        const remaining = response.headers.get('X-Rate-Limit-Remaining')
        if (remaining) this.rateLimitRemaining = parseInt(remaining, 10)
        const reset = response.headers.get('X-Rate-Limit-Reset')
        if (reset) this.rateLimitResetAt = new Date(reset)

        // Handle 401 — attempt token refresh
        if (response.status === 401 && attempt === 0 && this.config.refreshToken) {
          await this.refreshAccessToken()
          headers['Authorization'] = `Bearer ${this.config.accessToken}`
          continue
        }

        if (response.status === 401) {
          this.config.onUnauthorized?.()
          throw new CanvasApiError('Unauthorized', 401)
        }

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '2', 10)
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
          continue
        }

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}))
          throw new CanvasApiError(
            errorBody.message || `API Error: ${response.status}`,
            response.status,
            errorBody
          )
        }

        if (response.status === 204) return undefined as T

        return await response.json()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        if (error instanceof CanvasApiError) throw error
        if (attempt === retries) throw lastError
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
    throw lastError
  }

  // ─── Paginated Request ───

  async requestPaginated<T>(endpoint: string, options: RequestOptions = {}): Promise<PaginatedResponse<T>> {
    const { params, body, retries, ...fetchOptions } = options
    const url = this.buildUrl(endpoint, params)

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    }

    if (this.config.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.accessToken}`
    }

    const response = await fetch(url, { ...fetchOptions, headers })

    if (!response.ok) {
      throw new CanvasApiError(`API Error: ${response.status}`, response.status)
    }

    const data = await response.json()
    const linkHeader = response.headers.get('Link')
    const pagination = this.parseLinkHeader(linkHeader)

    return { data, pagination }
  }

  // ─── Convenience Methods ───

  get<T>(endpoint: string, params?: Record<string, string | number | boolean | string[]>) {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  post<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, { method: 'POST', body })
  }

  put<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, { method: 'PUT', body })
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // ─── Auth ───

  private async refreshAccessToken(): Promise<void> {
    if (!this.config.refreshToken) return

    const response = await fetch(`${this.config.baseUrl}/login/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: this.config.refreshToken,
        client_id: import.meta.env?.VITE_CANVAS_CLIENT_ID,
        client_secret: import.meta.env?.VITE_CANVAS_CLIENT_SECRET,
      }),
    })

    if (!response.ok) {
      this.config.onUnauthorized?.()
      throw new CanvasApiError('Token refresh failed', 401)
    }

    const data = await response.json()
    this.config.accessToken = data.access_token
    this.config.onTokenRefresh?.(data.access_token)
  }

  // ─── Helpers ───

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | string[]>): string {
    const base = endpoint.startsWith('http') ? endpoint : `${this.config.baseUrl}${endpoint}`
    if (!params) return base

    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(`${key}[]`, v))
      } else if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    }
    return `${base}?${searchParams.toString()}`
  }

  private parseLinkHeader(header: string | null) {
    const links: PaginatedResponse<unknown>['pagination'] = {
      current: null, next: null, prev: null, first: null, last: null,
    }
    if (!header) return links

    const parts = header.split(',')
    for (const part of parts) {
      const match = part.match(/<([^>]+)>;\s*rel="(\w+)"/)
      if (match) {
        const [, url, rel] = match
        if (rel in links) {
          (links as Record<string, string | null>)[rel] = url
        }
      }
    }
    return links
  }
}

export class CanvasApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'CanvasApiError'
  }
}

/**
 * Create the default API client instance
 */
export function createApiClient(baseUrl?: string, token?: string): CanvasApiClient {
  return new CanvasApiClient({
    baseUrl: baseUrl || import.meta.env.VITE_CANVAS_API_URL || '',
    accessToken: token || import.meta.env.VITE_CANVAS_API_TOKEN || localStorage.getItem('cx_access_token') || undefined,
    onUnauthorized: () => {
      console.warn('[ClassApex API] 401 Unauthorized — clearing token')
      localStorage.removeItem('cx_access_token')
      // Don't hard-redirect — let React AuthProvider handle the flow
    },
  })
}
