/**
 * ClassApex LMS — App Root
 * =========================
 * Integrates the Phase 1 AppShell with:
 *  - TopBar (search, notifications, theme, user menu)
 *  - NotificationDropdown (Canvas activity stream)
 *  - GlobalSearchModal (Cmd+K, Canvas search API)
 *  - Breadcrumb (route-aware)
 *  - NavigationSidebar (role-filtered)
 *  - Full keyboard navigation + focus trapping (S3-10)
 */

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'

// Design system shell components
import { AppShell } from '../../../packages/components/src/ui/layout/AppShell'
import { TopBar } from '../../../packages/components/src/ui/layout/TopBar'
import { NotificationDropdown } from '../../../packages/components/src/ui/layout/NotificationDropdown'
import { Breadcrumb, generateBreadcrumbs } from '../../../packages/components/src/navigation/Breadcrumb'
import { NavigationSidebar } from '@schoolapex/components'
import { TopBarSkeleton } from '../../../packages/components/src/ui/loading/ShellSkeletons'
import { AIAssistantDrawer } from './components/AIAssistantDrawer'

// Canvas API hooks
import { useActivityStream, useCurrentUser, useGlobalSearch, useAccountNotifications } from './hooks/useShellData'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { TenantProvider } from './contexts/TenantContext'
import { navItems, filterNavItemsByRole } from './navigation'
import { AuthProvider, RequireAuth, OAuthCallbackPage, useAuth } from '@schoolapex/core'
import { RoleProvider, useRole } from './contexts/RoleContext'
import { RoleSwitcher } from './components/RoleSwitcher'

// Logo
import { ClassApexLogo } from './components/ClassApexLogo'

// Pages (lazy-loaded)
const Dashboard   = React.lazy(() => import('./Dashboard'))
const DashboardV2 = React.lazy(() => import('./pages/DashboardV2'))
const ObserverDashboard = React.lazy(() => import('./pages/ObserverDashboard'))
const Courses     = React.lazy(() => import('./pages/Courses'))
const AssignmentListPage = React.lazy(() => import('./pages/AssignmentList'))
const AssignmentDetailPage = React.lazy(() => import('./pages/AssignmentDetail'))
const GradesPage  = React.lazy(() => import('./pages/Grades'))
const CalendarPage  = React.lazy(() => import('./pages/Calendar'))
const DiscussionsPage = React.lazy(() => import('./pages/Discussions'))
const FilesPage   = React.lazy(() => import('./pages/Files'))
const GroupsPage  = React.lazy(() => import('./pages/Groups'))
const NotificationsPage = React.lazy(() => import('./pages/Notifications'))
const SettingsPage = React.lazy(() => import('./pages/Settings'))
const AnalyticsPage = React.lazy(() => import('./pages/Analytics'))
const ReportsPage = React.lazy(() => import('./pages/Reports'))
const HelpPage    = React.lazy(() => import('./pages/Help'))
const InboxPage   = React.lazy(() => import('./pages/Inbox'))
const PlannerPage = React.lazy(() => import('./pages/Planner'))
const GradingQueuePage = React.lazy(() => import('./pages/GradingQueue'))
const AdminUsersPage = React.lazy(() => import('./pages/admin/Users'))
const AdminCourseManagementPage = React.lazy(() => import('./pages/admin/CourseManagement'))
const AdminSystemSettingsPage = React.lazy(() => import('./pages/admin/SystemSettings'))
const AdminSubAccountsPage = React.lazy(() => import('./pages/admin/SubAccounts'))
const AdminTermsPage = React.lazy(() => import('./pages/admin/Terms'))
const AdminFeatureFlagsPage = React.lazy(() => import('./pages/admin/FeatureFlags'))
const AdminCourseSettingsPage = React.lazy(() => import('./pages/admin/CourseSettings'))
const AdminAccountNotificationsPage = React.lazy(() => import('./pages/admin/AccountNotifications'))
const AdminRolesPermissionsPage = React.lazy(() => import('./pages/admin/RolesPermissions'))
const AdminBrandConfigsPage = React.lazy(() => import('./pages/admin/BrandConfigs'))
const AdminSisImportsPage = React.lazy(() => import('./pages/admin/SisImports'))
const AdminGradeChangeAuditPage = React.lazy(() => import('./pages/admin/GradeChangeAudit'))
const AdminDeveloperKeysPage = React.lazy(() => import('./pages/admin/DeveloperKeys'))
const PagesPage = React.lazy(() => import('./pages/Pages'))
const QuizzesPage = React.lazy(() => import('./pages/Quizzes'))
const RubricsPage = React.lazy(() => import('./pages/Rubrics'))
const OutcomesPage = React.lazy(() => import('./pages/Outcomes'))
const ExternalToolsPage = React.lazy(() => import('./pages/ExternalTools'))
const EPortfolioPage = React.lazy(() => import('./pages/ePortfolio'))
const AccessibilityStatementPage = React.lazy(() => import('./pages/AccessibilityStatement'))

// Premium Accessibility, Localization, & Error Boundary (Sprint 22-24)
import { I18nProvider, useI18n } from './contexts/I18nContext'
import { PremiumErrorBoundary } from './components/PremiumErrorBoundary'
import { MobileTabBar } from './components/MobileTabBar'
import { NotificationProvider } from './contexts/NotificationContext'

// Unified styles
import './unified-styles.css'
import './styles/navigation.css'

// ─── Page loading fallback ────────────────────────────────────────────────────

function PageFallback() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const logoSrc = isDark ? '/classapex_logo_darkmode.webp' : '/classapex_logo_light.webp'

  return (
    <div className="cx-page-fallback" role="status" aria-label="Loading page">
      <div className="cx-page-fallback__content">
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: isDark ? '#1e293b' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
          flexShrink: 0,
          position: 'relative' as const
        }}>
          <img 
            src={logoSrc} 
            alt="ClassApex Logo" 
            className="cx-page-fallback__logo" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
          <div className="cx-loading-ring" />
        </div>
      </div>
    </div>
  )
}

// ─── Active nav helper ────────────────────────────────────────────────────────

function getActiveNavItem(pathname: string): string {
  if (pathname.startsWith('/courses'))      return 'courses'
  if (pathname.startsWith('/assignments'))  return 'assignments'
  if (pathname.startsWith('/grades'))       return 'grades'
  if (pathname.startsWith('/grading'))      return 'grading'
  if (pathname.startsWith('/calendar'))     return 'calendar'
  if (pathname.startsWith('/inbox'))        return 'inbox'
  if (pathname.startsWith('/planner'))      return 'planner'
  if (pathname.startsWith('/discussions'))  return 'discussions'
  if (pathname.startsWith('/files'))        return 'files'
  if (pathname.startsWith('/groups'))       return 'groups'
  if (pathname.startsWith('/notifications')) return 'notifications'
  if (pathname.startsWith('/settings'))     return 'settings'
  if (pathname.startsWith('/analytics'))    return 'analytics'
  if (pathname.startsWith('/reports'))      return 'reports'
  if (pathname.startsWith('/admin'))        return 'admin'
  if (pathname.startsWith('/help'))         return 'help'
  if (pathname.startsWith('/eportfolios'))   return 'eportfolios'
  return 'dashboard'
}

// ─── Page Meta Mapping ───────────────────────────────────────────────────────

interface PageMeta {
  title: string
  subtitle: string
}

const PAGE_META: Record<string, PageMeta> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Welcome back! Here's what's happening with your courses today."
  },
  courses: {
    title: "Course Management",
    subtitle: "Access and organize your curriculum, resources, and modules."
  },
  assignments: {
    title: "Assignments",
    subtitle: "Track your pending coursework, exams, and project submissions."
  },
  grades: {
    title: "Grades & Performance",
    subtitle: "Monitor your scores, GPA details, and feedback trends."
  },
  grading: {
    title: "Grading Queue",
    subtitle: "Evaluate pending student submissions and publish feedback."
  },
  calendar: {
    title: "Calendar",
    subtitle: "Coordinate schedules, classes, meetings, and deadlines."
  },
  discussions: {
    title: "Discussions",
    subtitle: "Participate in academic forums, announcements, and peer dialogue."
  },
  files: {
    title: "Files & Documents",
    subtitle: "Access your cloud storage, lecture slides, and upload assets."
  },
  groups: {
    title: "Groups",
    subtitle: "Collaborate on team projects and view group announcements."
  },
  notifications: {
    title: "Notifications",
    subtitle: "Stay updated on recent grading, alerts, and course events."
  },
  settings: {
    title: "Settings",
    subtitle: "Configure your Canvas LMS profile, notification triggers, and preferences."
  },
  profile: {
    title: "Profile Settings",
    subtitle: "Manage your ClassApex profile and preferences."
  },
  help: {
    title: "Help & Support",
    subtitle: "Contact support, read documentation, or open a help ticket."
  },
  inbox: {
    title: "Inbox",
    subtitle: "Send and receive direct communications with instructors and peers."
  },
  analytics: {
    title: "Analytics",
    subtitle: "Review your detailed activity metrics and learning analytics."
  },
  planner: {
    title: "Task Planner",
    subtitle: "Weekly view with day grouping, progress tracking, and reminders."
  },
  quizzes: {
    title: "Quizzes",
    subtitle: "Practice knowledge checks, graded quizzes, and surveys."
  },
  rubrics: {
    title: "Rubrics",
    subtitle: "View grading criteria and proficiency scales for assignments."
  },
  outcomes: {
    title: "Outcomes & Mastery",
    subtitle: "Track learning objectives and mastery levels across your courses."
  },
  pages: {
    title: "Pages",
    subtitle: "Course wiki pages — read, create, and manage your course content."
  },
  eportfolios: {
    title: "ePortfolios",
    subtitle: "Curate your learning journey, achievements, and course works for peer review."
  }
}

function getPageMeta(pathname: string): PageMeta {
  const segments = pathname.split('/').filter(Boolean)
  const primarySegment = segments[0] || 'dashboard'
  
  if (primarySegment === 'courses' && segments[1]) {
    if (segments[1] === 'catalog') {
      return {
        title: "Course Catalog",
        subtitle: "Browse and discover all available courses."
      }
    }
    if (segments[1] === 'favorites') {
      return {
        title: "Favorite Courses",
        subtitle: "Access and organize your curriculum, resources, and modules."
      }
    }
    if (segments[1] === 'recent') {
      return {
        title: "Recent Courses",
        subtitle: "Access and organize your curriculum, resources, and modules."
      }
    }
    if (segments[2] === 'assignments') {
      return {
        title: "Course Assignments",
        subtitle: "View and submit tasks for this course"
      }
    }
    return {
      title: "Course View",
      subtitle: "Access files, discussions, and coursework for this course"
    }
  }

  return PAGE_META[primarySegment] || {
    title: "ClassApex LMS",
    subtitle: "Modern Learning Experience Platform"
  }
}

// ─── AppContent ───────────────────────────────────────────────────────────────

const AppContent = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  // Offline detection state (S22-05)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  useEffect(() => {
    const goOnline = () => setIsOffline(false)
    const goOffline = () => setIsOffline(true)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // Shell state
  const [notifOpen, setNotifOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  // Canvas data — real user from API
  const { items: notifications, unreadCount, isLoading: notifLoading, markAllRead } = useActivityStream()
  const { user: canvasUser, displayName: canvasDisplayName, avatarUrl: canvasAvatarUrl } = useCurrentUser()
  const { results: searchResults, isSearching, search, clearResults } = useGlobalSearch()
  const { notifications: accountNotifs, dismissNotification } = useAccountNotifications()

  // Role context (used for role-based nav filtering)
  const { role, user: demoUser, isMasquerading, masqueradeAs } = useRole()

  // Derive display values — prefer live Canvas data when role matches default 'student', fall back to active preview persona details
  const displayName = role === 'student' ? (canvasDisplayName || demoUser.displayName) : demoUser.displayName
  const avatarUrl = role === 'student' ? (canvasAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${demoUser.avatarSeed}`) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${demoUser.avatarSeed}`
  const userRole = demoUser.title

  // Global Cmd+K and Command Palette action handlers (S3-10 keyboard nav / command actions)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('cx:focus-search'))
      }
    }
    const handleToggleTheme = () => {
      toggleTheme()
    }
    const handleToggleContrast = () => {
      const isContrast = document.documentElement.getAttribute('data-high-contrast') === 'true'
      if (isContrast) {
        document.documentElement.removeAttribute('data-high-contrast')
        document.body.classList.remove('high-contrast')
        localStorage.removeItem('classapex-high-contrast')
        localStorage.removeItem('schoolapex_high_contrast')
      } else {
        document.documentElement.setAttribute('data-high-contrast', 'true')
        document.body.classList.add('high-contrast')
        localStorage.setItem('classapex-high-contrast', 'true')
        localStorage.setItem('schoolapex_high_contrast', 'true')
      }
      // Sync checkbox selectors if user is on Settings page
      window.dispatchEvent(new Event('storage'))
    }

    document.addEventListener('keydown', handler)
    document.addEventListener('cx:toggle-theme' as any, handleToggleTheme)
    document.addEventListener('cx:toggle-contrast' as any, handleToggleContrast)

    return () => {
      document.removeEventListener('keydown', handler)
      document.removeEventListener('cx:toggle-theme' as any, handleToggleTheme)
      document.removeEventListener('cx:toggle-contrast' as any, handleToggleContrast)
    }
  }, [toggleTheme])

  // Initialize and sync high-contrast and reduced-motion states from localStorage on mount (S23-04)
  useEffect(() => {
    const isContrastEnabled =
      localStorage.getItem('classapex-high-contrast') === 'true' ||
      localStorage.getItem('schoolapex_high_contrast') === 'true'

    if (isContrastEnabled) {
      document.documentElement.setAttribute('data-high-contrast', 'true')
      document.body.classList.add('high-contrast')
    } else {
      document.documentElement.removeAttribute('data-high-contrast')
      document.body.classList.remove('high-contrast')
    }

    const isReducedMotion =
      localStorage.getItem('classapex-reduced-motion') === 'true' ||
      localStorage.getItem('schoolapex_reduced_motion') === 'true'

    if (isReducedMotion) {
      document.documentElement.setAttribute('data-reduced-motion', 'true')
      document.body.classList.add('reduced-motion')
    } else {
      document.documentElement.removeAttribute('data-reduced-motion')
      document.body.classList.remove('reduced-motion')
    }
  }, [])

  // Close modals on route change
  useEffect(() => {
    setNotifOpen(false)
  }, [location.pathname])

  // Apply theme to <html> for CSS custom property switching
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const handleSearch = useCallback((query: string) => {
    search(query)
  }, [search])



  // Get real auth actions from the AuthProvider
  const { logout: authLogout } = useAuth()

  const handleLogout = useCallback(async () => {
    // Properly revokes Canvas token, clears localStorage, resets auth state
    // RequireAuth will then render the sign-in screen
    await authLogout()
  }, [authLogout])

  const handleProfileClick = useCallback(() => {
    navigate('/profile')
  }, [navigate])

  const handleSettingsClick = useCallback(() => {
    navigate('/settings')
  }, [navigate])

  const breadcrumbItems = generateBreadcrumbs(location.pathname)

  // Sidebar element — AppShell clones it to inject collapse props
  const sidebar = (
    <NavigationSidebar
      data-testid="navigation-sidebar"
      currentUser={{
        id: canvasUser?.id ?? demoUser.id,
        name: displayName,
        email: canvasUser?.primary_email ?? canvasUser?.login_id ?? demoUser.email,
        roles: [role],
        locale: 'en',
        timezone: 'UTC',
        created_at: new Date(),
        updated_at: new Date(),
      }}
      activeItem={getActiveNavItem(location.pathname)}
      isCollapsed={false}
      onToggleCollapse={() => {}}
      onNavigate={(_, href) => { if (href) navigate(href) }}
      customItems={filterNavItemsByRole(navItems, role)}
      showBadges={true}
      logo={<ClassApexLogo />}
      theme={theme}
      onThemeToggle={toggleTheme}
    />
  )

  // TopBar element
  const topbar = (
    <div style={{ width: '100%', position: 'relative' }}>
      <TopBar
        data-testid="app-header"
        userName={displayName}
        userAvatar={avatarUrl}
        userRole={userRole}
        notificationCount={unreadCount}
        theme={theme}
        onNotificationsClick={() => setNotifOpen(prev => !prev)}
        onSearch={handleSearch}
        searchResults={searchResults}
        isSearching={isSearching}
        onProfileClick={handleProfileClick}
        onSettingsClick={handleSettingsClick}
        onLogout={handleLogout}
        breadcrumb={
          <div className="cm-topbar__title-group">
            <h1 className="cm-topbar__title">{getPageMeta(location.pathname).title}</h1>
            <p className="cm-topbar__subtitle">{getPageMeta(location.pathname).subtitle}</p>
          </div>
        }
      />

      {/* Notification Dropdown — positioned relative to TopBar */}
      <NotificationDropdown
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        items={notifications}
        isLoading={notifLoading}
        onMarkAllRead={markAllRead}
      />
    </div>
  )

  return (
    <>
      {/* Screen Reader Announcement Region (S23-03 / E2E test verification) */}
      <div className="sr-only" aria-live="polite" id="cx-announcement-region">
        System active and ready.
      </div>
      {isOffline && (
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#ffffff',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '0.85rem',
          fontWeight: 600,
          zIndex: 1000,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          <span>⚠️ Offline Mode Active — Showing Cached Canvas Data</span>
        </div>
      )}

      {/* Dynamic Inline search dropdown is integrated directly inside TopBar */}

      <AppShell sidebar={sidebar} topbar={topbar}>
        {isMasquerading && (
          <div style={{
            background: 'var(--cx-accent-warning, #f59e0b)',
            color: '#1e1b4b',
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.875rem',
            fontWeight: 500,
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            zIndex: 40
          }}>
            <span>
              You are currently masquerading as <strong>{displayName}</strong> ({userRole || role}).
            </span>
            <button 
              onClick={() => masqueradeAs(null)}
              className="cx-btn cx-btn--sm"
              style={{
                background: 'white',
                color: '#121212',
                border: 'none',
                padding: '4px 12px',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Stop Masquerading
            </button>
          </div>
        )}
        {/* Render global account announcements */}
        {accountNotifs && accountNotifs.length > 0 && (
          <div className="cx-global-announcements">
            {accountNotifs.map(n => {
              const iconColor = n.icon === 'error' ? 'var(--cx-color-danger)' : n.icon === 'information' ? 'var(--cx-color-primary)' : 'var(--cx-color-warning)';
              const bgColor = n.icon === 'error' ? 'var(--cx-color-danger-subtle, rgba(239, 68, 68, 0.1))' : n.icon === 'information' ? 'var(--cx-color-primary-subtle, rgba(99, 102, 241, 0.1))' : 'var(--cx-color-warning-subtle, rgba(245, 158, 11, 0.1))';
              const borderColor = n.icon === 'error' ? 'var(--cx-color-danger)' : n.icon === 'information' ? 'var(--cx-color-primary)' : 'var(--cx-color-warning)';

              return (
                <div key={n.id} style={{
                  background: bgColor,
                  borderLeft: `4px solid ${borderColor}`,
                  color: 'var(--cx-text-primary)',
                  padding: '12px 16px',
                  marginBottom: '12px',
                  borderRadius: 'var(--radius-md, 8px)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  boxShadow: 'var(--cx-shadow-sm)',
                  position: 'relative'
                }}>
                  <div style={{ fontSize: '1.25rem', color: iconColor, lineHeight: 1 }}>
                    {n.icon === 'error' ? '🛑' : n.icon === 'information' ? 'ℹ️' : '⚠️'}
                  </div>
                  <div style={{ flex: 1, paddingRight: '24px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.875rem', fontWeight: 700 }}>{n.subject}</h4>
                    <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--cx-text-secondary)' }}>{n.message}</p>
                  </div>
                  <button 
                    onClick={() => dismissNotification(n.id)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      color: 'var(--cx-text-tertiary)',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1
                    }}
                    aria-label="Dismiss notification"
                  >
                    &times;
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/"              element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"     element={role === 'observer' ? <ObserverDashboard /> : <DashboardV2 />} />
            <Route path="/dashboard/v1"  element={<Dashboard />} />
            <Route path="/courses/*"     element={<Courses />} />
            <Route path="/assignments"   element={<AssignmentListPage />} />
            <Route path="/grades"        element={<GradesPage />} />
            <Route path="/calendar"      element={<CalendarPage />} />
            <Route path="/inbox"         element={<InboxPage />} />
            <Route path="/planner"       element={<PlannerPage />} />
            <Route path="/grading"       element={<GradingQueuePage />} />
            <Route path="/discussions"   element={<DiscussionsPage />} />
            <Route path="/files"         element={<FilesPage />} />
            <Route path="/groups"        element={<GroupsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings"      element={<SettingsPage />} />
            <Route path="/profile"       element={<SettingsPage />} />
            <Route path="/analytics"     element={<AnalyticsPage />} />
            <Route path="/reports"       element={<ReportsPage />} />
            <Route path="/admin"        element={<Navigate to="/admin/users" replace />} />
            <Route path="/admin/users"   element={<AdminUsersPage />} />
            <Route path="/admin/courses" element={<AdminCourseManagementPage />} />
            <Route path="/admin/settings" element={<AdminSystemSettingsPage />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/roles" element={<AdminRolesPermissionsPage />} />
            <Route path="/admin/sub-accounts" element={<AdminSubAccountsPage />} />
            <Route path="/admin/terms" element={<AdminTermsPage />} />
            <Route path="/admin/feature-flags" element={<AdminFeatureFlagsPage />} />
            <Route path="/admin/course-settings" element={<AdminCourseSettingsPage />} />
            <Route path="/admin/notifications" element={<AdminAccountNotificationsPage />} />
            <Route path="/admin/branding" element={<AdminBrandConfigsPage />} />
            <Route path="/admin/sis-imports" element={<AdminSisImportsPage />} />
            <Route path="/admin/developer-keys" element={<AdminDeveloperKeysPage />} />
            <Route path="/admin/grade-change-audit" element={<AdminGradeChangeAuditPage />} />
            <Route path="/courses/:courseId/pages" element={<PagesPage />} />
            <Route path="/courses/:courseId/quizzes" element={<QuizzesPage />} />
            <Route path="/courses/:courseId/rubrics" element={<RubricsPage />} />
            <Route path="/courses/:courseId/outcomes" element={<OutcomesPage />} />
            <Route path="/courses/:courseId/external-tools" element={<ExternalToolsPage />} />
            <Route path="/help"          element={<HelpPage />} />
            <Route path="/eportfolios"   element={<EPortfolioPage />} />
            <Route path="/accessibility-statement" element={<AccessibilityStatementPage />} />
          </Routes>
        </Suspense>
      </AppShell>
      <RoleSwitcher isAiOpen={aiOpen} />
      <MobileTabBar notificationCount={unreadCount} />

      {/* Floating Glowing AI Companion Button (S21-01) - CSS Driven & Theme Aware */}
      <button
        onClick={() => setAiOpen(prev => !prev)}
        className={`cx-floating-ai-btn ${aiOpen ? 'cx-floating-ai-btn--drawer-open' : ''}`}
        aria-label="Toggle AI Companion"
        aria-expanded={aiOpen}
        aria-haspopup="dialog"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4M8 15h.01M16 15h.01M9 18h6" />
        </svg>
      </button>

      {/* Global AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        currentPath={location.pathname}
        currentRole={role}
        theme={theme}
      />
    </>
  )
}

// ─── App Root ─────────────────────────────────────────────────────────────────

const App = () => (
  <PremiumErrorBoundary>
    <I18nProvider>
      <AuthProvider devMode={false} apiToken={import.meta.env.VITE_CANVAS_API_TOKEN}>
        <ThemeProvider>
          <TenantProvider>
            <RoleProvider>
              <NotificationProvider>
                <Router>
                  <Routes>
                    <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
                    <Route path="/*" element={
                      <RequireAuth>
                        <AppContent />
                      </RequireAuth>
                    } />
                  </Routes>
                </Router>
              </NotificationProvider>
            </RoleProvider>
          </TenantProvider>
        </ThemeProvider>
      </AuthProvider>
    </I18nProvider>
  </PremiumErrorBoundary>
)

export default App