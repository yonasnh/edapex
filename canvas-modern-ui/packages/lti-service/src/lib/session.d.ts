export interface LTISession {
    sessionId: string;
    userId: string;
    userName?: string;
    userEmail?: string;
    roles: string[];
    contextId?: string;
    contextTitle?: string;
    locale?: string;
    createdAt: number;
    lastAccessedAt: number;
    ltiClaims?: any;
}
export interface BootstrapPayload {
    sessionId: string;
    user: {
        id: string;
        name?: string;
        email?: string;
        roles: string[];
    };
    context?: {
        id: string;
        title?: string;
    };
    locale?: string;
    featureFlags: Record<string, boolean>;
    environment: string;
}
export declare function generateState(): string;
export declare function generateNonce(): string;
export declare function storeStateNonce(state: string, nonce: string): void;
export declare function validateStateNonce(state: string, nonce: string): boolean;
export declare function createSession(sessionData: Omit<LTISession, 'sessionId' | 'createdAt' | 'lastAccessedAt'>): LTISession;
export declare function getSession(sessionId: string): LTISession | null;
export declare function deleteSession(sessionId: string): void;
export declare function generateBootstrapToken(session: LTISession): Promise<string>;
export declare function verifyBootstrapToken(token: string): Promise<BootstrapPayload>;
//# sourceMappingURL=session.d.ts.map