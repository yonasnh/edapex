export * from './types/canvas'

export { CanvasApiClient, CanvasApiError, createApiClient } from './api/canvas-client'
export {
  coursesApi,
  assignmentsApi,
  submissionsApi,
  modulesApi,
  discussionsApi,
  calendarApi,
  conversationsApi,
  dashboardApi,
  gradesApi,
  filesApi,
  announcementsApi,
  groupsApi,
  pagesApi,
  adminApi,
} from './api/services'

export { AuthProvider, useAuth, RequireAuth, OAuthCallbackPage } from './auth/AuthProvider'
export {
  getPermissions,
  getMergedPermissions,
  hasPermission,
  usePermissions,
  type CanvasRole,
  type Permission,
} from './auth/rbac'

export {
  useCanvasQuery,
  useCanvasMutation,
  useCurrentUser,
  useCourses,
  useCourse,
  useAssignments,
  useModules,
  useTodoItems,
  useUpcomingEvents,
  useActivityStream,
} from './hooks/useCanvasApi'

export {
  loadTenantConfig,
  isFeatureEnabled,
  TIER_DEFAULTS,
  type InstitutionTier,
  type TenantConfig,
} from './config/tenant.config'

export {
  colors,
  typography,
  spacing,
  radius,
  borderWidth,
  elevation,
  elevationDark,
  motion,
  semanticLight,
  semanticDark,
  statusLight,
  statusDark,
  breakpoints,
  layout,
  zIndex,
  density,
  type DensityMode,
  type StatusTokens,
} from './config/tokens'

export { useFeatureFlags, FeatureFlagProvider } from './contexts/feature-flags'
export { LTIProvider, useLTI, useCanvasAPI, hasRole, isInstructor, isStudent, isAdmin, type LTIContextValue, type LTIUser, type LTIContext } from './contexts/lti-context'

export { ThemeProvider, useTheme, type Theme, type ThemeContextType, type ThemeProviderProps } from './contexts/ThemeProvider'

export * from './performance/monitoring'
