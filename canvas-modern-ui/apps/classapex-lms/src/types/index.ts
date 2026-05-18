// Common interfaces for SchoolApex LMS

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'ta' | 'observer' | 'admin' | 'designer';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  profile?: {
    bio?: string;
    timezone?: string;
    locale?: string;
    pronouns?: string;
  };
}

export interface Course {
  id: string;
  name: string;
  courseCode: string;
  workflowState: string;
  startAt?: string;
  concludeAt?: string;
  createdAt: string;
  isActive: boolean;
  isPublished: boolean;
  studentCount: number;
  teacherCount: number;
  assignmentCount: number;
  syllabusBody?: string;
  imageUrl?: string;
  bannerImageUrl?: string;
  color?: string;
}

export interface Assignment {
  id: string;
  name: string;
  description?: string;
  dueAt?: string;
  pointsPossible: number;
  submissionTypes: string[];
  workflowState: string;
  course: {
    id: string;
    name: string;
  };
  submissionsCount?: number;
  gradedSubmissionsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  id: string;
  assignment: Assignment;
  student: User;
  score?: number;
  grade?: string;
  submittedAt?: string;
  gradedAt?: string;
  feedback?: string;
  workflowState: string;
  late?: boolean;
  missing?: boolean;
  excused?: boolean;
}

export interface File {
  id: string;
  name: string;
  displayName: string;
  contentType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  folderId?: string;
  userId: string;
  courseId?: string;
  isLocked?: boolean;
  isHidden?: boolean;
  downloadCount?: number;
}

export interface Folder {
  id: string;
  name: string;
  fullName: string;
  parentFolderId?: string;
  courseId?: string;
  userId?: string;
  filesCount: number;
  foldersCount: number;
  createdAt: string;
  updatedAt: string;
  isLocked?: boolean;
  isHidden?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  location?: string;
  type: 'assignment' | 'exam' | 'lecture' | 'meeting' | 'deadline' | 'other';
  course?: Course;
  isAllDay: boolean;
  isRecurring: boolean;
  workflowState: string;
  userId?: string;
  attendees?: User[];
  priority?: 'low' | 'medium' | 'high';
}

export interface Discussion {
  id: string;
  title: string;
  message: string;
  author: User;
  course?: Course;
  createdAt: string;
  updatedAt: string;
  lastReplyAt?: string;
  replyCount: number;
  unreadCount: number;
  viewCount: number;
  likeCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isResolved: boolean;
  workflowState: string;
  tags?: string[];
}

export interface DiscussionReply {
  id: string;
  message: string;
  author: User;
  discussionId: string;
  parentReplyId?: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  isLiked: boolean;
  replies?: DiscussionReply[];
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  course?: Course;
  memberCount: number;
  maxMembers?: number;
  isPublic: boolean;
  workflowState: string;
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
  avatar?: string;
  tags?: string[];
  leader?: User;
  members?: User[];
}

export interface GroupMembership {
  id: string;
  userId: string;
  groupId: string;
  role: 'member' | 'leader' | 'admin';
  joinedAt: string;
  isActive: boolean;
}

export interface Report {
  id: string;
  name: string;
  description?: string;
  type: 'student_activity' | 'course_analytics' | 'grade_report' | 'attendance' | 'custom';
  parameters: Record<string, any>;
  generatedAt?: string;
  generatedBy?: User;
  fileUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  courseId?: string;
  isScheduled: boolean;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
}

export interface SystemSettings {
  id: string;
  category: string;
  key: string;
  value: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  isPublic: boolean;
  updatedAt: string;
  updatedBy: User;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Component prop types
export interface LoadingState {
  loading: boolean;
  error?: ApiError;
}

export interface SearchAndFilter {
  searchTerm: string;
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Navigation types
export interface BreadcrumbItem {
  text: string;
  href?: string;
  isCurrentPage?: boolean;
}

export interface ActionButton {
  text: string;
  onClick: () => void;
  kind?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  icon?: React.ComponentType<any>;
  disabled?: boolean;
  loading?: boolean;
}
