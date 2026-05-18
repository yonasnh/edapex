import { SignJWT, jwtVerify } from 'jose'
import { config } from './config.js'
import { getToolKeyPair } from './keys.js'

// In-memory stores (use Redis/database in production)
const stateStore = new Map<string, { nonce: string; createdAt: number }>()
const sessionStore = new Map<string, LTISession>()

export interface LTISession {
  sessionId: string
  userId: string
  userName?: string
  userEmail?: string
  roles: string[]
  contextId?: string
  contextTitle?: string
  locale?: string
  createdAt: number
  lastAccessedAt: number
}

export interface BootstrapPayload {
  sessionId: string
  user: {
    id: string
    name?: string
    email?: string
    roles: string[]
  }
  context?: {
    id: string
    title?: string
  }
  locale?: string
  featureFlags: Record<string, boolean>
  environment: string
}

// State/nonce management
export function generateState(): string {
  return crypto.randomUUID()
}

export function generateNonce(): string {
  return crypto.randomUUID()
}

export function storeStateNonce(state: string, nonce: string): void {
  stateStore.set(state, { nonce, createdAt: Date.now() })
  
  // Cleanup old entries (5 minutes TTL)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  for (const [key, value] of stateStore.entries()) {
    if (value.createdAt < fiveMinutesAgo) {
      stateStore.delete(key)
    }
  }
}

export function validateStateNonce(state: string, nonce: string): boolean {
  const stored = stateStore.get(state)
  if (!stored) return false
  
  // Remove after use (single-use)
  stateStore.delete(state)
  
  // Check TTL (5 minutes)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  if (stored.createdAt < fiveMinutesAgo) return false
  
  return stored.nonce === nonce
}

// Session management
export function createSession(sessionData: Omit<LTISession, 'sessionId' | 'createdAt' | 'lastAccessedAt'>): LTISession {
  const sessionId = crypto.randomUUID()
  const now = Date.now()
  
  const session: LTISession = {
    ...sessionData,
    sessionId,
    createdAt: now,
    lastAccessedAt: now
  }
  
  sessionStore.set(sessionId, session)
  return session
}

export function getSession(sessionId: string): LTISession | null {
  const session = sessionStore.get(sessionId)
  if (!session) return null
  
  // Update last accessed
  session.lastAccessedAt = Date.now()
  sessionStore.set(sessionId, session)
  
  return session
}

export function deleteSession(sessionId: string): void {
  sessionStore.delete(sessionId)
}

// Bootstrap token generation
export async function generateBootstrapToken(session: LTISession): Promise<string> {
  const { privateKey } = await getToolKeyPair()
  
  const payload: BootstrapPayload = {
    sessionId: session.sessionId,
    user: {
      id: session.userId,
      name: session.userName,
      email: session.userEmail,
      roles: session.roles
    },
    context: session.contextId ? {
      id: session.contextId,
      title: session.contextTitle
    } : undefined,
    locale: session.locale,
    featureFlags: {
      lti_integration: true,
      canvas_rest_api: !!config.CANVAS_API_BASE_URL,
      debug_mode: config.NODE_ENV === 'development'
    },
    environment: config.NODE_ENV
  }
  
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', kid: config.LTI_TOOL_KID })
    .setIssuedAt()
    .setExpirationTime('1h')
    .setIssuer(config.BASE_URL)
    .setAudience(config.MODERN_UI_URL)
    .sign(privateKey)
}

export async function verifyBootstrapToken(token: string): Promise<BootstrapPayload> {
  const { publicKey } = await getToolKeyPair()
  
  const { payload } = await jwtVerify(token, publicKey, {
    issuer: config.BASE_URL,
    audience: config.MODERN_UI_URL
  })
  
  return payload as BootstrapPayload
}
