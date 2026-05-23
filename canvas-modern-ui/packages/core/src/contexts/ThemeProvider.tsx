import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { createApiClient } from '../api/canvas-client'

export type Theme = 'light' | 'dark'

export interface BrandConfig {
  primaryColor: string
  buttonColor: string
  buttonTextColor: string
  logoUrl: string
  faviconUrl: string
}

export interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  isLight: boolean
  isDark: boolean
  accentColor: string
  setAccentColor: (color: string) => void
  brandConfig: BrandConfig | null
  setBrandConfig: (config: BrandConfig | null) => void
  refreshBrandConfig: () => Promise<void>
}

// Helper to parse hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Helper to convert RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

// Helper to darken a color for hover state (decrease brightness by percent)
function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const r = Math.max(0, Math.min(255, Math.round(rgb.r * (1 - percent))))
  const g = Math.max(0, Math.min(255, Math.round(rgb.g * (1 - percent))))
  const b = Math.max(0, Math.min(255, Math.round(rgb.b * (1 - percent))))
  return rgbToHex(r, g, b)
}

// Helper to make a color subtle (e.g. rgba(r, g, b, opacity))
function getSubtleColor(hex: string, opacity: number = 0.08): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return `rgba(15, 98, 254, ${opacity})`
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export interface ThemeProviderProps {
  children: ReactNode
  /** localStorage key for persisting theme preference */
  storageKey?: string
  /** Default theme if no saved preference and no system preference */
  defaultTheme?: Theme
  /** CSS selector to set data-theme attribute on */
  rootSelector?: string
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  storageKey = 'cm-theme',
  defaultTheme = 'light',
  rootSelector = 'html',
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = (localStorage.getItem(storageKey) || localStorage.getItem('classapex-theme') || localStorage.getItem('schoolapex_theme')) as Theme | null
    if (saved === 'light' || saved === 'dark') return saved
    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light'
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
    return defaultTheme
  })

  const [accentColor, setAccentColorState] = useState<string>(() => {
    return localStorage.getItem('classapex-accent') || '#8a3ffc'
  })

  const [brandConfig, setBrandConfigState] = useState<BrandConfig | null>(() => {
    const saved = localStorage.getItem('classapex-brand-config')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
    return null
  })

  const applyStyles = useCallback((
    themeVal: Theme,
    accentVal: string,
    brandVal: BrandConfig | null
  ) => {
    const root = document.querySelector(rootSelector) as HTMLElement | null
    if (!root) return

    // Apply basic theme class/data attributes
    root.setAttribute('data-theme', themeVal)
    root.classList.remove('light-theme', 'dark-theme')
    root.classList.add(`${themeVal}-theme`)

    // Apply accent color dynamic variables
    root.style.setProperty('--classapex-accent', accentVal)
    root.style.setProperty('--classapex-accent-hover', darkenColor(accentVal, 0.15))
    root.style.setProperty('--classapex-accent-subtle', getSubtleColor(accentVal, 0.1))
    root.style.setProperty('--cx-accent', accentVal)
    root.style.setProperty('--cx-accent-hover', darkenColor(accentVal, 0.15))
    root.style.setProperty('--cx-accent-subtle', getSubtleColor(accentVal, 0.1))

    // Apply brand colors variables
    const primary = brandVal?.primaryColor || '#0f62fe'
    const button = brandVal?.buttonColor || primary
    const buttonText = brandVal?.buttonTextColor || '#ffffff'

    root.style.setProperty('--cx-color-primary', primary)
    root.style.setProperty('--cx-primary', primary)
    root.style.setProperty('--classapex-primary', primary)
    root.style.setProperty('--cx-color-primary-hover', darkenColor(primary, 0.15))
    root.style.setProperty('--cx-primary-hover', darkenColor(primary, 0.15))
    root.style.setProperty('--cx-color-primary-subtle', getSubtleColor(primary, 0.08))
    root.style.setProperty('--cx-primary-subtle', getSubtleColor(primary, 0.08))

    root.style.setProperty('--cx-color-button', button)
    root.style.setProperty('--cx-button', button)
    root.style.setProperty('--cx-color-button-hover', darkenColor(button, 0.15))
    root.style.setProperty('--cx-button-hover', darkenColor(button, 0.15))
    root.style.setProperty('--cx-color-button-text', buttonText)
    root.style.setProperty('--cx-button-text', buttonText)

    // Dynamic favicon updates if provided, otherwise update to theme-aware default favicons
    if (brandVal?.faviconUrl) {
      const links = document.querySelectorAll("link[rel~='icon']")
      links.forEach((linkEl) => {
        const link = linkEl as HTMLLinkElement
        if (!link.getAttribute('media')) {
          link.href = brandVal.faviconUrl
        }
      })
    } else {
      const faviconLight = '/favicon-light.png'
      const faviconDark = '/favicon-dark.png'
      const currentFavicon = themeVal === 'dark' ? faviconDark : faviconLight
      
      const links = document.querySelectorAll("link[rel~='icon']")
      links.forEach((linkEl) => {
        const link = linkEl as HTMLLinkElement
        // Only update non-media-query favicon tags to prevent clashing with browser color-scheme media queries
        if (!link.getAttribute('media') && !link.getAttribute('rel')?.includes('apple-touch-icon')) {
          link.href = currentFavicon
        }
      })
    }
  }, [rootSelector])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(storageKey, newTheme)
    localStorage.setItem('classapex-theme', newTheme)
    localStorage.setItem('schoolapex_theme', newTheme)
  }, [storageKey])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  const setAccentColor = useCallback((color: string) => {
    setAccentColorState(color)
    localStorage.setItem('classapex-accent', color)
  }, [])

  const setBrandConfig = useCallback((config: BrandConfig | null) => {
    setBrandConfigState(config)
    if (config) {
      localStorage.setItem('classapex-brand-config', JSON.stringify(config))
    } else {
      localStorage.removeItem('classapex-brand-config')
    }
  }, [])

  const refreshBrandConfig = useCallback(async () => {
    try {
      const token = localStorage.getItem('cx_access_token') || localStorage.getItem('schoolapex_canvas_token')
      if (!token) return

      const client = createApiClient()
      const response = await client.get<any>('/api/v1/accounts/1/brand_configs/current')
      if (response && response.variables) {
        const config: BrandConfig = {
          primaryColor: response.variables.ic_brand_primary || '#0055AA',
          buttonColor: response.variables.ic_brand_button || '#0055AA',
          buttonTextColor: response.variables.ic_brand_button_text || '#ffffff',
          logoUrl: response.variables.ic_brand_header_image || '',
          faviconUrl: response.variables.ic_brand_favicon || '',
        }
        setBrandConfigState(config)
        localStorage.setItem('classapex-brand-config', JSON.stringify(config))
      }
    } catch (err) {
      console.warn('[ThemeProvider] Failed to fetch brand config from backend:', err)
    }
  }, [])

  useEffect(() => {
    applyStyles(theme, accentColor, brandConfig)
  }, [theme, accentColor, brandConfig, applyStyles])

  useEffect(() => {
    refreshBrandConfig()
  }, [refreshBrandConfig])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(storageKey)) {
        setThemeState(e.matches ? 'light' : 'dark')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [storageKey])

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      setTheme,
      isLight: theme === 'light',
      isDark: theme === 'dark',
      accentColor,
      setAccentColor,
      brandConfig,
      setBrandConfig,
      refreshBrandConfig
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
