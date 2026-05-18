/**
 * Security utilities and middleware for production hardening
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { config } from './config.js'

/**
 * Rate limiting configuration
 */
export const rateLimitConfig = {
  max: 100, // requests per window
  timeWindow: '1 minute',
  errorResponseBuilder: (request: FastifyRequest, context: any) => ({
    error: 'Rate limit exceeded',
    retryAfter: Math.round(context.ttl / 1000)
  })
}

/**
 * Strict rate limiting for sensitive endpoints
 */
export const strictRateLimitConfig = {
  max: 10, // requests per window
  timeWindow: '1 minute',
  errorResponseBuilder: (request: FastifyRequest, context: any) => ({
    error: 'Rate limit exceeded for sensitive endpoint',
    retryAfter: Math.round(context.ttl / 1000)
  })
}

/**
 * Security headers middleware
 */
export async function securityHeaders(app: FastifyInstance) {
  app.addHook('onSend', async (request, reply, payload) => {
    // Security headers
    reply.header('X-Content-Type-Options', 'nosniff')
    reply.header('X-Frame-Options', 'SAMEORIGIN') // Allow iframe for LTI
    reply.header('X-XSS-Protection', '1; mode=block')
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // HSTS for production
    if (config.NODE_ENV === 'production') {
      reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }
    
    // CSP for LTI context
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // Canvas may require inline scripts
      "style-src 'self' 'unsafe-inline'", // Carbon Design System uses inline styles
      "img-src 'self' data: https:",
      "font-src 'self' https:",
      "connect-src 'self' https:",
      "frame-ancestors 'self' https://*.instructure.com https://*.canvaslms.com", // Allow Canvas iframe
      "form-action 'self'"
    ].join('; ')
    
    reply.header('Content-Security-Policy', csp)
    
    return payload
  })
}

/**
 * Request logging middleware
 */
export async function requestLogging(app: FastifyInstance) {
  app.addHook('onRequest', async (request, reply) => {
    const startTime = Date.now()
    
    // Log request start
    app.log.info({
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      sessionId: request.cookies.lti_session || 'none'
    }, 'Request started')
    
    // Add response time logging
    reply.header('X-Response-Time', `${Date.now() - startTime}ms`)
  })
  
  app.addHook('onResponse', async (request, reply) => {
    const responseTime = Date.now() - (request as any).startTime
    
    app.log.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: `${responseTime}ms`,
      sessionId: request.cookies.lti_session || 'none'
    }, 'Request completed')
  })
}

/**
 * Error handling middleware
 */
export async function errorHandling(app: FastifyInstance) {
  app.setErrorHandler(async (error, request, reply) => {
    // Log error with context
    app.log.error({
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers,
        sessionId: request.cookies.lti_session || 'none'
      }
    }, 'Request error')

    // Don't expose internal errors in production
    if (config.NODE_ENV === 'production') {
      return reply.code(500).send({
        error: 'Internal server error',
        requestId: request.id
      })
    }

    // Development: return detailed error
    return reply.code(500).send({
      error: error.message,
      stack: error.stack,
      requestId: request.id
    })
  })
}

/**
 * Health check with detailed status
 */
export function createHealthCheck() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        jwks: true, // Could test JWKS generation
        session: true, // Could test session store
        canvas: !!config.CANVAS_OAUTH_CLIENT_SECRET // Canvas API availability
      }
    }

    return reply.code(200).send(health)
  }
}

/**
 * Graceful shutdown handler
 */
export function setupGracefulShutdown(app: FastifyInstance) {
  const gracefulShutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, starting graceful shutdown...`)
    
    try {
      await app.close()
      app.log.info('Server closed successfully')
      process.exit(0)
    } catch (error) {
      app.log.error({ error }, 'Error during shutdown')
      process.exit(1)
    }
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
}
