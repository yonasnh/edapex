import { z } from 'zod';
import { config } from './config.js';
/**
 * Canvas OAuth2 On-Behalf-Of (OBO) Token Exchange
 *
 * Implements the Canvas REST API access pattern where the LTI tool
 * exchanges LTI claims for Canvas API access tokens on behalf of users.
 */
const OBOTokenSchema = z.object({
    access_token: z.string(),
    token_type: z.string(),
    expires_in: z.number().optional(),
    refresh_token: z.string().optional(),
    scope: z.string().optional(),
    user: z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().optional(),
    }).optional(),
});
/**
 * Canvas OBO Token Manager
 * Handles token exchange, storage, and refresh for Canvas REST API access
 */
export class CanvasOBOManager {
    tokenCache = new Map();
    /**
     * Exchange LTI claims for Canvas API access token
     */
    async exchangeForAccessToken(claims) {
        const cacheKey = `${claims.iss}:${claims.sub}`;
        // Check cache first
        const cached = this.tokenCache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now() + 60000) { // 1 minute buffer
            return cached.token;
        }
        try {
            // Canvas OBO token exchange endpoint
            const tokenUrl = new URL('/login/oauth2/token', claims.iss);
            const response = await fetch(tokenUrl.toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                },
                body: new URLSearchParams({
                    grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
                    client_id: config.LTI_CLIENT_ID,
                    client_secret: config.CANVAS_OAUTH_CLIENT_SECRET || '',
                    subject_token: claims.sub,
                    subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
                    scope: 'https://canvas.instructure.com/lti/account_lookup https://canvas.instructure.com/lti/public_jwk',
                }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`OBO token exchange failed: ${errorData.error_description || response.statusText}`);
            }
            const tokenData = await response.json();
            const token = OBOTokenSchema.parse(tokenData);
            // Cache the token
            const expiresAt = Date.now() + (token.expires_in || 3600) * 1000;
            this.tokenCache.set(cacheKey, { token, expiresAt });
            return token;
        }
        catch (error) {
            console.error('Canvas OBO token exchange failed:', error);
            throw error;
        }
    }
    /**
     * Get Canvas API client configured for a specific user
     */
    async getCanvasApiClient(claims) {
        const token = await this.exchangeForAccessToken(claims);
        return new CanvasAPIClient(claims.iss, token.access_token);
    }
    /**
     * Clear cached tokens (for logout/security)
     */
    clearCache() {
        this.tokenCache.clear();
    }
}
/**
 * Simple Canvas API Client for OBO requests
 */
export class CanvasAPIClient {
    baseUrl;
    accessToken;
    constructor(baseUrl, accessToken) {
        this.baseUrl = baseUrl;
        this.accessToken = accessToken;
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}/api/v1${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json+canvas-string-ids',
                ...options.headers,
            },
            ...options,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Canvas API error: ${errorData.message || response.statusText}`);
        }
        return response.json();
    }
    // Convenience methods for common Canvas API calls
    async getCourses() {
        return this.request('/courses?enrollment_state=active');
    }
    async getCourse(courseId) {
        return this.request(`/courses/${courseId}`);
    }
    async getAssignments(courseId) {
        return this.request(`/courses/${courseId}/assignments`);
    }
    async getUser(userId = 'self') {
        return this.request(`/users/${userId}`);
    }
    async getEnrollments(courseId) {
        return this.request(`/courses/${courseId}/enrollments`);
    }
}
// Singleton instance
export const canvasOBOManager = new CanvasOBOManager();
//# sourceMappingURL=canvas-obo.js.map