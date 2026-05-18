import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { config } from './lib/config.js'
import { jwksRoute } from './routes/jwks.js'
import { loginRoute } from './routes/login.js'
import { launchRoute } from './routes/launch.js'
import { bootstrapRoute } from './routes/bootstrap.js'
import { canvasApiRoutes } from './routes/canvas-api.js'
import {
  securityHeaders,
  requestLogging,
  errorHandling,
  createHealthCheck,
  setupGracefulShutdown,
  rateLimitConfig,
  strictRateLimitConfig
} from './lib/security.js'

export async function createServer() {
  const app = fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport: config.NODE_ENV === 'development' ? {
        target: 'pino-pretty'
      } : undefined
    }
  })

  // Register plugins
  await app.register(cookie, {
    secret: config.SESSION_SECRET,
    parseOptions: {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'none' // Required for iframe embedding
    }
  })

  // Security headers
  app.addHook('onSend', async (request, reply) => {
    reply.header('X-Frame-Options', 'SAMEORIGIN')
    reply.header('X-Content-Type-Options', 'nosniff')
    reply.header('X-XSS-Protection', '1; mode=block')
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    if (config.NODE_ENV === 'production') {
      reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }
  })

  // Enhanced health check
  app.get('/health', createHealthCheck())

  // LTI routes
  await app.register(jwksRoute)
  await app.register(loginRoute)
  await app.register(launchRoute)
  await app.register(bootstrapRoute)

  // Canvas API proxy routes
  await app.register(canvasApiRoutes)

  return app
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = await createServer()

  // Setup graceful shutdown
  setupGracefulShutdown(app)

  try {
    await app.listen({
      port: config.PORT,
      host: '0.0.0.0'
    })
    app.log.info(`🚀 LTI Service running at http://localhost:${config.PORT}`)
    app.log.info(`📊 Health check: http://localhost:${config.PORT}/health`)
    app.log.info(`🔑 JWKS endpoint: http://localhost:${config.PORT}/.well-known/jwks.json`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
