/**
 * ClassApex Canvas API Service Layer
 * ====================================
 * Domain-specific API methods that wrap the core CanvasApiClient.
 * Each method maps directly to a Canvas REST API endpoint.
 */

import { createApiClient, CanvasApiClient } from './canvas-client'

let _client: CanvasApiClient | null = null
function client(): CanvasApiClient {
  if (!_client) _client = createApiClient()
  return _client
}

// ═══════════════════════════════════════
// COURSES
// ═══════════════════════════════════════

export const coursesApi = {
  list: (params?: {
    per_page?: number
    page?: number
    enrollment_type?: string
    enrollment_state?: string
    state?: string[]
  }) =>
    client().get<any[]>('/api/v1/courses', {
      per_page: params?.per_page || 20,
      include: ['term', 'total_students', 'teachers', 'course_image', 'course_progress', 'sections', 'storage_quota_used_mb'],
      ...params,
    }),

  get: (id: string | number) =>
    client().get<any>(`/api/v1/courses/${id}`, {
      include: ['syllabus_body', 'term', 'course_progress', 'total_students', 'teachers', 'tabs', 'course_image'],
    }),

  create: (accountId: string, data: any) =>
    client().post<any>(`/api/v1/accounts/${accountId}/courses`, { course: data }),

  update: (id: string | number, data: any) =>
    client().put<any>(`/api/v1/courses/${id}`, { course: data }),

  delete: (id: string | number) =>
    client().delete(`/api/v1/courses/${id}`, ),

  favorites: () =>
    client().get<any[]>('/api/v1/users/self/favorites/courses', {
      include: ['term', 'total_students', 'teachers', 'course_image'],
    }),

  addFavorite: (courseId: string | number) =>
    client().post(`/api/v1/users/self/favorites/courses/${courseId}`),

  removeFavorite: (courseId: string | number) =>
    client().delete(`/api/v1/users/self/favorites/courses/${courseId}`),

  tabs: (courseId: string | number) =>
    client().get<any[]>(`/api/v1/courses/${courseId}/tabs`),

  users: (courseId: string | number, params?: { enrollment_type?: string[]; per_page?: number }) =>
    client().get<any[]>(`/api/v1/courses/${courseId}/users`, {
      include: ['avatar_url', 'enrollments', 'email'],
      ...params,
    }),
}

// ═══════════════════════════════════════
// ASSIGNMENTS
// ═══════════════════════════════════════

export const assignmentsApi = {
  list: (courseId: string | number, params?: { per_page?: number; order_by?: string }) =>
    client().get<any[]>(`/api/v1/courses/${courseId}/assignments`, {
      include: ['submission', 'score_statistics', 'overrides', 'assignment_visibility'],
      order_by: 'due_at',
      per_page: 30,
      ...params,
    }),

  get: (courseId: string | number, assignmentId: string | number) =>
    client().get<any>(`/api/v1/courses/${courseId}/assignments/${assignmentId}`, {
      include: ['submission', 'rubric_assessment', 'score_statistics'],
    }),

  create: (courseId: string | number, data: any) =>
    client().post<any>(`/api/v1/courses/${courseId}/assignments`, { assignment: data }),

  update: (courseId: string | number, assignmentId: string | number, data: any) =>
    client().put<any>(`/api/v1/courses/${courseId}/assignments/${assignmentId}`, { assignment: data }),

  delete: (courseId: string | number, assignmentId: string | number) =>
    client().delete(`/api/v1/courses/${courseId}/assignments/${assignmentId}`),

  groups: (courseId: string | number) =>
    client().get<any[]>(`/api/v1/courses/${courseId}/assignment_groups`, {
      include: ['assignments', 'discussion_topic', 'submission'],
    }),
}

// ═══════════════════════════════════════
// SUBMISSIONS
// ═══════════════════════════════════════

export const submissionsApi = {
  list: (courseId: string | number, assignmentId: string | number) =>
    client().get<any[]>(`/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions`, {
      include: ['rubric_assessment', 'submission_comments', 'user'],
    }),

  get: (courseId: string | number, assignmentId: string | number, userId: string | number) =>
    client().get<any>(`/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`, {
      include: ['rubric_assessment', 'submission_comments'],
    }),

  submit: (courseId: string | number, assignmentId: string | number, data: any) =>
    client().post<any>(`/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions`, {
      submission: data,
    }),

  grade: (courseId: string | number, assignmentId: string | number, userId: string | number, data: any) =>
    client().put<any>(`/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`, {
      submission: data,
    }),

  addComment: (courseId: string | number, assignmentId: string | number, userId: string | number, comment: string) =>
    client().put<any>(`/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`, {
      comment: { text_comment: comment },
    }),

  /** Bulk grade fetch for gradebook */
  studentSubmissions: (courseId: string | number, params?: { per_page?: number }) =>
    client().get<any[]>(`/api/v1/courses/${courseId}/students/submissions`, {
      include: ['assignment', 'user', 'rubric_assessment'],
      grouped: true,
      per_page: params?.per_page || 50,
    }),
}

// ═══════════════════════════════════════
// MODULES
// ═══════════════════════════════════════

export const modulesApi = {
  list: (courseId: string | number) =>
    client().get<any[]>(`/api/v1/courses/${courseId}/modules`, {
      include: ['items', 'content_details'],
      per_page: 50,
    }),

  get: (courseId: string | number, moduleId: string | number) =>
    client().get<any>(`/api/v1/courses/${courseId}/modules/${moduleId}`, {
      include: ['items', 'content_details'],
    }),

  items: (courseId: string | number, moduleId: string | number) =>
    client().get<any[]>(`/api/v1/courses/${courseId}/modules/${moduleId}/items`, {
      include: ['content_details'],
    }),

  markDone: (courseId: string | number, moduleId: string | number, itemId: string | number) =>
    client().put(`/api/v1/courses/${courseId}/modules/${moduleId}/items/${itemId}/done`),

  reorder: (courseId: string | number, moduleId: string | number, order: number[]) =>
    client().post(`/api/v1/courses/${courseId}/modules/${moduleId}/reorder`, {
      order: order.map(id => ({ id })),
    }),
}

// ═══════════════════════════════════════
// DISCUSSIONS
// ═══════════════════════════════════════

export const discussionsApi = {
  list: (courseId: string | number, params?: { per_page?: number }) =>
    client().get<any[]>(`/api/v1/courses/${courseId}/discussion_topics`, {
      include: ['sections', 'sections_user_count', 'overrides'],
      order_by: 'recent_activity',
      per_page: params?.per_page || 20,
    }),

  get: (courseId: string | number, topicId: string | number) =>
    client().get<any>(`/api/v1/courses/${courseId}/discussion_topics/${topicId}`),

  fullView: (courseId: string | number, topicId: string | number) =>
    client().get<any>(`/api/v1/courses/${courseId}/discussion_topics/${topicId}/view`),

  create: (courseId: string | number, data: any) =>
    client().post<any>(`/api/v1/courses/${courseId}/discussion_topics`, data),

  reply: (courseId: string | number, topicId: string | number, message: string, parentId?: string) =>
    client().post<any>(`/api/v1/courses/${courseId}/discussion_topics/${topicId}/entries`, {
      message,
      ...(parentId ? { parent_id: parentId } : {}),
    }),

  markAllRead: (courseId: string | number, topicId: string | number) =>
    client().put(`/api/v1/courses/${courseId}/discussion_topics/${topicId}/read_all`),
}

// ═══════════════════════════════════════
// CALENDAR
// ═══════════════════════════════════════

export const calendarApi = {
  events: (params: { start_date?: string; end_date?: string; context_codes?: string[]; per_page?: number }) =>
    client().get<any[]>('/api/v1/calendar_events', {
      type: 'event',
      per_page: params.per_page || 50,
      ...params,
    }),

  assignments: (params: { start_date?: string; end_date?: string; context_codes?: string[] }) =>
    client().get<any[]>('/api/v1/calendar_events', {
      type: 'assignment',
      per_page: 50,
      ...params,
    }),

  create: (data: any) =>
    client().post<any>('/api/v1/calendar_events', { calendar_event: data }),

  update: (eventId: string | number, data: any) =>
    client().put<any>(`/api/v1/calendar_events/${eventId}`, { calendar_event: data }),

  delete: (eventId: string | number) =>
    client().delete(`/api/v1/calendar_events/${eventId}`),
}

// ═══════════════════════════════════════
// CONVERSATIONS (Inbox)
// ═══════════════════════════════════════

export const conversationsApi = {
  list: (params?: { scope?: string; per_page?: number }) =>
    client().get<any[]>('/api/v1/conversations', {
      include: ['participant_avatars'],
      per_page: params?.per_page || 20,
      ...params,
    }),

  get: (id: string | number) =>
    client().get<any>(`/api/v1/conversations/${id}`),

  create: (data: { recipients: string[]; body: string; subject?: string; group_conversation?: boolean }) =>
    client().post<any>('/api/v1/conversations', data),

  reply: (id: string | number, body: string) =>
    client().post<any>(`/api/v1/conversations/${id}/add_message`, { body }),

  searchRecipients: (search: string, context?: string) =>
    client().get<any[]>('/api/v1/search/recipients', {
      search,
      per_page: 10,
      ...(context ? { context } : {}),
    }),
}

// ═══════════════════════════════════════
// DASHBOARD / USER
// ═══════════════════════════════════════

export const dashboardApi = {
  currentUser: () =>
    client().get<any>('/api/v1/users/self', {
      include: ['avatar_url', 'bio', 'locale', 'permissions'],
    }),

  todoItems: () =>
    client().get<any[]>('/api/v1/users/self/todo', { per_page: 20 }),

  upcomingEvents: () =>
    client().get<any[]>('/api/v1/users/self/upcoming_events'),

  activityStream: (perPage?: number) =>
    client().get<any[]>('/api/v1/users/self/activity_stream', { per_page: perPage || 20 }),

  activityStreamSummary: () =>
    client().get<any[]>('/api/v1/users/self/activity_stream/summary'),

  missingSubmissions: () =>
    client().get<any[]>('/api/v1/users/self/missing_submissions', {
      include: ['planner_overrides', 'course'],
      per_page: 20,
    }),

  plannerItems: (params?: { start_date?: string; end_date?: string; per_page?: number }) =>
    client().get<any[]>('/api/v1/planner/items', {
      per_page: params?.per_page || 30,
      ...params,
    }),
}

// ═══════════════════════════════════════
// GRADES
// ═══════════════════════════════════════

export const gradesApi = {
  /** Get all enrollments with grades */
  enrollments: () =>
    client().get<any[]>('/api/v1/users/self/enrollments', {
      include: ['observed_users', 'total_scores'],
      per_page: 50,
    }),

  /** Gradebook history */
  gradebookHistory: (courseId: string | number) =>
    client().get<any>(`/api/v1/courses/${courseId}/gradebook_history/feed`, {
      per_page: 50,
    }),

  /** Grading standards */
  gradingStandards: (courseId: string | number) =>
    client().get<any[]>(`/api/v1/courses/${courseId}/grading_standards`),
}

// ═══════════════════════════════════════
// FILES
// ═══════════════════════════════════════

export const filesApi = {
  list: (courseId: string | number, params?: { per_page?: number; search_term?: string }) =>
    client().get<any[]>(`/api/v1/courses/${courseId}/files`, {
      per_page: params?.per_page || 20,
      ...params,
    }),

  userFiles: (params?: { per_page?: number }) =>
    client().get<any[]>('/api/v1/users/self/files', { per_page: params?.per_page || 20 }),

  folders: (courseId: string | number) =>
    client().get<any[]>(`/api/v1/courses/${courseId}/folders`, { per_page: 50 }),

  get: (fileId: string | number) =>
    client().get<any>(`/api/v1/files/${fileId}`),

  delete: (fileId: string | number) =>
    client().delete(`/api/v1/files/${fileId}`),
}

// ═══════════════════════════════════════
// ANNOUNCEMENTS
// ═══════════════════════════════════════

export const announcementsApi = {
  list: (contextCodes: string[], params?: { per_page?: number; start_date?: string }) =>
    client().get<any[]>('/api/v1/announcements', {
      context_codes: contextCodes,
      per_page: params?.per_page || 20,
      ...params,
    }),
}

// ═══════════════════════════════════════
// GROUPS
// ═══════════════════════════════════════

export const groupsApi = {
  list: () =>
    client().get<any[]>('/api/v1/users/self/groups', {
      include: ['users', 'tabs'],
      per_page: 50,
    }),

  get: (groupId: string | number) =>
    client().get<any>(`/api/v1/groups/${groupId}`, { include: ['users', 'permissions'] }),

  members: (groupId: string | number) =>
    client().get<any[]>(`/api/v1/groups/${groupId}/users`, { include: ['avatar_url'] }),
}

// ═══════════════════════════════════════
// PAGES (Wiki)
// ═══════════════════════════════════════

export const pagesApi = {
  list: (courseId: string | number) =>
    client().get<any[]>(`/api/v1/courses/${courseId}/pages`, {
      sort: 'updated_at',
      order: 'desc',
      per_page: 30,
    }),

  get: (courseId: string | number, pageUrl: string) =>
    client().get<any>(`/api/v1/courses/${courseId}/pages/${pageUrl}`),

  create: (courseId: string | number, data: any) =>
    client().post<any>(`/api/v1/courses/${courseId}/pages`, { wiki_page: data }),

  update: (courseId: string | number, pageUrl: string, data: any) =>
    client().put<any>(`/api/v1/courses/${courseId}/pages/${pageUrl}`, { wiki_page: data }),

  revisions: (courseId: string | number, pageUrl: string) =>
    client().get<any[]>(`/api/v1/courses/${courseId}/pages/${pageUrl}/revisions`),
}

// ═══════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════

export const adminApi = {
  accounts: () =>
    client().get<any[]>('/api/v1/accounts'),

  account: (id: string | number) =>
    client().get<any>(`/api/v1/accounts/${id}`),

  accountUsers: (accountId: string | number, params?: { search_term?: string; per_page?: number }) =>
    client().get<any[]>(`/api/v1/accounts/${accountId}/users`, {
      include: ['avatar_url', 'email', 'last_login'],
      per_page: params?.per_page || 25,
      ...params,
    }),

  accountCourses: (accountId: string | number, params?: { per_page?: number }) =>
    client().get<any[]>(`/api/v1/accounts/${accountId}/courses`, {
      include: ['term', 'total_students', 'teachers'],
      per_page: params?.per_page || 25,
    }),

  terms: (accountId: string | number) =>
    client().get<any>(`/api/v1/accounts/${accountId}/terms`),

  reports: (accountId: string | number) =>
    client().get<any[]>(`/api/v1/accounts/${accountId}/reports`),

  runReport: (accountId: string | number, reportType: string, params?: any) =>
    client().post<any>(`/api/v1/accounts/${accountId}/reports/${reportType}`, params),

  featureFlags: (accountId: string | number) =>
    client().get<any[]>(`/api/v1/accounts/${accountId}/features`),
}
