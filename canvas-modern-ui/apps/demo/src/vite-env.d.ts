/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CANVAS_BASE_URL: string
  readonly VITE_CANVAS_CLIENT_ID: string
  readonly VITE_OAUTH2_REDIRECT_URI: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_GRADEBOOK: string
  readonly VITE_ENABLE_CONSOLE_LOGS: string
  readonly VITE_PERFORMANCE_ENDPOINT: string
  readonly VITE_ALLOWED_ORIGINS: string
  readonly VITE_CSP_REPORT_URI: string
  readonly VITE_ENABLE_PERFORMANCE_MONITORING: string
  [key: string]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
