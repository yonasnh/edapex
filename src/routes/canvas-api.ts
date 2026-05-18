import { FastifyInstance } from 'fastify'
import { canvasOBOManager } from '../lib/canvas-obo.js'

/**
 * Canvas REST API proxy routes using OBO tokens
 * Provides secure access to Canvas API on behalf of LTI users
 */
export async function canvasApiRoutes(app: FastifyInstance) {
  // OBO token exchange endpoint
  app.post('/api/canvas/token', {
    schema: {
      description: 'Exchange LTI session for Canvas API access token',
      tags: ['Canvas API'],
      body: {
        type: 'object',
        properties: {
          force_refresh: { type: 'boolean' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            access_token: { type: 'string' },
            expires_in: { type: 'number' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const session = request.session
    
    if (!session.ltiClaims) {
      return reply.code(401).send({ error: 'No LTI session found' })
    }

    try {
      const token = await canvasOBOManager.exchangeForAccessToken(session.ltiClaims)
      
      // Don't expose the full token to frontend
      return {
        access_token: token.access_token.substring(0, 10) + '...',
        expires_in: token.expires_in,
        user: token.user
      }
    } catch (error) {
      app.log.error({ error }, 'OBO token exchange failed')
      return reply.code(500).send({ error: 'Token exchange failed' })
    }
  })

  // Proxy Canvas API requests
  app.register(async function canvasApiProxy(app) {
    app.addHook('preHandler', async (request, reply) => {
      const session = request.session
      
      if (!session.ltiClaims) {
        return reply.code(401).send({ error: 'No LTI session found' })
      }
    })

    // Get user courses
    app.get('/api/canvas/courses', {
      schema: {
        description: 'Get user courses from Canvas API',
        tags: ['Canvas API'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                course_code: { type: 'string' }
              }
            }
          }
        }
      }
    }, async (request, reply) => {
      try {
        const apiClient = await canvasOBOManager.getCanvasApiClient(request.session.ltiClaims!)
        const courses = await apiClient.getCourses()
        return courses
      } catch (error) {
        app.log.error({ error }, 'Failed to fetch courses')
        return reply.code(500).send({ error: 'Failed to fetch courses' })
      }
    })

    // Get course details
    app.get('/api/canvas/courses/:courseId', {
      schema: {
        description: 'Get course details from Canvas API',
        tags: ['Canvas API'],
        params: {
          type: 'object',
          properties: {
            courseId: { type: 'string' }
          },
          required: ['courseId']
        }
      }
    }, async (request, reply) => {
      try {
        const { courseId } = request.params as { courseId: string }
        const apiClient = await canvasOBOManager.getCanvasApiClient(request.session.ltiClaims!)
        const course = await apiClient.getCourse(courseId)
        return course
      } catch (error) {
        app.log.error({ error }, 'Failed to fetch course')
        return reply.code(500).send({ error: 'Failed to fetch course' })
      }
    })

    // Get course assignments
    app.get('/api/canvas/courses/:courseId/assignments', {
      schema: {
        description: 'Get course assignments from Canvas API',
        tags: ['Canvas API'],
        params: {
          type: 'object',
          properties: {
            courseId: { type: 'string' }
          },
          required: ['courseId']
        }
      }
    }, async (request, reply) => {
      try {
        const { courseId } = request.params as { courseId: string }
        const apiClient = await canvasOBOManager.getCanvasApiClient(request.session.ltiClaims!)
        const assignments = await apiClient.getAssignments(courseId)
        return assignments
      } catch (error) {
        app.log.error({ error }, 'Failed to fetch assignments')
        return reply.code(500).send({ error: 'Failed to fetch assignments' })
      }
    })

    // Get user profile
    app.get('/api/canvas/users/:userId', {
      schema: {
        description: 'Get user profile from Canvas API',
        tags: ['Canvas API'],
        params: {
          type: 'object',
          properties: {
            userId: { type: 'string' }
          },
          required: ['userId']
        }
      }
    }, async (request, reply) => {
      try {
        const { userId } = request.params as { userId: string }
        const apiClient = await canvasOBOManager.getCanvasApiClient(request.session.ltiClaims!)
        const user = await apiClient.getUser(userId)
        return user
      } catch (error) {
        app.log.error({ error }, 'Failed to fetch user')
        return reply.code(500).send({ error: 'Failed to fetch user' })
      }
    })
  })
}
