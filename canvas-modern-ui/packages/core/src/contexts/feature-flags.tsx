import React, { createContext, useContext, useMemo } from 'react'

/**
 * Feature flags for Canvas Modern UI
 * Controls gradual rollout and A/B testing
 */
export interface FeatureFlags {
  // Design System Migration Flags
  carbon_components: boolean
  carbon_theme: boolean
  instui_migration: boolean

  // Component-specific Flags
  modern_dashboard: boolean
  modern_gradebook: boolean
  modern_course_list: boolean
  modern_navigation: boolean
  modern_assignments: boolean

  // Feature Flags
  drag_and_drop: boolean
  real_time_updates: boolean
  offline_support: boolean
  advanced_analytics: boolean
  mobile_optimizations: boolean

  // Accessibility Flags
  enhanced_a11y: boolean
  screen_reader_optimizations: boolean
  keyboard_navigation_v2: boolean
  accessibility_audit: boolean

  // Performance Flags
  virtual_scrolling: boolean
  lazy_loading: boolean
  bundle_splitting: boolean

  // Development Flags
  debug_mode: boolean
  performance_monitoring: boolean
  error_boundary_logging: boolean
}

/**
 * Default feature flag values
 * Conservative defaults for production safety
 */
const defaultFeatureFlags: FeatureFlags = {
  // Design System Migration - Start disabled for safety
  carbon_components: false,
  carbon_theme: false,
  instui_migration: false,

  // Component Features - Gradual rollout
  modern_dashboard: false,
  modern_gradebook: false,
  modern_course_list: false,
  modern_navigation: false,
  modern_assignments: false,

  // Advanced Features
  drag_and_drop: false,
  real_time_updates: false,
  offline_support: false,
  advanced_analytics: false,
  mobile_optimizations: true, // Mobile-first approach

  // Accessibility - Always enabled
  enhanced_a11y: true,
  screen_reader_optimizations: true,
  keyboard_navigation_v2: true,
  accessibility_audit: true,

  // Performance - Enabled by default
  virtual_scrolling: true,
  lazy_loading: true,
  bundle_splitting: true,

  // Development
  debug_mode: process.env['NODE_ENV'] === 'development',
  performance_monitoring: true,
  error_boundary_logging: true,
}

/**
 * Feature flag context
 */
const FeatureFlagContext = createContext<{
  flags: FeatureFlags
  isEnabled: (flag: keyof FeatureFlags) => boolean
  getFlag: <K extends keyof FeatureFlags>(flag: K) => FeatureFlags[K]
}>({
  flags: defaultFeatureFlags,
  isEnabled: () => false,
  getFlag: () => false as any,
})

/**
 * Feature flag provider props
 */
interface FeatureFlagProviderProps {
  children: React.ReactNode
  flags?: Partial<FeatureFlags>
  userId?: string
  courseId?: string
}

/**
 * Feature flag provider with user and context-based overrides
 */
export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({
  children,
  flags: overrideFlags = {},
  userId,
  courseId,
}) => {
  const flags = useMemo(() => {
    // Start with defaults
    let computedFlags = { ...defaultFeatureFlags }

    // Apply environment-based overrides
    if (typeof window !== 'undefined') {
      // Check for URL parameters (for testing)
      const urlParams = new URLSearchParams(window.location.search)
      Object.keys(defaultFeatureFlags).forEach(key => {
        const urlValue = urlParams.get(`ff_${key}`)
        if (urlValue !== null) {
          computedFlags[key as keyof FeatureFlags] = urlValue === 'true'
        }
      })

      // Check localStorage for persistent overrides (development)
      if (process.env['NODE_ENV'] === 'development') {
        const storedFlags = localStorage.getItem('canvas_feature_flags')
        if (storedFlags) {
          try {
            const parsedFlags = JSON.parse(storedFlags)
            computedFlags = { ...computedFlags, ...parsedFlags }
          } catch (error) {
            console.warn('Failed to parse stored feature flags:', error)
          }
        }
      }
    }

    // Apply user-based feature flags (A/B testing)
    if (userId) {
      computedFlags = applyUserBasedFlags(computedFlags, userId)
    }

    // Apply course-based feature flags
    if (courseId) {
      computedFlags = applyCourseBasedFlags(computedFlags, courseId)
    }

    // Apply explicit overrides (highest priority)
    computedFlags = { ...computedFlags, ...overrideFlags }

    return computedFlags
  }, [overrideFlags, userId, courseId])

  const contextValue = useMemo(
    () => ({
      accessibility_audit: Boolean(flags.accessibility_audit),
      performance_monitoring: Boolean(flags.performance_monitoring),
      flags,
      isEnabled: (flag: keyof FeatureFlags) => Boolean(flags[flag]),
      getFlag: <K extends keyof FeatureFlags>(flag: K) => flags[flag],
    }),
    [flags]
  )

  return <FeatureFlagContext.Provider value={contextValue}>{children}</FeatureFlagContext.Provider>
}

/**
 * Hook to access feature flags
 */
export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext)
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider')
  }
  return context
}

/**
 * Hook to check if a specific feature flag is enabled
 */
export const useFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  const { isEnabled } = useFeatureFlags()
  return isEnabled(flag)
}

/**
 * Apply user-based feature flags for A/B testing
 */
function applyUserBasedFlags(flags: FeatureFlags, userId: string): FeatureFlags {
  // Simple hash-based A/B testing
  const userHash = hashString(userId)

  // Example: Enable carbon components for 10% of users
  if (userHash % 10 === 0) {
    flags.carbon_components = true
  }

  // Example: Enable modern dashboard for 25% of users
  if (userHash % 4 === 0) {
    flags.modern_dashboard = true
  }

  return flags
}

/**
 * Apply course-based feature flags
 */
function applyCourseBasedFlags(flags: FeatureFlags, _courseId: string): FeatureFlags {
  // Course-specific feature enablement
  // This could be based on course settings, institution, etc.

  return flags
}

/**
 * Simple string hash function for consistent A/B testing
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Development utility to override feature flags
 */
export const setFeatureFlag = (flag: keyof FeatureFlags, value: boolean) => {
  if (process.env['NODE_ENV'] !== 'development') {
    console.warn('setFeatureFlag is only available in development mode')
    return
  }

  const storedFlags = localStorage.getItem('canvas_feature_flags')
  let flags: Record<string, boolean> = {}

  if (storedFlags) {
    try {
      flags = JSON.parse(storedFlags)
    } catch (error) {
      console.warn('Failed to parse stored feature flags:', error)
    }
  }

  flags[flag] = value
  localStorage.setItem('canvas_feature_flags', JSON.stringify(flags))

  // Trigger a page reload to apply the changes
  window.location.reload()
}

/**
 * Development utility to reset all feature flags
 */
export const resetFeatureFlags = () => {
  if (process.env['NODE_ENV'] !== 'development') {
    console.warn('resetFeatureFlags is only available in development mode')
    return
  }

  localStorage.removeItem('canvas_feature_flags')
  window.location.reload()
}
