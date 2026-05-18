import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

export type Theme = 'light' | 'dark'

export interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  isLight: boolean
  isDark: boolean
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
    const saved = localStorage.getItem(storageKey) as Theme | null
    if (saved === 'light' || saved === 'dark') return saved
    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light'
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
    return defaultTheme
  })

  const applyTheme = useCallback((t: Theme) => {
    const root = document.querySelector(rootSelector)
    if (root) {
      root.setAttribute('data-theme', t)
      root.classList.remove('light-theme', 'dark-theme')
      root.classList.add(`${t}-theme`)
    }
  }, [rootSelector])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(storageKey, newTheme)
    applyTheme(newTheme)
  }, [storageKey, applyTheme])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

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
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isLight: theme === 'light', isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
