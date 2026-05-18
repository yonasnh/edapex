import type { FastifyInstance } from 'fastify'
import { jwtVerify, createRemoteJWKSet } from 'jose'
import { config } from '../lib/config.js'
import { validateStateNonce, createSession, generateBootstrapToken } from '../lib/session.js'
import { LTILaunchClaimsSchema } from '../types/lti.js'

// Cache Canvas JWKS
const canvasJWKS = createRemoteJWKSet(new URL(config.LTI_JWKS_ENDPOINT))

export async function launchRoute(app: FastifyInstance) {
  app.post('/lti/launch', {
    schema: {
      body: {
        type: 'object',
        properties: {
          id_token: { type: 'string' },
          state: { type: 'string' }
        },
        required: ['id_token', 'state']
      }
    }
  }, async (request, reply) => {
    try {
      const { id_token, state } = request.body as { id_token: string; state: string }
      
      app.log.info({ state }, 'LTI launch received')
      
      // Verify JWT signature and extract claims
      const { payload } = await jwtVerify(id_token, canvasJWKS, {
        issuer: config.LTI_ISSUER,
        audience: config.LTI_CLIENT_ID,
        clockTolerance: 30 // 30 second clock skew tolerance
      })
      
      // Validate LTI claims structure
      const claims = LTILaunchClaimsSchema.parse(payload)
      
      // Validate state and nonce
      if (!validateStateNonce(state, claims.nonce)) {
        app.log.warn({ state, nonce: claims.nonce }, 'Invalid state/nonce combination')
        return reply.code(400).send({ error: 'Invalid state or nonce' })
      }
      
      // Extract user information
      const userId = claims.sub
      const userName = claims.name || `${claims.given_name || ''} ${claims.family_name || ''}`.trim() || undefined
      const userEmail = claims.email
      const roles = claims['https://purl.imsglobal.org/spec/lti/claim/roles']
      
      // Extract context information
      const context = claims['https://purl.imsglobal.org/spec/lti/claim/context']
      const contextId = context?.id
      const contextTitle = context?.title || context?.label
      
      // Extract locale
      const launchPresentation = claims['https://purl.imsglobal.org/spec/lti/claim/launch_presentation']
      const locale = launchPresentation?.locale || 'en'
      
      // Create session
      const session = createSession({
        userId,
        userName,
        userEmail,
        roles,
        contextId,
        contextTitle,
        locale
      })
      
      // Generate bootstrap token for the UI
      const bootstrapToken = await generateBootstrapToken(session)
      
      // Set session cookie
      reply.setCookie('lti_session', session.sessionId, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'none', // Required for iframe
        maxAge: 60 * 60 * 24 // 24 hours
      })
      
      app.log.info({ 
        sessionId: session.sessionId,
        userId: session.userId,
        contextId: session.contextId,
        roles: session.roles 
      }, 'LTI launch successful, session created')
      
      // Redirect to Modern UI with bootstrap token
      const modernUIUrl = new URL(config.MODERN_UI_URL)
      modernUIUrl.searchParams.set('lti_bootstrap', bootstrapToken)
      
      // Return HTML that redirects to the Modern UI
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Loading SchoolApex Modern UI...</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0; 
              background: #f4f4f4;
            }
            .loading { 
              text-align: center; 
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .spinner {
              border: 3px solid #f3f3f3;
              border-top: 3px solid #0374B5;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 0 auto 1rem;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="loading">
            <div class="spinner"></div>
            <h2>Loading SchoolApex Modern UI...</h2>
            <p>Redirecting you to the modern Canvas experience.</p>
          </div>
          <script>
            // Redirect after a brief delay to show loading state
            setTimeout(() => {
              window.location.href = '${modernUIUrl.toString()}';
            }, 1000);
          </script>
        </body>
        </html>
      `
      
      return reply.type('text/html').send(html)
      
    } catch (error) {
      app.log.error({ error }, 'LTI launch failed')
      
      if (error instanceof Error) {
        if (error.name === 'JWTExpired') {
          return reply.code(400).send({ error: 'Token expired' })
        }
        if (error.name === 'JWTInvalid' || error.name === 'JWSSignatureVerificationFailed') {
          return reply.code(400).send({ error: 'Invalid token signature' })
        }
        if (error.name === 'ZodError') {
          return reply.code(400).send({ error: 'Invalid LTI claims format' })
        }
      }
      
      return reply.code(500).send({ error: 'Launch failed' })
    }
  })
}
