import type { FastifyInstance } from 'fastify'
import { getSession, generateBootstrapToken } from '../lib/session.js'

export async function bootstrapRoute(app: FastifyInstance) {
  app.get('/session/bootstrap', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          session_id: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            bootstrap_token: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // Get session ID from cookie or query parameter
      const sessionId = (request.query as any)?.session_id || request.cookies.lti_session
      
      if (!sessionId) {
        return reply.code(401).send({ error: 'No session found' })
      }
      
      // Retrieve session
      const session = getSession(sessionId)
      if (!session) {
        return reply.code(401).send({ error: 'Invalid or expired session' })
      }
      
      // Generate fresh bootstrap token
      const bootstrapToken = await generateBootstrapToken(session)
      
      app.log.info({ 
        sessionId: session.sessionId,
        userId: session.userId 
      }, 'Bootstrap token generated')
      
      return { bootstrap_token: bootstrapToken }
      
    } catch (error) {
      app.log.error({ error }, 'Failed to generate bootstrap token')
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })
  
  // Session info endpoint (for debugging)
  app.get('/session/info', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            session: {
              type: 'object',
              properties: {
                sessionId: { type: 'string' },
                userId: { type: 'string' },
                userName: { type: 'string' },
                roles: { type: 'array', items: { type: 'string' } },
                contextId: { type: 'string' },
                contextTitle: { type: 'string' },
                locale: { type: 'string' },
                createdAt: { type: 'number' },
                lastAccessedAt: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const sessionId = request.cookies.lti_session
      
      if (!sessionId) {
        return reply.code(401).send({ error: 'No session found' })
      }
      
      const session = getSession(sessionId)
      if (!session) {
        return reply.code(401).send({ error: 'Invalid or expired session' })
      }
      
      // Return session info (excluding sensitive data)
      return {
        session: {
          sessionId: session.sessionId,
          userId: session.userId.substring(0, 8) + '...', // Partially redacted
          userName: session.userName,
          roles: session.roles,
          contextId: session.contextId,
          contextTitle: session.contextTitle,
          locale: session.locale,
          createdAt: session.createdAt,
          lastAccessedAt: session.lastAccessedAt
        }
      }
      
    } catch (error) {
      app.log.error({ error }, 'Failed to get session info')
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })
}
