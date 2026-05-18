import type { FastifyInstance } from 'fastify'
import { getPublicJWK } from '../lib/keys.js'

export async function jwksRoute(app: FastifyInstance) {
  app.get('/.well-known/jwks.json', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            keys: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  kty: { type: 'string' },
                  use: { type: 'string' },
                  kid: { type: 'string' },
                  alg: { type: 'string' },
                  n: { type: 'string' },
                  e: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      app.log.info('Generating JWKS...')
      const publicJWK = await getPublicJWK()
      app.log.info({ publicJWK }, 'JWKS generated successfully')

      reply.header('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
      reply.header('Content-Type', 'application/json')

      return { keys: [publicJWK] }
    } catch (error) {
      app.log.error({ error: error.message, stack: error.stack }, 'Failed to generate JWKS')
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })
}
