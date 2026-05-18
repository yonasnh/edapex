import { z } from 'zod';
/**
 * Canvas OAuth2 On-Behalf-Of (OBO) Token Exchange
 *
 * Implements the Canvas REST API access pattern where the LTI tool
 * exchanges LTI claims for Canvas API access tokens on behalf of users.
 */
declare const OBOTokenSchema: z.ZodObject<{
    access_token: z.ZodString;
    token_type: z.ZodString;
    expires_in: z.ZodOptional<z.ZodNumber>;
    refresh_token: z.ZodOptional<z.ZodString>;
    scope: z.ZodOptional<z.ZodString>;
    user: z.ZodOptional<z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: number;
        email?: string | undefined;
    }, {
        name: string;
        id: number;
        email?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    access_token: string;
    token_type: string;
    user?: {
        name: string;
        id: number;
        email?: string | undefined;
    } | undefined;
    scope?: string | undefined;
    expires_in?: number | undefined;
    refresh_token?: string | undefined;
}, {
    access_token: string;
    token_type: string;
    user?: {
        name: string;
        id: number;
        email?: string | undefined;
    } | undefined;
    scope?: string | undefined;
    expires_in?: number | undefined;
    refresh_token?: string | undefined;
}>;
export type OBOToken = z.infer<typeof OBOTokenSchema>;
interface LTIClaims {
    sub: string;
    iss: string;
    aud: string;
    [key: string]: any;
}
/**
 * Canvas OBO Token Manager
 * Handles token exchange, storage, and refresh for Canvas REST API access
 */
export declare class CanvasOBOManager {
    private tokenCache;
    /**
     * Exchange LTI claims for Canvas API access token
     */
    exchangeForAccessToken(claims: LTIClaims): Promise<OBOToken>;
    /**
     * Get Canvas API client configured for a specific user
     */
    getCanvasApiClient(claims: LTIClaims): Promise<CanvasAPIClient>;
    /**
     * Clear cached tokens (for logout/security)
     */
    clearCache(): void;
}
/**
 * Simple Canvas API Client for OBO requests
 */
export declare class CanvasAPIClient {
    private baseUrl;
    private accessToken;
    constructor(baseUrl: string, accessToken: string);
    request<T>(endpoint: string, options?: RequestInit): Promise<T>;
    getCourses(): Promise<unknown>;
    getCourse(courseId: string): Promise<unknown>;
    getAssignments(courseId: string): Promise<unknown>;
    getUser(userId?: string): Promise<unknown>;
    getEnrollments(courseId: string): Promise<unknown>;
}
export declare const canvasOBOManager: CanvasOBOManager;
export {};
//# sourceMappingURL=canvas-obo.d.ts.map