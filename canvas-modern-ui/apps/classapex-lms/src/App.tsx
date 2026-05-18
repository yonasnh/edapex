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
import { GlobalSearchModal } from '../../../packages/components/src/ui/layout/GlobalSearchModal'
import { Breadcrumb, generateBreadcrumbs } from '../../../packages/components/src/navigation/Breadcrumb'
import { NavigationSidebar } from '@schoolapex/components'
import { TopBarSkeleton } from '../../../packages/components/src/ui/loading/ShellSkeletons'

// Canvas API hooks
import { useActivityStream, useCurrentUser, useGlobalSearch } from './hooks/useShellData'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { TenantProvider } from './contexts/TenantContext'
import { navItems, filterNavItemsByRole } from './navigation'
import { AuthProvider, RequireAuth, OAuthCallbackPage } from '@schoolapex/core'
import { RoleProvider, useRole } from './contexts/RoleContext'
import { RoleSwitcher } from './components/RoleSwitcher'

// Logo
import { ClassApexLogo } from './components/ClassApexLogo'

// Pages (lazy-loaded)
const Dashboard   = React.lazy(() => import('./Dashboard'))
const DashboardV2 = React.lazy(() => import('./pages/DashboardV2'))
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

// Unified styles
import './unified-styles.css'
import './styles/navigation.css'

// ─── Page loading fallback ────────────────────────────────────────────────────

function PageFallback() {
  return (
    <div className="cx-page-fallback" role="status" aria-label="Loading page">
      <div className="cx-page-fallback__dots">
        <span /><span /><span />
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
  return 'dashboard'
}

// ─── AppContent ───────────────────────────────────────────────────────────────

const AppContent = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  // Shell state
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Canvas data
  const { items: notifications, unreadCount, isLoading: notifLoading, markAllRead } = useActivityStream()
  const { displayName, avatarUrl } = useCurrentUser()
  const { results: searchResults, isSearching, search, clearResults } = useGlobalSearch()
  
  // Demo Role
  const { role, user: demoUser } = useRole()

  // Global Cmd+K handler (S3-10 keyboard nav)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
      // Custom event from GlobalSearchModal internal shortcut
      if (e.type === 'cx:open-search') {
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    document.addEventListener('cx:open-search' as any, handler)
    return () => {
      document.removeEventListener('keydown', handler)
      document.removeEventListener('cx:open-search' as any, handler)
    }
  }, [])

  // Close modals on route change
  useEffect(() => {
    setNotifOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  // Apply theme to <html> for CSS custom property switching
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const handleSearch = useCallback((query: string) => {
    search(query)
  }, [search])

  const handleCloseSearch = useCallback(() => {
    setSearchOpen(false)
    clearResults()
  }, [clearResults])

  const handleLogout = useCallback(() => {
    // Redirect to Canvas logout endpoint
    window.location.href = '/logout'
  }, [])

  const breadcrumbItems = generateBreadcrumbs(location.pathname)

  // Sidebar element — AppShell clones it to inject collapse props
  const sidebar = (
    <NavigationSidebar
      currentUser={{
        id: demoUser.id,
        name: demoUser.displayName,
        email: demoUser.email,
        roles: [demoUser.role],
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
    />
  )

  // TopBar element
  const topbar = (
    <div style={{ width: '100%', position: 'relative' }}>
      <TopBar
        userName={demoUser.displayName}
        userAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${demoUser.avatarSeed}`}
        userRole={demoUser.title}
        notificationCount={unreadCount}
        theme={theme}
        onThemeToggle={toggleTheme}
        onNotificationsClick={() => setNotifOpen(prev => !prev)}
        onSearch={() => setSearchOpen(true)}
        onLogout={handleLogout}
        breadcrumb={
          <Breadcrumb pathname={location.pathname} />
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
      {/* Global Search Modal — rendered at root level for proper z-index */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={handleCloseSearch}
        onSearch={handleSearch}
        results={searchResults}
        isLoading={isSearching}
      />

      <AppShell sidebar={sidebar} topbar={topbar}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/"              element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"     element={<DashboardV2 />} />
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
            <Route path="/analytics"     element={<AnalyticsPage />} />
            <Route path="/reports"       element={<ReportsPage />} />
            <Route path="/admin"        element={<Navigate to="/admin/users" replace />} />
            <Route path="/admin/users"   element={<AdminUsersPage />} />
            <Route path="/admin/courses" element={<AdminCourseManagementPage />} />
            <Route path="/admin/settings" element={<AdminSystemSettingsPage />} />
            <Route path="/admin/sub-accounts" element={<AdminSubAccountsPage />} />
            <Route path="/admin/terms" element={<AdminTermsPage />} />
            <Route path="/admin/feature-flags" element={<AdminFeatureFlagsPage />} />
            <Route path="/admin/course-settings" element={<AdminCourseSettingsPage />} />
            <Route path="/help"          element={<HelpPage />} />
          </Routes>
        </Suspense>
      </AppShell>
      <RoleSwitcher />
    </>
  )
}

// ─── App Root ─────────────────────────────────────────────────────────────────

const App = () => (
  <AuthProvider devMode={false} apiToken={import.meta.env.VITE_CANVAS_API_TOKEN}>
    <ThemeProvider>
      <TenantProvider>
        <RoleProvider>
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
        </RoleProvider>
      </TenantProvider>
    </ThemeProvider>
  </AuthProvider>
)

export default App