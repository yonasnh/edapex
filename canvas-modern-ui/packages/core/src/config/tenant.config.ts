/**
 * ClassApex Tenant Configuration
 * ==============================
 * Drives UI customization per institution type.
 * Load this at app init to configure navigation, features, and branding.
 */

export type InstitutionTier = 'k8' | 'highschool' | 'college' | 'university'

export interface TenantConfig {
  tier: InstitutionTier
  institutionName: string
  branding: {
    primaryColor: string
    logoUrl?: string
    faviconUrl?: string
  }
  features: {
    parentPortal: boolean
    gpaTracking: boolean
    careerReadiness: boolean
    advancedAnalytics: boolean
    multiTermView: boolean
    gamification: boolean
    researchTools: boolean
    aiAssistant: boolean
    ePortfolios: boolean
    outcomes: boolean
    conferences: boolean
    simplifiedNav: boolean
  }
  navigation: {
    maxVisibleItems: number
    showAdminSection: boolean
    showAnalytics: boolean
    showReports: boolean
    showGroups: boolean
  }
  grading: {
    defaultScheme: 'points' | 'percentage' | 'letter' | 'gpa'
    showClassRank: boolean
    showGPA: boolean
    showCredits: boolean
  }
  ui: {
    dashboardLayout: 'cards' | 'list' | 'gamified'
    avatarStyle: 'initials' | 'photo' | 'cartoon'
    colorScheme: 'professional' | 'vibrant' | 'playful'
  }
}

/**
 * Default configurations per institution tier
 */
export const TIER_DEFAULTS: Record<InstitutionTier, TenantConfig> = {
  k8: {
    tier: 'k8',
    institutionName: 'My School',
    branding: { primaryColor: '#4CAF50' },
    features: {
      parentPortal: true,
      gpaTracking: false,
      careerReadiness: false,
      advancedAnalytics: false,
      multiTermView: false,
      gamification: true,
      researchTools: false,
      aiAssistant: false,
      ePortfolios: false,
      outcomes: false,
      conferences: false,
      simplifiedNav: true,
    },
    navigation: {
      maxVisibleItems: 6,
      showAdminSection: false,
      showAnalytics: false,
      showReports: false,
      showGroups: false,
    },
    grading: {
      defaultScheme: 'points',
      showClassRank: false,
      showGPA: false,
      showCredits: false,
    },
    ui: {
      dashboardLayout: 'gamified',
      avatarStyle: 'cartoon',
      colorScheme: 'playful',
    },
  },

  highschool: {
    tier: 'highschool',
    institutionName: 'My High School',
    branding: { primaryColor: '#2563EB' },
    features: {
      parentPortal: true,
      gpaTracking: true,
      careerReadiness: true,
      advancedAnalytics: false,
      multiTermView: false,
      gamification: true,
      researchTools: false,
      aiAssistant: true,
      ePortfolios: true,
      outcomes: true,
      conferences: true,
      simplifiedNav: false,
    },
    navigation: {
      maxVisibleItems: 10,
      showAdminSection: false,
      showAnalytics: false,
      showReports: false,
      showGroups: true,
    },
    grading: {
      defaultScheme: 'letter',
      showClassRank: true,
      showGPA: true,
      showCredits: true,
    },
    ui: {
      dashboardLayout: 'cards',
      avatarStyle: 'photo',
      colorScheme: 'vibrant',
    },
  },

  college: {
    tier: 'college',
    institutionName: 'My College',
    branding: { primaryColor: '#7C3AED' },
    features: {
      parentPortal: false,
      gpaTracking: true,
      careerReadiness: true,
      advancedAnalytics: true,
      multiTermView: true,
      gamification: false,
      researchTools: false,
      aiAssistant: true,
      ePortfolios: true,
      outcomes: true,
      conferences: true,
      simplifiedNav: false,
    },
    navigation: {
      maxVisibleItems: 14,
      showAdminSection: true,
      showAnalytics: true,
      showReports: true,
      showGroups: true,
    },
    grading: {
      defaultScheme: 'letter',
      showClassRank: false,
      showGPA: true,
      showCredits: true,
    },
    ui: {
      dashboardLayout: 'cards',
      avatarStyle: 'photo',
      colorScheme: 'professional',
    },
  },

  university: {
    tier: 'university',
    institutionName: 'My University',
    branding: { primaryColor: '#1E40AF' },
    features: {
      parentPortal: false,
      gpaTracking: true,
      careerReadiness: true,
      advancedAnalytics: true,
      multiTermView: true,
      gamification: false,
      researchTools: true,
      aiAssistant: true,
      ePortfolios: true,
      outcomes: true,
      conferences: true,
      simplifiedNav: false,
    },
    navigation: {
      maxVisibleItems: 16,
      showAdminSection: true,
      showAnalytics: true,
      showReports: true,
      showGroups: true,
    },
    grading: {
      defaultScheme: 'gpa',
      showClassRank: false,
      showGPA: true,
      showCredits: true,
    },
    ui: {
      dashboardLayout: 'list',
      avatarStyle: 'photo',
      colorScheme: 'professional',
    },
  },
}

/**
 * Load tenant config — in production this would come from
 * an API or environment variable. Falls back to college tier.
 */
export function loadTenantConfig(tier?: InstitutionTier): TenantConfig {
  const selectedTier = tier || (import.meta.env?.VITE_INSTITUTION_TIER as InstitutionTier) || 'college'
  return { ...TIER_DEFAULTS[selectedTier] }
}

/**
 * Check if a feature is enabled for the current tenant
 */
export function isFeatureEnabled(
  config: TenantConfig,
  feature: keyof TenantConfig['features']
): boolean {
  return config.features[feature] ?? false
}
