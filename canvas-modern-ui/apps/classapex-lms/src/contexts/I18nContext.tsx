import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type Locale = 'en' | 'es' | 'ar'
export type Direction = 'ltr' | 'rtl'

// Spanish & Arabic translations representing internationalization support
const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.courses': 'Courses',
    'nav.assignments': 'Assignments',
    'nav.grades': 'Grades',
    'nav.calendar': 'Calendar',
    'nav.inbox': 'Inbox',
    'nav.settings': 'Settings',
    'nav.help': 'Help & Support',
    'settings.title': 'Settings',
    'settings.subtitle': 'Configure your ClassApex LMS profile and preferences.',
    'settings.profile': 'Profile',
    'settings.notifications': 'Notifications',
    'settings.appearance': 'Appearance',
    'settings.accessibility': 'Accessibility',
    'settings.privacy': 'Privacy & Security',
    'settings.theme': 'Theme',
    'settings.highContrast': 'High Contrast Mode',
    'settings.reducedMotion': 'Reduced Motion Mode',
    'settings.save': 'Save Changes',
    'settings.saving': 'Saving...',
    'settings.saved': 'Settings Saved',
    'settings.failed': 'Save Failed',
    'settings.language': 'Language',
    'settings.timezone': 'Timezone',
    'pwa.installTitle': 'Install ClassApex App',
    'pwa.installDesc': 'Install ClassApex to your home screen for an app-like offline experience.',
    'pwa.installBtn': 'Install App',
    'offline.banner': 'You are currently offline. Showing cached Canvas data.',
    'a11y.statement': 'Accessibility Statement'
  },
  es: {
    'nav.dashboard': 'Tablero',
    'nav.courses': 'Cursos',
    'nav.assignments': 'Tareas',
    'nav.grades': 'Calificaciones',
    'nav.calendar': 'Calendario',
    'nav.inbox': 'Bandeja de Entrada',
    'nav.settings': 'Ajustes',
    'nav.help': 'Ayuda y Soporte',
    'settings.title': 'Ajustes',
    'settings.subtitle': 'Configure su perfil y preferencias de ClassApex LMS.',
    'settings.profile': 'Perfil',
    'settings.notifications': 'Notificaciones',
    'settings.appearance': 'Apariencia',
    'settings.accessibility': 'Accesibilidad',
    'settings.privacy': 'Privacidad y Seguridad',
    'settings.theme': 'Tema',
    'settings.highContrast': 'Modo de Alto Contraste',
    'settings.reducedMotion': 'Modo de Movimiento Reducido',
    'settings.save': 'Guardar Cambios',
    'settings.saving': 'Guardando...',
    'settings.saved': 'Ajustes Guardados',
    'settings.failed': 'Fallo al Guardar',
    'settings.language': 'Idioma',
    'settings.timezone': 'Zona Horaria',
    'pwa.installTitle': 'Instalar ClassApex',
    'pwa.installDesc': 'Instale ClassApex en su pantalla de inicio para una experiencia sin conexión.',
    'pwa.installBtn': 'Instalar Aplicación',
    'offline.banner': 'Actualmente estás sin conexión. Mostrando datos de Canvas guardados.',
    'a11y.statement': 'Declaración de Accesibilidad'
  },
  ar: {
    'nav.dashboard': 'لوحة القيادة',
    'nav.courses': 'المقررات الدراسية',
    'nav.assignments': 'الواجبات',
    'nav.grades': 'الدرجات',
    'nav.calendar': 'التقويم',
    'nav.inbox': 'البريد الوارد',
    'nav.settings': 'الإعدادات',
    'nav.help': 'الدعم والمساعدة',
    'settings.title': 'الإعدادات',
    'settings.subtitle': 'تكوين ملف تعريف ClassApex LMS وتفضيلاتك.',
    'settings.profile': 'الملف الشخصي',
    'settings.notifications': 'الإشعارات',
    'settings.appearance': 'المظهر',
    'settings.accessibility': 'إمكانية الوصول',
    'settings.privacy': 'الخصوصية والأمان',
    'settings.theme': 'السمة',
    'settings.highContrast': 'وضع التباين العالي',
    'settings.reducedMotion': 'وضع تقليل الحركة',
    'settings.save': 'حفظ التغييرات',
    'settings.saving': 'جاري الحفظ...',
    'settings.saved': 'تم حفظ الإعدادات',
    'settings.failed': 'فشل الحفظ',
    'settings.language': 'اللغة',
    'settings.timezone': 'المنطقة الزمنية',
    'pwa.installTitle': 'تثبيت تطبيق ClassApex',
    'pwa.installDesc': 'قم بتثبيت ClassApex على شاشتك الرئيسية للحصول على تجربة تطبيق دون اتصال بالإنترنت.',
    'pwa.installBtn': 'تثبيت التطبيق',
    'offline.banner': 'أنت غير متصل بالإنترنت حاليًا. يتم عرض بيانات Canvas المخزنة مؤقتًا.',
    'a11y.statement': 'إعلان إمكانية الوصول'
  }
}

export interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  dir: Direction
  t: (key: string, defaultText?: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('classapex-locale') as Locale | null
    if (saved === 'en' || saved === 'es' || saved === 'ar') return saved
    return 'en'
  })

  const [dir, setDir] = useState<Direction>('ltr')

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('classapex-locale', newLocale)
  }

  useEffect(() => {
    const direction = locale === 'ar' ? 'rtl' : 'ltr'
    setDir(direction)
    document.documentElement.setAttribute('dir', direction)
    document.documentElement.setAttribute('lang', locale)
  }, [locale])

  const t = (key: string, defaultText?: string): string => {
    return TRANSLATIONS[locale]?.[key] ?? defaultText ?? TRANSLATIONS['en']?.[key] ?? key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, dir, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within an I18nProvider')
  return context
}
