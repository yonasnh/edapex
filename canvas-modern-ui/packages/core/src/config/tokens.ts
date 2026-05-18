/**
 * Canvas Modern Design Tokens (TypeScript)
 * ==========================================
 * TypeScript exports for all design tokens.
 * Use these in JS/TS components instead of hardcoded values.
 *
 * For CSS, use the CSS custom properties in design-tokens.css
 */

// ─── Color Primitives ───
export const colors = {
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    0: '#FFFFFF',
    25: '#FCFCFD',
    50: '#F7F8FA',
    100: '#F1F3F6',
    200: '#E5E7EB',
    300: '#CBD5E1',
    400: '#9AA4B2',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#242932',
    850: '#20242A',
    900: '#111827',
    950: '#111315',
    '700dark': '#2E3440',
    '200dark': '#C7CED8',
    '100dark': '#F3F4F6',
  },
  blue: {
    50: '#EAF2FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    dark300: '#93B4FF',
    dark400: '#7AA2FF',
    dark500: '#5D8FFF',
  },
  green: {
    50: '#ECFDF5',
    700: '#15803D',
    dark400: '#4ADE80',
  },
  amber: {
    50: '#FEF3C7',
    700: '#B45309',
    dark400: '#FBBF24',
  },
  red: {
    50: '#FEF2F2',
    700: '#B91C1C',
    dark400: '#F87171',
  },
  sky: {
    50: '#E0F2FE',
    700: '#0369A1',
    dark400: '#38BDF8',
  },
} as const

// ─── Typography ───
export const typography = {
  fontFamily: {
    base: "'Inter', ui-sans-serif, system-ui, sans-serif",
    display: "'Inter', ui-sans-serif, system-ui, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },
  lineHeight: {
    tight: 1.2,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const

// ─── Spacing ───
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const

// ─── Border Radius ───
export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const

// ─── Border Width ───
export const borderWidth = {
  standard: 1,
  focus: 2,
} as const

// ─── Elevation ───
export const elevation = {
  0: 'none',
  1: '0 1px 2px rgba(15,23,42,.08)',
  2: '0 8px 24px rgba(15,23,42,.12)',
  3: '0 20px 48px rgba(15,23,42,.18)',
} as const

export const elevationDark = {
  0: 'none',
  1: '0 1px 2px rgba(0,0,0,.22)',
  2: '0 8px 24px rgba(0,0,0,.30)',
  3: '0 20px 48px rgba(0,0,0,.36)',
} as const

// ─── Motion ───
export const motion = {
  duration: {
    instant: 0,
    fast: 100,
    base: 180,
    slow: 280,
    slower: 420,
  },
  easing: {
    standard: 'cubic-bezier(.2,0,0,1)',
    enter: 'cubic-bezier(.05,.7,.1,1)',
    exit: 'cubic-bezier(.3,0,1,1)',
    emphasized: 'cubic-bezier(.2,.8,.2,1)',
  },
} as const

// ─── Semantic (Light) ───
export const semanticLight = {
  bg: {
    canvas: '#F7F8FA',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F3F6',
    surfaceRaised: '#FFFFFF',
    selected: '#EAF2FF',
  },
  border: {
    subtle: '#E5E7EB',
    strong: '#CBD5E1',
  },
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    tertiary: '#6B7280',
    inverse: '#FFFFFF',
    disabled: '#CBD5E1',
  },
  link: {
    default: '#2563EB',
  },
  focus: {
    ring: '#3B82F6',
    width: 2,
    offset: 2,
  },
  overlay: {
    scrim: 'rgba(17,24,39,0.52)',
  },
} as const

// ─── Semantic (Dark) ───
export const semanticDark = {
  bg: {
    canvas: '#111315',
    surface: '#181B1F',
    surfaceAlt: '#20242A',
    surfaceRaised: '#242932',
    selected: '#13233D',
  },
  border: {
    subtle: '#2E3440',
    strong: '#4B5563',
  },
  text: {
    primary: '#F3F4F6',
    secondary: '#C7CED8',
    tertiary: '#9AA4B2',
    inverse: '#0F1115',
    disabled: '#4B5563',
  },
  link: {
    default: '#7AA2FF',
  },
  focus: {
    ring: '#93C5FD',
    width: 2,
    offset: 2,
  },
  overlay: {
    scrim: 'rgba(0,0,0,.64)',
  },
} as const

// ─── Status ───
export interface StatusTokens {
  bg: string
  border: string
  text: string
  icon: string
}

export const statusLight: Record<string, StatusTokens> = {
  success: { bg: '#ECFDF5', border: '#15803D', text: '#15803D', icon: '#15803D' },
  warning: { bg: '#FEF3C7', border: '#B45309', text: '#B45309', icon: '#B45309' },
  danger: { bg: '#FEF2F2', border: '#B91C1C', text: '#B91C1C', icon: '#B91C1C' },
  info: { bg: '#E0F2FE', border: '#0369A1', text: '#0369A1', icon: '#0369A1' },
}

export const statusDark: Record<string, StatusTokens> = {
  success: { bg: 'rgba(74,222,128,.15)', border: '#4ADE80', text: '#4ADE80', icon: '#4ADE80' },
  warning: { bg: 'rgba(251,191,36,.15)', border: '#FBBF24', text: '#FBBF24', icon: '#FBBF24' },
  danger: { bg: 'rgba(248,113,113,.15)', border: '#F87171', text: '#F87171', icon: '#F87171' },
  info: { bg: 'rgba(56,189,248,.15)', border: '#38BDF8', text: '#38BDF8', icon: '#38BDF8' },
}

// ─── Breakpoints ───
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// ─── Layout ───
export const layout = {
  sidebarWidth: 260,
  sidebarCollapsed: 64,
  headerHeight: 56,
  maxContentWidth: 1280,
} as const

// ─── Z-Index ───
export const zIndex = {
  base: 1,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
  tooltip: 600,
} as const

// ─── Density Modes ───
export type DensityMode = 'comfortable' | 'default' | 'compact'

export const density = {
  comfortable: { rowHeight: 56, padding: 24, gap: 20 },
  default: { rowHeight: 48, padding: 16, gap: 16 },
  compact: { rowHeight: 36, padding: 8, gap: 8 },
} as const
