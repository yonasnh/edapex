import { config } from '../lib/config.js';
import { generateState, generateNonce, storeStateNonce } from '../lib/session.js';
import { OIDCLoginRequestSchema } from '../types/lti.js';
export async function loginRoute(app) {
    app.post('/lti/login', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    iss: { type: 'string' },
                    login_hint: { type: 'string' },
                    target_link_uri: { type: 'string' },
                    lti_message_hint: { type: 'string' },
                    client_id: { type: 'string' },
                    lti_deployment_id: { type: 'string' }
                },
                required: ['iss', 'login_hint', 'target_link_uri']
            }
        }
    }, async (request, reply) => {
        try {
            // Validate request body
            const loginRequest = OIDCLoginRequestSchema.parse(request.body);
            // Validate issuer
            if (loginRequest.iss !== config.LTI_ISSUER) {
                app.log.warn({
                    receivedIssuer: loginRequest.iss,
                    expectedIssuer: config.LTI_ISSUER
                }, 'Invalid issuer in login request');
                return reply.code(400).send({ error: 'Invalid issuer' });
            }
            // Validate client_id if provided
            if (loginRequest.client_id && loginRequest.client_id !== config.LTI_CLIENT_ID) {
                app.log.warn({
                    receivedClientId: loginRequest.client_id,
                    expectedClientId: config.LTI_CLIENT_ID
                }, 'Invalid client_id in login request');
                return reply.code(400).send({ error: 'Invalid client_id' });
            }
            // Generate state and nonce
            const state = generateState();
            const nonce = generateNonce();
            // Store state/nonce pair for validation
            storeStateNonce(state, nonce);
            // Build authorization URL
            const authUrl = new URL(config.LTI_AUTHORIZATION_ENDPOINT);
            authUrl.searchParams.set('response_type', 'id_token');
            authUrl.searchParams.set('client_id', config.LTI_CLIENT_ID);
            authUrl.searchParams.set('redirect_uri', config.LTI_REDIRECT_URI);
            authUrl.searchParams.set('login_hint', loginRequest.login_hint);
            authUrl.searchParams.set('state', state);
            authUrl.searchParams.set('response_mode', 'form_post');
            authUrl.searchParams.set('nonce', nonce);
            authUrl.searchParams.set('prompt', 'none');
            authUrl.searchParams.set('scope', 'openid');
            if (loginRequest.lti_message_hint) {
                authUrl.searchParams.set('lti_message_hint', loginRequest.lti_message_hint);
            }
            app.log.info({
                state,
                loginHint: loginRequest.login_hint,
                targetLinkUri: loginRequest.target_link_uri
            }, 'OIDC login initiated');
            // Redirect to Canvas authorization endpoint
            return reply.redirect(302, authUrl.toString());
        }
        catch (error) {
            app.log.error({ error }, 'Failed to process login request');
            if (error instanceof Error && error.name === 'ZodError') {
                return reply.code(400).send({ error: 'Invalid request format' });
            }
            return reply.code(500).send({ error: 'Internal server error' });
        }
    });
}
//# sourceMappingURL=login.js.map