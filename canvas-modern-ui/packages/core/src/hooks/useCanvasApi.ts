/**
 * ClassApex React Hooks for Canvas API
 * =====================================
 * TanStack-Query-style hooks for fetching Canvas data.
 * These are framework-agnostic wrappers that work with any API client.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { createApiClient, type CanvasApiClient } from '../api/canvas-client'

// ─── Singleton client ───
let _client: CanvasApiClient | null = null
function getClient(): CanvasApiClient {
  if (!_client) _client = createApiClient()
  return _client
}

// ─── Generic Query Hook ───

interface UseCanvasQueryOptions<T> {
  enabled?: boolean
  refetchInterval?: number
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface UseCanvasQueryResult<T> {
  data: T | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useCanvasQuery<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | string[]>,
  options: UseCanvasQueryOptions<T> = {}
): UseCanvasQueryResult<T> {
  const { enabled = true, refetchInterval, onSuccess, onError } = options
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return
    setIsLoading(true)
    setIsError(false)
    setError(null)

    try {
      const result = await getClient().get<T>(endpoint, params)
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      setIsError(true)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, JSON.stringify(params), enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(fetchData, refetchInterval)
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
    return undefined
  }, [refetchInterval, enabled, fetchData])

  return { data, isLoading, isError, error, refetch: fetchData }
}

// ─── Mutation Hook ───

interface UseCanvasMutationResult<TData, TInput> {
  mutate: (input: TInput) => Promise<TData | null>
  data: TData | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  reset: () => void
}

export function useCanvasMutation<TData, TInput = unknown>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST'
): UseCanvasMutationResult<TData, TInput> {
  const [data, setData] = useState<TData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(async (input: TInput): Promise<TData | null> => {
    setIsLoading(true)
    setIsError(false)
    setError(null)

    try {
      let result: TData
      switch (method) {
        case 'POST':
          result = await getClient().post<TData>(endpoint, input)
          break
        case 'PUT':
          result = await getClient().put<TData>(endpoint, input)
          break
        case 'DELETE':
          result = await getClient().delete<TData>(endpoint)
          break
      }
      setData(result!)
      return result!
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      setIsError(true)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, method])

  const reset = useCallback(() => {
    setData(null)
    setIsLoading(false)
    setIsError(false)
    setError(null)
  }, [])

  return { mutate, data, isLoading, isError, error, reset }
}

// ─── Domain-Specific Hooks ───

export function useCurrentUser() {
  return useCanvasQuery<any>('/api/v1/users/self', {
    include: 'avatar_url,bio,locale,permissions',
  } as any)
}

export function useCourses(params?: { per_page?: number; page?: number }) {
  return useCanvasQuery<any[]>('/api/v1/courses', {
    per_page: params?.per_page || 20,
    page: params?.page || 1,
    include: ['term', 'total_students', 'teachers', 'course_image', 'course_progress'],
  } as any)
}

export function useCourse(courseId: string | number) {
  return useCanvasQuery<any>(`/api/v1/courses/${courseId}`, {
    include: ['syllabus_body', 'term', 'course_progress', 'total_students', 'teachers'],
  } as any, { enabled: !!courseId })
}

export function useAssignments(courseId: string | number, params?: { per_page?: number }) {
  return useCanvasQuery<any[]>(`/api/v1/courses/${courseId}/assignments`, {
    per_page: params?.per_page || 30,
    include: ['submission', 'score_statistics'],
    order_by: 'due_at',
  } as any, { enabled: !!courseId })
}

export function useModules(courseId: string | number) {
  return useCanvasQuery<any[]>(`/api/v1/courses/${courseId}/modules`, {
    include: ['items', 'content_details'],
    per_page: 50,
  } as any, { enabled: !!courseId })
}

export function useTodoItems() {
  return useCanvasQuery<any[]>('/api/v1/users/self/todo', { per_page: 20 } as any)
}

export function useUpcomingEvents() {
  return useCanvasQuery<any[]>('/api/v1/users/self/upcoming_events')
}

export function useActivityStream() {
  return useCanvasQuery<any[]>('/api/v1/users/self/activity_stream', { per_page: 20 } as any)
}
