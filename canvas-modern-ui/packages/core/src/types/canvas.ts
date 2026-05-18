import { z } from 'zod'

// Core educational entities following Canvas LMS data models

/**
 * User roles in Canvas LMS
 */
export const UserRoleSchema = z.enum([
  'student',
  'teacher',
  'ta',
  'observer',
  'admin',
  'designer',
])

/**
 * Canvas User schema with comprehensive metadata
 */
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar_url: z.string().url().optional(),
  roles: z.array(UserRoleSchema).default([]),
  pronouns: z.string().optional(),
  locale: z.string().default('en'),
  timezone: z.string().default('UTC'),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  bio: z.string().optional(),
  title: z.string().optional(),
})

/**
 * Term/Semester schema
 */
export const TermSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(255),
  start_at: z.coerce.date().nullable(),
  end_at: z.coerce.date().nullable(),
  workflow_state: z.enum(['active', 'deleted']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

/**
 * Course enrollment schema
 */
export const EnrollmentSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  course_id: z.string(),
  role: UserRoleSchema,
  enrollment_state: z.enum(['active', 'invited', 'inactive', 'deleted', 'rejected', 'completed']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

/**
 * Course settings schema
 */
export const CourseSettingsSchema = z.object({
  allow_student_discussion_topics: z.boolean().default(true),
  allow_student_forum_attachments: z.boolean().default(false),
  allow_student_discussion_editing: z.boolean().default(true),
  grading_standard_enabled: z.boolean().default(false),
  grading_standard_id: z.string().nullable().optional(),
  allow_final_grade_override: z.boolean().default(false),
  hide_final_grades: z.boolean().default(false),
  hide_distribution_graphs: z.boolean().default(false),
  lock_all_announcements: z.boolean().default(false),
  restrict_enrollments_to_course_dates: z.boolean().default(false),
})

/**
 * Course permissions schema
 */
export const CoursePermissionsSchema = z.object({
  create_discussion_topic: z.boolean(),
  create_announcement: z.boolean(),
  manage_grades: z.boolean(),
  manage_students: z.boolean(),
  manage_content: z.boolean(),
  manage_course: z.boolean(),
  read_roster: z.boolean(),
  send_messages: z.boolean(),
})

/**
 * Canvas Course schema with comprehensive metadata
 */
export const CourseSchema = z.object({
  id: z.string(),
  name: z.string(),
  course_code: z.string(),
  sis_course_id: z.string().optional(),
  term: TermSchema.default({
    id: '',
    name: 'Default Term',
    start_at: null,
    end_at: null,
    workflow_state: 'active',
    created_at: new Date(),
    updated_at: new Date(),
  }),
  workflow_state: z.enum(['unpublished', 'available', 'completed', 'deleted']),
  enrollments: z.array(EnrollmentSchema).default([]),
  settings: CourseSettingsSchema.default({
    allow_student_discussion_topics: true,
    allow_student_forum_attachments: false,
    allow_student_discussion_editing: true,
    grading_standard_enabled: false,
    grading_standard_id: null,
    allow_final_grade_override: false,
    hide_final_grades: false,
    hide_distribution_graphs: false,
    lock_all_announcements: false,
    restrict_enrollments_to_course_dates: false,
  }),
  permissions: CoursePermissionsSchema.default({
    create_discussion_topic: false,
    create_announcement: false,
    manage_grades: false,
    manage_students: false,
    manage_content: false,
    manage_course: false,
    read_roster: false,
    send_messages: false,
  }),
  start_at: z.coerce.date().nullable(),
  end_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

/**
 * Assignment group schema
 */
export const AssignmentGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  position: z.number().int().min(1),
  group_weight: z.number().min(0).max(100),
  course_id: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date(),
})

/**
 * Assignment schema with Canvas-specific fields
 */
export const AssignmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  due_at: z.date().nullable(),
  unlock_at: z.date().nullable(),
  lock_at: z.date().nullable(),
  points_possible: z.number().min(0).nullable(),
  grading_type: z.enum(['pass_fail', 'percent', 'letter_grade', 'gpa_scale', 'points']),
  submission_types: z.array(
    z.enum(['online_text_entry', 'online_upload', 'online_url', 'media_recording', 'none'])
  ),
  workflow_state: z.enum(['published', 'unpublished', 'deleted']),
  course_id: z.string().uuid(),
  assignment_group_id: z.string().uuid(),
  position: z.number().int().min(1),
  peer_reviews: z.boolean().default(false),
  automatic_peer_reviews: z.boolean().default(false),
  grade_group_students_individually: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date(),
})

/**
 * Submission schema
 */
export const SubmissionSchema = z.object({
  id: z.string().uuid(),
  assignment_id: z.string().uuid(),
  user_id: z.string().uuid(),
  submitted_at: z.date().nullable(),
  score: z.number().nullable(),
  grade: z.string().nullable(),
  workflow_state: z.enum(['submitted', 'unsubmitted', 'graded', 'pending_review']),
  submission_type: z
    .enum(['online_text_entry', 'online_upload', 'online_url', 'media_recording'])
    .nullable(),
  body: z.string().optional(),
  url: z.string().url().optional(),
  attachments: z.array(z.string()).default([]),
  created_at: z.date(),
  updated_at: z.date(),
})

// Type exports
export type UserRole = z.infer<typeof UserRoleSchema>
export type User = z.infer<typeof UserSchema>
export type Term = z.infer<typeof TermSchema>
export type Enrollment = z.infer<typeof EnrollmentSchema>
export type CourseSettings = z.infer<typeof CourseSettingsSchema>
export type CoursePermissions = z.infer<typeof CoursePermissionsSchema>
export type Course = z.infer<typeof CourseSchema>
export type AssignmentGroup = z.infer<typeof AssignmentGroupSchema>
export type Assignment = z.infer<typeof AssignmentSchema>
export type Submission = z.infer<typeof SubmissionSchema>

/**
 * Attachment schema
 */
export const AttachmentSchema = z.object({
  id: z.string(),
  uuid: z.string(),
  folder_id: z.string().optional(),
  display_name: z.string(),
  filename: z.string(),
  content_type: z.string(),
  url: z.string(),
  size: z.number(),
  created_at: z.date(),
  updated_at: z.date(),
  unlock_at: z.date().nullable(),
  locked: z.boolean().default(false),
  hidden: z.boolean().default(false),
  lock_at: z.date().nullable(),
  locked_for_user: z.boolean().default(false),
  hidden_for_user: z.boolean().default(false),
  thumbnail_url: z.string().optional(),
  modified_at: z.date(),
  mime_class: z.string(),
  media_entry_id: z.string().optional(),
})

export type Attachment = z.infer<typeof AttachmentSchema>

/**
 * Discussion Topic schema
 */
export const DiscussionTopicSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string().optional(),
  html_url: z.string(),
  posted_at: z.date().nullable(),
  last_reply_at: z.date().nullable(),
  require_initial_post: z.boolean().default(false),
  user_can_see_posts: z.boolean().default(true),
  discussion_subentry_count: z.number().default(0),
  read_state: z.enum(['read', 'unread']).default('unread'),
  unread_count: z.number().default(0),
  subscribed: z.boolean().default(false),
  subscription_hold: z.string().optional(),
  assignment_id: z.string().optional(),
  delayed_post_at: z.date().nullable(),
  published: z.boolean().default(true),
  lock_at: z.date().nullable(),
  locked: z.boolean().default(false),
  pinned: z.boolean().default(false),
  locked_for_user: z.boolean().default(false),
  lock_info: z.object({
    asset_string: z.string(),
    unlock_at: z.date().nullable(),
    lock_at: z.date().nullable(),
    context_module: z.object({
      id: z.string(),
      name: z.string(),
    }).optional(),
  }).optional(),
  lock_explanation: z.string().optional(),
  user_name: z.string().optional(),
  topic_children: z.array(z.string()).default([]),
  group_topic_children: z.array(z.object({
    id: z.string(),
    group_id: z.string(),
  })).default([]),
  root_topic_id: z.string().optional(),
  podcast_url: z.string().optional(),
  discussion_type: z.enum(['side_comment', 'threaded', 'not_threaded', 'flat']).default('threaded'),
  group_category_id: z.string().optional(),
  attachments: z.array(AttachmentSchema).default([]),
  permissions: z.object({
    attach: z.boolean().default(false),
    update: z.boolean().default(false),
    reply: z.boolean().default(false),
    delete: z.boolean().default(false),
  }).default({
    attach: false,
    update: false,
    reply: false,
    delete: false,
  }),
  allow_rating: z.boolean().default(false),
  only_graders_can_rate: z.boolean().default(false),
  sort_by_rating: z.boolean().default(false),
  is_announcement: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date(),
})

/**
 * Discussion Entry schema
 */
export const DiscussionEntrySchema = z.object({
  id: z.string(),
  user_id: z.string(),
  parent_id: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  rating_count: z.number().default(0),
  rating_sum: z.number().default(0),
  user: UserSchema,
  read_state: z.enum(['read', 'unread']).default('unread'),
  forced_read_state: z.boolean().default(false),
  message: z.string(),
  user_name: z.string().optional(),
  has_more_replies: z.boolean().default(false),
  editor_id: z.string().optional(),
  edited_at: z.date().optional(),
  user_rating: z.number().optional(),
  attachment: AttachmentSchema.optional(),
  replies: z.array(z.any()).default([]), // Use z.any() to avoid circular reference
  recent_replies: z.array(z.any()).default([]), // Use z.any() to avoid circular reference
})

export type DiscussionTopic = z.infer<typeof DiscussionTopicSchema>
export type DiscussionEntry = z.infer<typeof DiscussionEntrySchema> & {
  replies: DiscussionEntry[]
  recent_replies: DiscussionEntry[]
}

/**
 * Calendar Event schema
 */
export const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  start_at: z.date(),
  end_at: z.date().optional(),
  all_day: z.boolean().default(false),
  location_name: z.string().optional(),
  location_address: z.string().optional(),
  context_code: z.string(), // e.g., "course_123", "user_456"
  context_name: z.string().optional(),
  workflow_state: z.enum(['active', 'locked', 'deleted']).default('active'),
  hidden: z.boolean().default(false),
  parent_event_id: z.string().optional(),
  child_events_count: z.number().default(0),
  child_events: z.array(z.any()).default([]), // Use z.any() to avoid circular reference
  url: z.string().optional(),
  html_url: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  appointment_group_id: z.string().optional(),
  appointment_group_url: z.string().optional(),
  own_reservation: z.boolean().default(false),
  reserve_url: z.string().optional(),
  reserved: z.boolean().default(false),
  participant_type: z.enum(['User', 'Group']).optional(),
  participants_per_appointment: z.number().optional(),
  available_slots: z.number().optional(),
  user: UserSchema.optional(),
  group: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  important_dates: z.boolean().default(false),
  series_uuid: z.string().optional(),
  rrule: z.string().optional(), // Recurrence rule
  series_head: z.boolean().default(false),
  blackout_date: z.boolean().default(false),
  event_type: z.enum([
    'assignment',
    'discussion_topic',
    'quiz',
    'calendar_event',
    'announcement',
    'course',
    'appointment_group'
  ]).default('calendar_event'),
  assignment: AssignmentSchema.optional(),
  assignment_overrides: z.array(z.object({
    id: z.string(),
    assignment_id: z.string(),
    student_ids: z.array(z.string()).optional(),
    group_id: z.string().optional(),
    course_section_id: z.string().optional(),
    title: z.string(),
    due_at: z.date().nullable(),
    unlock_at: z.date().nullable(),
    lock_at: z.date().nullable(),
  })).default([]),
  duplicates: z.array(z.object({
    context_code: z.string(),
    context_name: z.string(),
  })).default([]),
  effective_context_code: z.string().optional(),
  lock_at: z.date().nullable(),
  delayed_post_at: z.date().nullable(),
})

export type CalendarEvent = z.infer<typeof CalendarEventSchema> & {
  child_events: CalendarEvent[]
}

/**
 * File/Folder schema for Canvas Files API
 */
export const FileSchema = z.object({
  id: z.string(),
  uuid: z.string(),
  folder_id: z.string().optional(),
  display_name: z.string(),
  filename: z.string(),
  content_type: z.string(),
  url: z.string(),
  size: z.number(),
  created_at: z.date(),
  updated_at: z.date(),
  unlock_at: z.date().nullable(),
  locked: z.boolean().default(false),
  hidden: z.boolean().default(false),
  lock_at: z.date().nullable(),
  locked_for_user: z.boolean().default(false),
  hidden_for_user: z.boolean().default(false),
  thumbnail_url: z.string().optional(),
  modified_at: z.date(),
  mime_class: z.string(),
  media_entry_id: z.string().optional(),
  category: z.enum(['image', 'video', 'audio', 'document', 'text', 'code', 'archive', 'other']).optional(),
  preview_url: z.string().optional(),
  usage_rights: z.object({
    use_justification: z.string(),
    legal_copyright: z.string().optional(),
    license: z.string().optional(),
  }).optional(),
})

export const FolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  full_name: z.string(),
  context_id: z.string(),
  context_type: z.string(),
  parent_folder_id: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  lock_at: z.date().nullable(),
  unlock_at: z.date().nullable(),
  position: z.number().optional(),
  locked: z.boolean().default(false),
  folders_url: z.string(),
  files_url: z.string(),
  files_count: z.number().default(0),
  folders_count: z.number().default(0),
  hidden: z.boolean().default(false),
  locked_for_user: z.boolean().default(false),
  hidden_for_user: z.boolean().default(false),
  for_submissions: z.boolean().default(false),
  can_upload: z.boolean().default(false),
})

export type File = z.infer<typeof FileSchema>
export type Folder = z.infer<typeof FolderSchema>

/**
 * Notification schema
 */
export const NotificationSchema = z.object({
  id: z.string(),
  type: z.enum(['assignment', 'grade', 'discussion', 'announcement', 'calendar', 'system', 'message']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  title: z.string(),
  message: z.string(),
  html_message: z.string().optional(),
  icon: z.string().optional(),
  action_url: z.string().optional(),
  action_text: z.string().optional(),
  read: z.boolean().default(false),
  dismissed: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date(),
  expires_at: z.date().optional(),
  context: z.object({
    course_id: z.string().optional(),
    assignment_id: z.string().optional(),
    discussion_id: z.string().optional(),
    user_id: z.string().optional(),
  }).optional(),
  metadata: z.record(z.any()).optional(),
})

export const NotificationPreferencesSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  notification_type: z.string(),
  delivery_method: z.enum(['web', 'email', 'sms', 'push']),
  enabled: z.boolean().default(true),
  frequency: z.enum(['immediate', 'daily', 'weekly', 'never']).default('immediate'),
  quiet_hours: z.object({
    enabled: z.boolean().default(false),
    start_time: z.string(), // HH:MM format
    end_time: z.string(), // HH:MM format
    timezone: z.string(),
  }).optional(),
  created_at: z.date(),
  updated_at: z.date(),
})

export type Notification = z.infer<typeof NotificationSchema>
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>

/**
 * Canvas API Error types
 */
export class CanvasApiError extends Error {
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

/**
 * Canvas API Response wrapper
 */
export interface CanvasApiResponse<T> {
  data: T
  meta?: {
    total?: number
    page?: number
    per_page?: number
    has_more?: boolean
  }
  links?: {
    next?: string
    prev?: string
    first?: string
    last?: string
  }
}

/**
 * Course filters for API queries
 */
export interface CourseFilters {
  enrollment_type?: 'teacher' | 'student' | 'ta' | 'observer' | 'designer'
  enrollment_state?: 'active' | 'invited' | 'completed'
  include?: Array<'term' | 'course_progress' | 'storage_quota_used_mb' | 'total_students'>
  state?: Array<'unpublished' | 'available' | 'completed' | 'deleted'>
  search_term?: string
  per_page?: number
  page?: number
}

/**
 * Assignment filters for API queries
 */
export interface AssignmentFilters {
  include?: Array<'submission' | 'assignment_visibility' | 'overrides' | 'observed_users'>
  search_term?: string
  order_by?: 'position' | 'name' | 'due_at' | 'created_at'
  per_page?: number
  page?: number
}
