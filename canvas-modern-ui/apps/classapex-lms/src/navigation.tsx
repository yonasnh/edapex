import React from 'react';

const Icon = ({ size = 20, children }: { size?: number; children: React.ReactElement }) =>
  React.cloneElement(children, { width: size, height: size, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5' });

export function DashboardIcon(props: any) { return <Icon {...props}><svg><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg></Icon>; }
export function CourseIcon(props: any) { return <Icon {...props}><svg><path d="M3 16.5A2.5 2.5 0 015.5 14H17"/><path d="M5.5 2H17v15H5.5A2.5 2.5 0 013 14.5v-12A2.5 2.5 0 015.5 2z"/></svg></Icon>; }
export function AssignmentIcon(props: any) { return <Icon {...props}><svg><rect x="3" y="1.5" width="14" height="17" rx="2"/><path d="M7 6h6M7 10h6M7 14h4"/></svg></Icon>; }
export function CalendarIcon(props: any) { return <Icon {...props}><svg><rect x="1.5" y="3" width="17" height="16" rx="2"/><path d="M1.5 7h17"/><path d="M6 1v4M14 1v4"/><path d="M6 11h2M10 11h2M14 11h2M6 14h2M10 14h2M14 14h2"/></svg></Icon>; }
export function ChatIcon(props: any) { return <Icon {...props}><svg><path d="M3 1h14a2 2 0 012 2v10a2 2 0 01-2 2H7l-4 4V3a2 2 0 012-2z"/><path d="M6 7h8M6 10h6"/></svg></Icon>; }
export function FolderIcon(props: any) { return <Icon {...props}><svg><path d="M1.5 4a1 1 0 011-1h5l2 2h7a1 1 0 011 1v10a1 1 0 01-1 1h-14a1 1 0 01-1-1V4z"/></svg></Icon>; }
export function GradeIcon(props: any) { return <Icon {...props}><svg><path d="M10 1l2.5 5L18 6.5l-4 3.5 1 5.5L10 13l-5 2.5 1-5.5-4-3.5L7.5 6 10 1z"/></svg></Icon>; }
export function SettingsIcon(props: any) { return <Icon {...props}><svg><circle cx="10" cy="10" r="2.5"/><path d="M10 1v3M10 16v3M1 10h3M16 10h3M4.5 4.5l2 2M13.5 13.5l2 2M4.5 15.5l2-2M13.5 6.5l2-2"/></svg></Icon>; }
export function AdminIcon(props: any) { return <Icon {...props}><svg><path d="M10 2L3 5v5c0 4.5 3.5 7.5 7 8 3.5-.5 7-3.5 7-8V5l-7-3z"/><circle cx="10" cy="8" r="2"/><path d="M10 10v5M10 12h2.5M10 14h2"/></svg></Icon>; }
export function SlidersIcon(props: any) { return <Icon {...props}><svg><path d="M2 5h16M2 10h16M2 15h16"/><circle cx="6" cy="5" r="2"/><circle cx="14" cy="10" r="2"/><circle cx="8" cy="15" r="2"/></svg></Icon>; }
export function NotificationIcon(props: any) { return <Icon {...props}><svg><path d="M10 2a6 6 0 00-6 6c0 3-1 5-2 6h16c-1-1-2-3-2-6a6 6 0 00-6-6z"/><path d="M8 14a2 2 0 004 0"/></svg></Icon>; }
export function HelpIcon(props: any) { return <Icon {...props}><svg><circle cx="10" cy="10" r="8"/><path d="M8 7.5a2 2 0 114 0c0 1.5-2 2-2 3.5"/><circle cx="10" cy="14" r="0.5" fill="currentColor"/></svg></Icon>; }
export function GroupIcon(props: any) { return <Icon {...props}><svg><path d="M14 17v-1.5a3.5 3.5 0 00-3.5-3.5h-5A3.5 3.5 0 002 15.5V17"/><circle cx="7.5" cy="6" r="3.5"/><path d="M18 17v-1.5a3.5 3.5 0 00-2.5-3.4"/><circle cx="14" cy="6" r="3.5"/></svg></Icon>; }
export function AnalyticsIcon(props: any) { return <Icon {...props}><svg><path d="M2 18h16"/><path d="M5 14l3-5 3 3 4-7"/><circle cx="5" cy="14" r="1.5" fill="currentColor"/><circle cx="11" cy="12" r="1.5" fill="currentColor"/><circle cx="15" cy="5" r="1.5" fill="currentColor"/></svg></Icon>; }
export function UserIcon(props: any) { return <Icon {...props}><svg><path d="M16 17v-1a3 3 0 00-3-3H7a3 3 0 00-3 3v1"/><circle cx="10" cy="6" r="3"/></svg></Icon>; }
export function BookmarkIcon(props: any) { return <Icon {...props}><svg><path d="M5 1h10a1 1 0 011 1v16l-6-4-6 4V2a1 1 0 011-1z"/></svg></Icon>; }
export function ReportIcon(props: any) { return <Icon {...props}><svg><path d="M12 2H5a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1V7l-4-5z"/><path d="M12 2v5h5"/><path d="M7 12h6M7 9h6M7 15h3"/></svg></Icon>; }
export function CloudIcon(props: any) { return <Icon {...props}><svg><path d="M15 8.5A5 5 0 005 9a3.5 3.5 0 000 7h10a4 4 0 000-8z"/></svg></Icon>; }
export function EducationIcon(props: any) { return <Icon {...props}><svg><path d="M10 1L1 6l9 5 9-5-9-5z"/><path d="M1 6v5"/><path d="M18 6v5"/><path d="M4 8.5v3.5l6 3 6-3V8.5"/></svg></Icon>; }
export function InboxIcon(props: any) { return <Icon {...props}><svg><rect x="2" y="3" width="16" height="14" rx="2"/><path d="M2 5l8 5 8-5"/></svg></Icon>; }
export function PlannerIcon(props: any) { return <Icon {...props}><svg><rect x="3" y="2" width="14" height="16" rx="2"/><path d="M7 6h6"/><path d="M7 10h6"/><path d="M7 14h4"/><path d="M6 2V0M14 2V0"/></svg></Icon>; }
export function ClipboardIcon(props: any) { return <Icon {...props}><svg><rect x="4" y="3" width="12" height="15" rx="1"/><path d="M8 1h4a1 1 0 011 1v1H7V2a1 1 0 011-1z"/><path d="M8 8h4M8 11h4M8 14h2"/></svg></Icon>; }
export function PaletteIcon(props: any) { return <Icon {...props}><svg><circle cx="10" cy="10" r="8"/><circle cx="7" cy="7" r="1" fill="currentColor"/><circle cx="13" cy="7" r="1" fill="currentColor"/><circle cx="10" cy="13" r="1" fill="currentColor"/><path d="M14 11c-1 0-2 1-2 2"/><path d="M6 11c1 0 2 1 2 2"/></svg></Icon>; }
export function BuildingIcon(props: any) { return <Icon {...props}><svg><rect x="3" y="2" width="14" height="16" rx="2"/><path d="M7 6h2M11 6h2M7 9h2M11 9h2M7 12h2M11 12h2"/></svg></Icon>; }
export function FlagIcon(props: any) { return <Icon {...props}><svg><path d="M4 17V3h8l1 2h4v9H9l-1-2H4z"/></svg></Icon>; }
export function ShieldIcon(props: any) { return <Icon {...props}><svg><path d="M10 1l7 3v5c0 4.5-3.5 7.5-7 8-3.5-.5-7-3.5-7-8V4l7-3z"/></svg></Icon>; }
export function SearchIcon(props: any) { return <Icon {...props}><svg><circle cx="7.5" cy="7.5" r="4.5"/><path d="M11 11l4 4"/></svg></Icon>; }
export function KeyIcon(props: any) { return <Icon {...props}><svg><path d="M12 7a4 4 0 11-4-4v12l-2-2-2 2-2-2V8a4 4 0 0110-1z"/><circle cx="15" cy="5" r="1.5" fill="currentColor"/></svg></Icon>; }
 
export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  onClick?: () => void;
  badge?: number;
  children?: NavigationItem[];
  roles?: ('student' | 'teacher' | 'ta' | 'observer' | 'admin' | 'designer')[];
  description?: string;
}
 
export const navItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, href: '/dashboard', description: 'Overview of your courses and activities' },
  { id: 'planner', label: 'Task Planner', icon: PlannerIcon, href: '/planner', description: 'Weekly task planner with deadlines', roles: ['student'] },
  {
    id: 'courses', label: 'Courses', icon: CourseIcon, href: '/courses', description: 'Manage and access your courses',
    children: [
      { id: 'all-courses', label: 'All Courses', icon: CourseIcon, href: '/courses', description: 'View all available courses' },
      { id: 'favorites', label: 'Favorites', icon: BookmarkIcon, href: '/courses/favorites', description: 'Your favorite courses' },
      { id: 'recent', label: 'Recent', icon: CloudIcon, href: '/courses/recent', description: 'Recently accessed courses' },
      { id: 'course-catalog', label: 'Course Catalog', icon: SearchIcon, href: '/courses/catalog', description: 'Explore and enroll in public courses' },
    ]
  },
  { id: 'assignments', label: 'Assignments', icon: AssignmentIcon, href: '/assignments', description: 'View and submit assignments', roles: ['student', 'teacher', 'ta', 'admin'] },
  { id: 'grades', label: 'Grades', icon: GradeIcon, href: '/grades', description: 'View grades and feedback', roles: ['student', 'teacher', 'ta', 'observer', 'admin'] },
  { id: 'grading', label: 'Grading Queue', icon: ClipboardIcon, href: '/grading', description: 'Review and grade submissions', roles: ['teacher', 'ta'] },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon, href: '/calendar', description: 'View upcoming events and deadlines' },
  { id: 'inbox', label: 'Inbox', icon: InboxIcon, href: '/inbox', description: 'Messages and conversations' },
  { id: 'discussions', label: 'Discussions', icon: ChatIcon, href: '/discussions', description: 'Participate in course discussions' },
  { id: 'files', label: 'Files', icon: FolderIcon, href: '/files', description: 'Access course files and resources' },
  { id: 'groups', label: 'Groups', icon: GroupIcon, href: '/groups', description: 'Collaborate with study groups', roles: ['student', 'teacher', 'admin'] },
  { id: 'analytics', label: 'Analytics', icon: AnalyticsIcon, href: '/analytics', description: 'View learning analytics and progress', roles: ['teacher', 'admin'] },
  { id: 'reports', label: 'Reports', icon: ReportIcon, href: '/reports', description: 'Generate and view reports', roles: ['teacher', 'admin'] },
  {
    id: 'admin', label: 'Administration', icon: AdminIcon, href: '/admin', description: 'System administration', roles: ['admin'],
    children: [
      { id: 'users', label: 'Users', icon: UserIcon, href: '/admin/users', description: 'Manage accounts and access', roles: ['admin'] },
      { id: 'roles', label: 'Roles & Permissions', icon: ShieldIcon, href: '/admin/roles', description: 'Configure system roles and capabilities', roles: ['admin'] },
      { id: 'sub-accounts', label: 'Sub-Accounts', icon: BuildingIcon, href: '/admin/sub-accounts', description: 'Manage organizational hierarchy', roles: ['admin'] },
      { id: 'courses-admin', label: 'Course Management', icon: EducationIcon, href: '/admin/courses', description: 'Manage courses and enrollments', roles: ['admin'] },
      { id: 'terms', label: 'Academic Terms', icon: CalendarIcon, href: '/admin/terms', description: 'Configure semesters and active periods', roles: ['admin'] },
      { id: 'sis-imports', label: 'SIS Imports', icon: CloudIcon, href: '/admin/sis-imports', description: 'Sync database records using SIS data', roles: ['admin'] },
      { id: 'feature-flags', label: 'Feature Flags', icon: FlagIcon, href: '/admin/feature-flags', description: 'Toggle experimental system capabilities', roles: ['admin'] },
      { id: 'course-settings', label: 'Course Settings Defaults', icon: SettingsIcon, href: '/admin/course-settings', description: 'Establish global classroom configurations', roles: ['admin'] },
      { id: 'system-settings', label: 'System Settings', icon: SlidersIcon, href: '/admin/settings', description: 'Configure system settings', roles: ['admin'] },
      { id: 'developer-keys', label: 'Developer Keys', icon: KeyIcon, href: '/admin/developer-keys', description: 'Manage LTI and API keys', roles: ['admin'] },
      { id: 'auth-providers', label: 'Auth Providers', icon: ShieldIcon, href: '/admin/auth-providers', description: 'Configure SAML, OAuth, and LDAP authentication', roles: ['admin'] },
      { id: 'storage-quotas', label: 'Storage Quotas', icon: CloudIcon, href: '/admin/storage-quotas', description: 'Manage file storage limits for courses, users, and groups', roles: ['admin'] },
      { id: 'assessment', label: 'Institutional Assessment', icon: ReportIcon, href: '/admin/assessment', description: 'Manage global question banks and outcomes', roles: ['admin'] },
      { id: 'blueprint-courses', label: 'Blueprint Courses', icon: CloudIcon, href: '/admin/blueprint-courses', description: 'Manage blueprint templates and course sync', roles: ['admin'] },
      { id: 'theme-branding', label: 'Theme & Branding', icon: PaletteIcon, href: '/admin/branding', description: 'Configure platform visual appearance', roles: ['admin'] },
      { id: 'grade-change-audit', label: 'Grade Change Audit', icon: ShieldIcon, href: '/admin/grade-change-audit', description: 'Review grader modification history', roles: ['admin'] },
      { id: 'global-notifications', label: 'Global Notifications', icon: NotificationIcon, href: '/admin/notifications', description: 'Broadcast global system announcements', roles: ['admin'] },
    ]
  },
  { id: 'eportfolios', label: 'ePortfolios', icon: EducationIcon, href: '/eportfolios', description: 'Curate your learning journey and achievements', roles: ['student'] },
  { id: 'help', label: 'Help & Support', icon: HelpIcon, href: '/help', description: 'Get help and support' },
];

export const filterNavItemsByRole = (items: NavigationItem[], userRole: string): NavigationItem[] =>
  items.filter(item => !item.roles || item.roles.includes(userRole as any))
    .map(item => ({ ...item, children: item.children ? filterNavItemsByRole(item.children, userRole) : undefined }));

export const getNavItemById = (items: NavigationItem[], id: string): NavigationItem | undefined => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) { const f = getNavItemById(item.children, id); if (f) return f; }
  }
  return undefined;
};

export const getBreadcrumbPath = (items: NavigationItem[], targetId: string, path: NavigationItem[] = []): NavigationItem[] | null => {
  for (const item of items) {
    const currentPath = [...path, item];
    if (item.id === targetId) return currentPath;
    if (item.children) { const f = getBreadcrumbPath(item.children, targetId, currentPath); if (f) return f; }
  }
  return null;
};
