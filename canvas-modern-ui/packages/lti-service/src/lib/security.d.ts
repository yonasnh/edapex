/**
 * Security utilities and middleware for production hardening
 */
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
/**
 * Rate limiting configuration
 */
export declare const rateLimitConfig: {
    max: number;
    timeWindow: string;
    errorResponseBuilder: (request: FastifyRequest, context: any) => {
        error: string;
        retryAfter: number;
    };
};
/**
 * Strict rate limiting for sensitive endpoints
 */
export declare const strictRateLimitConfig: {
    max: number;
    timeWindow: string;
    errorResponseBuilder: (request: FastifyRequest, context: any) => {
        error: string;
        retryAfter: number;
    };
};
/**
 * Security headers middleware
 */
export declare function securityHeaders(app: FastifyInstance): Promise<void>;
/**
 * Request logging middleware
 */
export declare function requestLogging(app: FastifyInstance): Promise<void>;
/**
 * Error handling middleware
 */
export declare function errorHandling(app: FastifyInstance): Promise<void>;
/**
 * Health check with detailed status
 */
export declare function createHealthCheck(): (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
/**
 * Graceful shutdown handler
 */
export declare function setupGracefulShutdown(app: FastifyInstance): void;
//# sourceMappingURL=security.d.ts.map