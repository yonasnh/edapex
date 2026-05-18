import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { jwtVerify, importJWK } from 'jose'
import { createLTICanvasAPI, LTICanvasAPIClient } from '../services/lti-canvas-api'

export interface LTIUser {
  id: string
  name?: string
  email?: string
  roles: string[]
}

export interface LTIContext {
  id: string
  title?: string
}

export interface LTIBootstrapPayload {
  sessionId: string
  user: LTIUser
  context?: LTIContext
  locale?: string
  featureFlags: Record<string, boolean>
  environment: string
}

export interface LTIContextValue {
  isLTILaunch: boolean
  isLoading: boolean
  error: string | null
  user: LTIUser | null
  context: LTIContext | null
  locale: string
  featureFlags: Record<string, boolean>
  environment: string
  sessionId: string | null
  canvasApi: LTICanvasAPIClient | null
  refreshBootstrap: () => Promise<void>
}

const LTIContext = createContext<LTIContextValue | null>(null)

export interface LTIProviderProps {
  children: ReactNode
  ltiServiceUrl?: string
  fallbackToMock?: boolean
}

export function LTIProvider({ 
  children, 
  ltiServiceUrl = 'http://localhost:4001',
  fallbackToMock = true 
}: LTIProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bootstrapData, setBootstrapData] = useState<LTIBootstrapPayload | null>(null)
  const [canvasApi, setCanvasApi] = useState<LTICanvasAPIClient | null>(null)

  const loadBootstrap = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Check for bootstrap token in URL params (from LTI launch redirect)
      const urlParams = new URLSearchParams(window.location.search)
      const bootstrapToken = urlParams.get('lti_bootstrap')

      if (bootstrapToken) {
        // Verify and decode bootstrap token
        const payload = await verifyBootstrapToken(bootstrapToken, ltiServiceUrl)
        setBootstrapData(payload)
        
        // Clean up URL
        urlParams.delete('lti_bootstrap')
        const newUrl = window.location.pathname + 
          (urlParams.toString() ? '?' + urlParams.toString() : '')
        window.history.replaceState({}, '', newUrl)
        
        return
      }

      // Try to get fresh bootstrap from session
      const response = await fetch(`${ltiServiceUrl}/session/bootstrap`, {
        credentials: 'include'
      })

      if (response.ok) {
        const { bootstrap_token } = await response.json()
        const payload = await verifyBootstrapToken(bootstrap_token, ltiServiceUrl)
        setBootstrapData(payload)
        return
      }

      // No LTI session found
      if (fallbackToMock) {
        console.info('No LTI session found, using mock data')
        setBootstrapData(createMockBootstrap())
      } else {
        throw new Error('No LTI session found and mock fallback disabled')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load LTI context'
      setError(errorMessage)
      
      if (fallbackToMock) {
        console.warn('LTI bootstrap failed, falling back to mock:', errorMessage)
        setBootstrapData(createMockBootstrap())
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBootstrap()
  }, [ltiServiceUrl, fallbackToMock])

  // Initialize Canvas API client when bootstrap data is available
  useEffect(() => {
    if (bootstrapData?.sessionId) {
      const apiClient = createLTICanvasAPI({
        ltiServiceUrl,
        sessionId: bootstrapData.sessionId
      })
      setCanvasApi(apiClient)
    } else {
      setCanvasApi(null)
    }
  }, [bootstrapData?.sessionId, ltiServiceUrl])

  const contextValue: LTIContextValue = {
    isLTILaunch: !!bootstrapData && bootstrapData.environment !== 'mock',
    isLoading,
    error,
    user: bootstrapData?.user || null,
    context: bootstrapData?.context || null,
    locale: bootstrapData?.locale || 'en',
    featureFlags: bootstrapData?.featureFlags || {},
    environment: bootstrapData?.environment || 'development',
    sessionId: bootstrapData?.sessionId || null,
    canvasApi,
    refreshBootstrap: loadBootstrap
  }

  return (
    <LTIContext.Provider value={contextValue}>
      {children}
    </LTIContext.Provider>
  )
}

export function useLTI(): LTIContextValue {
  const context = useContext(LTIContext)
  if (!context) {
    throw new Error('useLTI must be used within an LTIProvider')
  }
  return context
}

/**
 * Hook to access Canvas API client
 */
export function useCanvasAPI() {
  const { canvasApi, isLTILaunch } = useLTI()

  if (!isLTILaunch) {
    console.warn('Canvas API not available in mock mode')
    return null
  }

  return canvasApi
}

// Helper functions
async function verifyBootstrapToken(token: string, ltiServiceUrl: string): Promise<LTIBootstrapPayload> {
  // Get public key from LTI service JWKS
  const jwksResponse = await fetch(`${ltiServiceUrl}/.well-known/jwks.json`)
  if (!jwksResponse.ok) {
    throw new Error('Failed to fetch JWKS')
  }
  
  const jwks = await jwksResponse.json()
  const publicKey = await importJWK(jwks.keys[0])
  
  // Verify token
  const { payload } = await jwtVerify(token, publicKey, {
    issuer: ltiServiceUrl,
    audience: window.location.origin
  })
  
  return payload as unknown as LTIBootstrapPayload
}

function createMockBootstrap(): LTIBootstrapPayload {
  return {
    sessionId: 'mock-session-' + Date.now(),
    user: {
      id: 'mock-user-123',
      name: 'Demo User',
      email: 'demo@example.edu',
      roles: ['http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor']
    },
    context: {
      id: 'mock-course-456',
      title: 'Demo Course - Modern UI Showcase'
    },
    locale: 'en',
    featureFlags: {
      lti_integration: false,
      canvas_rest_api: false,
      debug_mode: true
    },
    environment: 'mock'
  }
}

// Role helper functions
export function hasRole(roles: string[], targetRole: string): boolean {
  return roles.some(role => role === targetRole || role.startsWith(targetRole))
}

export function isInstructor(roles: string[]): boolean {
  return hasRole(roles, 'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor') ||
         hasRole(roles, 'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Faculty')
}

export function isStudent(roles: string[]): boolean {
  return hasRole(roles, 'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner') ||
         hasRole(roles, 'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student')
}

export function isAdmin(roles: string[]): boolean {
  return hasRole(roles, 'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator') ||
         hasRole(roles, 'http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator')
}
