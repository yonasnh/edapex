import { FastifyInstance } from 'fastify'
import { canvasOBOManager } from '../lib/canvas-obo.js'
import { nrpsService } from '../lib/nrps.js'
import { agsService } from '../lib/ags.js'
import { getSession } from '../lib/session.js'

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
    // Get session ID from cookie or query parameter
    const sessionId = (request.query as any)?.session_id || request.cookies.lti_session

    if (!sessionId) {
      return reply.code(401).send({ error: 'No session ID found' })
    }

    const session = getSession(sessionId)
    if (!session?.ltiClaims) {
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
      const sessionId = (request.query as any)?.session_id || request.cookies.lti_session

      if (!sessionId) {
        return reply.code(401).send({ error: 'No session ID found' })
      }

      const session = getSession(sessionId)
      if (!session?.ltiClaims) {
        return reply.code(401).send({ error: 'No LTI session found' })
      }

      // Store session in request context for route handlers
      ;(request as any).ltiSession = session
    })

    // Get user courses
    app.get('/api/canvas/courses', async (request, reply) => {
      try {
        const session = (request as any).ltiSession
        const apiClient = await canvasOBOManager.getCanvasApiClient(session.ltiClaims)
        const courses = await apiClient.getCourses()
        return courses
      } catch (error) {
        app.log.error({ error }, 'Failed to fetch courses')
        return reply.code(500).send({ error: 'Failed to fetch courses' })
      }
    })

    // Get course details
    app.get('/api/canvas/courses/:courseId', async (request, reply) => {
      try {
        const { courseId } = request.params as { courseId: string }
        const session = (request as any).ltiSession
        const apiClient = await canvasOBOManager.getCanvasApiClient(session.ltiClaims)
        const course = await apiClient.getCourse(courseId)
        return course
      } catch (error) {
        app.log.error({ error }, 'Failed to fetch course')
        return reply.code(500).send({ error: 'Failed to fetch course' })
      }
    })

    // Get course assignments
    app.get('/api/canvas/courses/:courseId/assignments', async (request, reply) => {
      try {
        const { courseId } = request.params as { courseId: string }
        const session = (request as any).ltiSession
        const apiClient = await canvasOBOManager.getCanvasApiClient(session.ltiClaims)
        const assignments = await apiClient.getAssignments(courseId)
        return assignments
      } catch (error) {
        app.log.error({ error }, 'Failed to fetch assignments')
        return reply.code(500).send({ error: 'Failed to fetch assignments' })
      }
    })

    // Get user profile
    app.get('/api/canvas/users/:userId', async (request, reply) => {
      try {
        const { userId } = request.params as { userId: string }
        const session = (request as any).ltiSession
        const apiClient = await canvasOBOManager.getCanvasApiClient(session.ltiClaims)
        const user = await apiClient.getUser(userId)
        return user
      } catch (error) {
        app.log.error({ error }, 'Failed to fetch user')
        return reply.code(500).send({ error: 'Failed to fetch user' })
      }
    })

    // NRPS: Get course membership
    app.get('/api/canvas/courses/:courseId/membership', async (request, reply) => {
      try {
        const session = (request as any).ltiSession
        const membership = await nrpsService.getCourseMembership(session.ltiClaims)
        return membership
      } catch (error) {
        app.log.error({ error }, 'Failed to fetch course membership')
        return reply.code(500).send({ error: 'Failed to fetch course membership' })
      }
    })

    // NRPS: Get course instructors
    app.get('/api/canvas/courses/:courseId/instructors', async (request, reply) => {
      try {
        const session = (request as any).ltiSession
        const membership = await nrpsService.getCourseMembership(session.ltiClaims)
        const instructors = nrpsService.getInstructors(membership)
        return instructors
      } catch (error) {
        app.log.error({ error }, 'Failed to fetch instructors')
        return reply.code(500).send({ error: 'Failed to fetch instructors' })
      }
    })

    // NRPS: Get course students
    app.get('/api/canvas/courses/:courseId/students', async (request, reply) => {
      try {
        const session = (request as any).ltiSession
        const membership = await nrpsService.getCourseMembership(session.ltiClaims)
        const students = nrpsService.getStudents(membership)
        return students
      } catch (error) {
        app.log.error({ error }, 'Failed to fetch students')
        return reply.code(500).send({ error: 'Failed to fetch students' })
      }
    })

    // AGS: Get line items (gradebook columns)
    app.get('/api/canvas/courses/:courseId/lineitems', async (request, reply) => {
      try {
        const session = (request as any).ltiSession
        const lineItems = await agsService.getLineItems(session.ltiClaims)
        return lineItems
      } catch (error) {
        app.log.error({ error }, 'Failed to fetch line items')
        return reply.code(500).send({ error: 'Failed to fetch line items' })
      }
    })

    // AGS: Create line item
    app.post('/api/canvas/courses/:courseId/lineitems', async (request, reply) => {
      try {
        const session = (request as any).ltiSession
        const lineItemData = request.body as any
        const lineItem = await agsService.createLineItem(session.ltiClaims, lineItemData)
        return lineItem
      } catch (error) {
        app.log.error({ error }, 'Failed to create line item')
        return reply.code(500).send({ error: 'Failed to create line item' })
      }
    })

    // AGS: Submit score
    app.post('/api/canvas/lineitems/:lineItemId/scores', async (request, reply) => {
      try {
        const { lineItemId } = request.params as { lineItemId: string }
        const session = (request as any).ltiSession
        const scoreData = request.body as any
        await agsService.submitScore(session.ltiClaims, lineItemId, scoreData)
        return { success: true }
      } catch (error) {
        app.log.error({ error }, 'Failed to submit score')
        return reply.code(500).send({ error: 'Failed to submit score' })
      }
    })

    // AGS: Get results
    app.get('/api/canvas/lineitems/:lineItemId/results', async (request, reply) => {
      try {
        const { lineItemId } = request.params as { lineItemId: string }
        const session = (request as any).ltiSession
        const results = await agsService.getResults(session.ltiClaims, lineItemId)
        return results
      } catch (error) {
        app.log.error({ error }, 'Failed to fetch results')
        return reply.code(500).send({ error: 'Failed to fetch results' })
      }
    })
  })
}
