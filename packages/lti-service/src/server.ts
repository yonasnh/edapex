import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { config } from './lib/config.js'
import { jwksRoute } from './routes/jwks.js'
import { loginRoute } from './routes/login.js'
import { launchRoute } from './routes/launch.js'
import { bootstrapRoute } from './routes/bootstrap.js'

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

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // LTI routes
  await app.register(jwksRoute)
  await app.register(loginRoute)
  await app.register(launchRoute)
  await app.register(bootstrapRoute)

  return app
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = await createServer()
  
  try {
    await app.listen({ 
      port: config.PORT, 
      host: '0.0.0.0' 
    })
    app.log.info(`LTI service listening on :${config.PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
