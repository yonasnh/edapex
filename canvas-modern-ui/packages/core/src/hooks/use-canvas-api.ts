import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { canvasApi } from '../services/canvas-api'
import {
  Course,
  CourseFilters,
  AssignmentFilters,
  User,
  CanvasApiError,
} from '../types/canvas'

/**
 * Query keys for Canvas API queries
 * Follows React Query best practices for cache management
 */
export const canvasQueryKeys = {
  all: ['canvas'] as const,
  users: () => [...canvasQueryKeys.all, 'users'] as const,
  user: (id: string) => [...canvasQueryKeys.users(), id] as const,
  currentUser: () => [...canvasQueryKeys.users(), 'current'] as const,
  courses: () => [...canvasQueryKeys.all, 'courses'] as const,
  coursesList: (filters: CourseFilters) => [...canvasQueryKeys.courses(), 'list', filters] as const,
  course: (id: string) => [...canvasQueryKeys.courses(), id] as const,
  assignments: (courseId: string) => [...canvasQueryKeys.all, 'assignments', courseId] as const,
  assignmentsList: (courseId: string, filters: AssignmentFilters) =>
    [...canvasQueryKeys.assignments(courseId), 'list', filters] as const,
}

/**
 * Hook to get current user information
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: canvasQueryKeys.currentUser(),
    queryFn: () => canvasApi.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook to get courses with filtering and pagination
 */
interface UseCoursesOptions extends CourseFilters {
  enabled?: boolean
  refetchInterval?: number
}

export const useCourses = (options: UseCoursesOptions = {}) => {
  const { enabled = true, refetchInterval = 0, ...filters } = options

  return useQuery({
    queryKey: canvasQueryKeys.coursesList(filters),
    queryFn: () => canvasApi.getCourses(filters),
    enabled: enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime in v5)
    refetchInterval,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook to get a specific course by ID
 */
interface UseCourseOptions {
  include?: string[]
  enabled?: boolean
}

export const useCourse = (courseId: string, options: UseCourseOptions = {}) => {
  const { include, enabled = true } = options

  return useQuery({
    queryKey: canvasQueryKeys.course(courseId),
    queryFn: () => canvasApi.getCourse(courseId, include),
    enabled: enabled && !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook to get assignments for a course
 */
interface UseAssignmentsOptions extends AssignmentFilters {
  enabled?: boolean
  refetchInterval?: number
}

export const useAssignments = (courseId: string, options: UseAssignmentsOptions = {}) => {
  const { enabled = true, refetchInterval = 0, ...filters } = options

  return useQuery({
    queryKey: canvasQueryKeys.assignmentsList(courseId, filters),
    queryFn: () => canvasApi.getAssignments(courseId, filters),
    enabled: enabled && !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime in v5)
    refetchInterval,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook to enroll in a course
 */
export const useEnrollInCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: string) => canvasApi.enrollInCourse(courseId),
    onSuccess: (_data, courseId) => {
      // Invalidate courses list to reflect new enrollment
      queryClient.invalidateQueries({ queryKey: canvasQueryKeys.courses() })

      // Invalidate specific course to update enrollment status
      queryClient.invalidateQueries({ queryKey: canvasQueryKeys.course(courseId) })

      console.log(`Successfully enrolled in course ${courseId}`)
    },
    onError: (error: CanvasApiError, courseId) => {
      console.error(`Failed to enroll in course ${courseId}:`, error)
    },
  })
}

/**
 * Hook for Canvas permissions checking
 */
export const useCanvasPermissions = (course: Course, currentUser: User) => {
  const enrollment = course.enrollments.find(e => e.user_id === currentUser.id)
  const userRole = enrollment?.role

  const permissions = {
    canEnroll: !enrollment && course.workflow_state === 'available',
    canUnenroll: !!enrollment && enrollment.enrollment_state === 'active',
    canManage: userRole === 'teacher' || userRole === 'admin',
    canGrade: userRole === 'teacher' || userRole === 'ta',
    canViewGrades: !!enrollment,
    canCreateContent: userRole === 'teacher' || userRole === 'admin',
    canEditContent: userRole === 'teacher' || userRole === 'admin',
    canViewRoster: course.permissions.read_roster,
    canSendMessages: course.permissions.send_messages,
  }

  return permissions
}

/**
 * Hook for Canvas navigation utilities
 */
export const useCanvasNavigation = () => {
  const navigateToCourse = (courseId: string) => {
    window.location.href = `/courses/${courseId}`
  }

  const navigateToGradebook = (courseId: string) => {
    window.location.href = `/courses/${courseId}/gradebook`
  }

  const navigateToAssignment = (courseId: string, assignmentId: string) => {
    window.location.href = `/courses/${courseId}/assignments/${assignmentId}`
  }

  const navigateToDiscussions = (courseId: string) => {
    window.location.href = `/courses/${courseId}/discussion_topics`
  }

  const navigateToAnnouncements = (courseId: string) => {
    window.location.href = `/courses/${courseId}/announcements`
  }

  return {
    navigateToCourse,
    navigateToGradebook,
    navigateToAssignment,
    navigateToDiscussions,
    navigateToAnnouncements,
  }
}

/**
 * Hook for course filtering and search
 */
export const useCourseFiltering = (courses: Course[]) => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedTerm, setSelectedTerm] = React.useState<string | null>(null)
  const [selectedRole, setSelectedRole] = React.useState<string | null>(null)

  const filteredCourses = React.useMemo(() => {
    return courses.filter(course => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesName = course.name.toLowerCase().includes(searchLower)
        const matchesCode = course.course_code.toLowerCase().includes(searchLower)
        if (!matchesName && !matchesCode) return false
      }

      // Term filter
      if (selectedTerm && course.term.id !== selectedTerm) {
        return false
      }

      // Role filter
      if (selectedRole) {
        const hasRole = course.enrollments.some(enrollment => enrollment.role === selectedRole)
        if (!hasRole) return false
      }

      return true
    })
  }, [courses, searchTerm, selectedTerm, selectedRole])

  return {
    filteredCourses,
    searchTerm,
    setSearchTerm,
    selectedTerm,
    setSelectedTerm,
    selectedRole,
    setSelectedRole,
  }
}
