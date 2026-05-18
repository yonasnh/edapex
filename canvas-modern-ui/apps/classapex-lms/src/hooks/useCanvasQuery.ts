import { useCanvasQuery as useRealCanvasQuery, useCanvasMutation } from '../../../../packages/core/src/hooks/useCanvasApi'
import {
  MOCK_USER,
  MOCK_COURSES,
  MOCK_FAVORITE_COURSES,
  MOCK_TODO_ITEMS,
  MOCK_UPCOMING_EVENTS,
  MOCK_MISSING_SUBMISSIONS,
  MOCK_ACTIVITY_STREAM,
  MOCK_ACTIVITY_STREAM_SUMMARY,
  MOCK_ASSIGNMENTS,
  MOCK_MODULES,
  MOCK_SYLLABUS,
  MOCK_COURSE_PEOPLE,
  MOCK_SEARCH_COURSES,
  MOCK_SEARCH_PEOPLE,
  MOCK_DASHBOARD_STATS,
  MOCK_STUDENTS_GRADES,
  MOCK_ASSIGNMENT_GROUPS,
} from '../mock/canvasData'

export { useCanvasMutation }

type MockResolver = (endpoint: string, params?: Record<string, any>) => any

const mockRegistry: Record<string, MockResolver> = {
  '/api/v1/users/self': () => MOCK_USER,
  '/api/v1/courses': () => MOCK_COURSES,
  '/api/v1/users/self/todo': () => MOCK_TODO_ITEMS,
  '/api/v1/users/self/upcoming_events': () => MOCK_UPCOMING_EVENTS,
  '/api/v1/users/self/missing_submissions': () => MOCK_MISSING_SUBMISSIONS,
  '/api/v1/users/self/activity_stream/summary': () => MOCK_ACTIVITY_STREAM_SUMMARY,
  '/api/v1/users/self/activity_stream': () => MOCK_ACTIVITY_STREAM,
  '/api/v1/users/self/favorites/courses': () => MOCK_FAVORITE_COURSES,
}

function resolveMock(endpoint: string, params?: Record<string, any>): any {
  // By default, return null to hit the LIVE Canvas API for everything.
  // Mocks can be selectively re-enabled here if needed for testing specific states.
  return null
}

export function useCanvasQuery<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | string[]>,
  options?: { enabled?: boolean; refetchInterval?: number; onSuccess?: (data: T) => void; onError?: (error: Error) => void }
): { data: T | null; isLoading: boolean; isError: boolean; error: Error | null; refetch: () => Promise<void> } {
  const mockData = resolveMock(endpoint, params)
  const real = useRealCanvasQuery<T>(endpoint, params, {
    ...options,
    enabled: mockData ? false : options?.enabled ?? true,
  })

  if (mockData !== null) {
    return {
      data: mockData as T,
      isLoading: false,
      isError: false,
      error: null,
      refetch: async () => {},
    }
  }

  return real
}
