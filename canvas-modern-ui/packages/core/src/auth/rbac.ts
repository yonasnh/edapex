/**
 * ClassApex RBAC (Role-Based Access Control)
 * ===========================================
 * Fine-grained permission system mapping Canvas roles
 * to UI capabilities.
 */

export type CanvasRole = 'student' | 'teacher' | 'ta' | 'observer' | 'admin' | 'designer'

export interface Permission {
  // Course
  viewCourse: boolean
  editCourse: boolean
  deleteCourse: boolean
  createCourse: boolean

  // Content
  viewContent: boolean
  createContent: boolean
  editContent: boolean
  deleteContent: boolean
  publishContent: boolean

  // Assignments
  viewAssignments: boolean
  createAssignments: boolean
  gradeSubmissions: boolean
  viewAllSubmissions: boolean

  // Grades
  viewOwnGrades: boolean
  viewAllGrades: boolean
  editGrades: boolean
  postGrades: boolean

  // Users
  viewRoster: boolean
  manageUsers: boolean
  masqueradeUsers: boolean

  // Discussions
  createDiscussions: boolean
  moderateDiscussions: boolean

  // Admin
  viewAdmin: boolean
  manageAccount: boolean
  viewReports: boolean
  viewAnalytics: boolean
  manageLTI: boolean

  // Files
  uploadFiles: boolean
  manageFiles: boolean
}

const ROLE_PERMISSIONS: Record<CanvasRole, Permission> = {
  student: {
    viewCourse: true, editCourse: false, deleteCourse: false, createCourse: false,
    viewContent: true, createContent: false, editContent: false, deleteContent: false, publishContent: false,
    viewAssignments: true, createAssignments: false, gradeSubmissions: false, viewAllSubmissions: false,
    viewOwnGrades: true, viewAllGrades: false, editGrades: false, postGrades: false,
    viewRoster: true, manageUsers: false, masqueradeUsers: false,
    createDiscussions: true, moderateDiscussions: false,
    viewAdmin: false, manageAccount: false, viewReports: false, viewAnalytics: false, manageLTI: false,
    uploadFiles: true, manageFiles: false,
  },
  teacher: {
    viewCourse: true, editCourse: true, deleteCourse: false, createCourse: true,
    viewContent: true, createContent: true, editContent: true, deleteContent: true, publishContent: true,
    viewAssignments: true, createAssignments: true, gradeSubmissions: true, viewAllSubmissions: true,
    viewOwnGrades: true, viewAllGrades: true, editGrades: true, postGrades: true,
    viewRoster: true, manageUsers: true, masqueradeUsers: false,
    createDiscussions: true, moderateDiscussions: true,
    viewAdmin: false, manageAccount: false, viewReports: true, viewAnalytics: true, manageLTI: false,
    uploadFiles: true, manageFiles: true,
  },
  ta: {
    viewCourse: true, editCourse: false, deleteCourse: false, createCourse: false,
    viewContent: true, createContent: true, editContent: true, deleteContent: false, publishContent: false,
    viewAssignments: true, createAssignments: false, gradeSubmissions: true, viewAllSubmissions: true,
    viewOwnGrades: true, viewAllGrades: true, editGrades: true, postGrades: false,
    viewRoster: true, manageUsers: false, masqueradeUsers: false,
    createDiscussions: true, moderateDiscussions: true,
    viewAdmin: false, manageAccount: false, viewReports: false, viewAnalytics: true, manageLTI: false,
    uploadFiles: true, manageFiles: true,
  },
  observer: {
    viewCourse: true, editCourse: false, deleteCourse: false, createCourse: false,
    viewContent: true, createContent: false, editContent: false, deleteContent: false, publishContent: false,
    viewAssignments: true, createAssignments: false, gradeSubmissions: false, viewAllSubmissions: false,
    viewOwnGrades: true, viewAllGrades: false, editGrades: false, postGrades: false,
    viewRoster: false, manageUsers: false, masqueradeUsers: false,
    createDiscussions: false, moderateDiscussions: false,
    viewAdmin: false, manageAccount: false, viewReports: false, viewAnalytics: false, manageLTI: false,
    uploadFiles: false, manageFiles: false,
  },
  admin: {
    viewCourse: true, editCourse: true, deleteCourse: true, createCourse: true,
    viewContent: true, createContent: true, editContent: true, deleteContent: true, publishContent: true,
    viewAssignments: true, createAssignments: true, gradeSubmissions: true, viewAllSubmissions: true,
    viewOwnGrades: true, viewAllGrades: true, editGrades: true, postGrades: true,
    viewRoster: true, manageUsers: true, masqueradeUsers: true,
    createDiscussions: true, moderateDiscussions: true,
    viewAdmin: true, manageAccount: true, viewReports: true, viewAnalytics: true, manageLTI: true,
    uploadFiles: true, manageFiles: true,
  },
  designer: {
    viewCourse: true, editCourse: true, deleteCourse: false, createCourse: false,
    viewContent: true, createContent: true, editContent: true, deleteContent: true, publishContent: true,
    viewAssignments: true, createAssignments: true, gradeSubmissions: false, viewAllSubmissions: false,
    viewOwnGrades: false, viewAllGrades: false, editGrades: false, postGrades: false,
    viewRoster: true, manageUsers: false, masqueradeUsers: false,
    createDiscussions: true, moderateDiscussions: false,
    viewAdmin: false, manageAccount: false, viewReports: false, viewAnalytics: false, manageLTI: false,
    uploadFiles: true, manageFiles: true,
  },
}

/**
 * Get permissions for a given role
 */
export function getPermissions(role: CanvasRole): Permission {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.student
}

/**
 * Get merged permissions for a user with multiple roles.
 * Uses OR logic — if any role grants a permission, the user has it.
 */
export function getMergedPermissions(roles: CanvasRole[]): Permission {
  if (roles.length === 0) return ROLE_PERMISSIONS.student

  const merged = { ...ROLE_PERMISSIONS.student }

  for (const role of roles) {
    const perms = ROLE_PERMISSIONS[role]
    if (!perms) continue
    for (const key of Object.keys(merged) as (keyof Permission)[]) {
      if (perms[key]) (merged as any)[key] = true
    }
  }

  return merged
}

/**
 * Check if a user with given roles has a specific permission
 */
export function hasPermission(roles: CanvasRole[], permission: keyof Permission): boolean {
  return getMergedPermissions(roles)[permission]
}

/**
 * React hook for permission checking
 */
import { useMemo } from 'react'

export function usePermissions(roles: CanvasRole[]) {
  const permissions = useMemo(() => getMergedPermissions(roles), [roles.join(',')])

  const can = useCallback(
    (permission: keyof Permission) => permissions[permission],
    [permissions]
  )

  return { permissions, can }
}

import { useCallback } from 'react'
