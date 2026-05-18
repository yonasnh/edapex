import { z } from 'zod'

const configSchema = z.object({
  // Server
  PORT: z.coerce.number().default(4001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  
  // Security
  SESSION_SECRET: z.string().min(32),
  
  // LTI Tool
  LTI_TOOL_KID: z.string().default('lti-tool-key-1'),
  LTI_TOOL_PRIVATE_KEY_PEM: z.string(),
  
  // Canvas Platform
  LTI_ISSUER: z.string().url(),
  LTI_CLIENT_ID: z.string(),
  LTI_AUTHORIZATION_ENDPOINT: z.string().url(),
  LTI_TOKEN_ENDPOINT: z.string().url(),
  LTI_JWKS_ENDPOINT: z.string().url(),
  
  // Tool URLs
  BASE_URL: z.string().url(),
  LTI_INITIATE_LOGIN_URI: z.string().url(),
  LTI_REDIRECT_URI: z.string().url(),
  
  // Modern UI
  MODERN_UI_URL: z.string().url().default('http://localhost:3001'),
  
  // Optional Canvas REST API
  CANVAS_API_BASE_URL: z.string().url().optional(),
  CANVAS_OAUTH_CLIENT_ID: z.string().optional(),
  CANVAS_OAUTH_CLIENT_SECRET: z.string().optional(),
  
  // Observability
  SENTRY_DSN: z.string().url().optional(),
})

export type Config = z.infer<typeof configSchema>

function loadConfig(): Config {
  try {
    return configSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation failed:')
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`)
      })
      process.exit(1)
    }
    throw error
  }
}

export const config = loadConfig()
