import { z } from 'zod';
/**
 * LTI Assignments and Grades Service (AGS) Implementation
 *
 * Provides access to assignment and grade management:
 * - Create and manage line items (gradebook columns)
 * - Submit scores and grades
 * - Retrieve assignment information
 */
declare const LineItemSchema: z.ZodObject<{
    id: z.ZodString;
    scoreMaximum: z.ZodNumber;
    label: z.ZodString;
    resourceId: z.ZodOptional<z.ZodString>;
    resourceLinkId: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
    startDateTime: z.ZodOptional<z.ZodString>;
    endDateTime: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    label: string;
    scoreMaximum: number;
    resourceId?: string | undefined;
    resourceLinkId?: string | undefined;
    tag?: string | undefined;
    startDateTime?: string | undefined;
    endDateTime?: string | undefined;
}, {
    id: string;
    label: string;
    scoreMaximum: number;
    resourceId?: string | undefined;
    resourceLinkId?: string | undefined;
    tag?: string | undefined;
    startDateTime?: string | undefined;
    endDateTime?: string | undefined;
}>;
declare const ScoreSchema: z.ZodObject<{
    userId: z.ZodString;
    scoreGiven: z.ZodOptional<z.ZodNumber>;
    scoreMaximum: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    activityProgress: z.ZodEnum<["Initialized", "Started", "InProgress", "Submitted", "Completed"]>;
    gradingProgress: z.ZodEnum<["FullyGraded", "Pending", "PendingManual", "Failed", "NotReady"]>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    timestamp: string;
    activityProgress: "Initialized" | "Started" | "InProgress" | "Submitted" | "Completed";
    gradingProgress: "Failed" | "FullyGraded" | "Pending" | "PendingManual" | "NotReady";
    scoreMaximum?: number | undefined;
    scoreGiven?: number | undefined;
    comment?: string | undefined;
}, {
    userId: string;
    timestamp: string;
    activityProgress: "Initialized" | "Started" | "InProgress" | "Submitted" | "Completed";
    gradingProgress: "Failed" | "FullyGraded" | "Pending" | "PendingManual" | "NotReady";
    scoreMaximum?: number | undefined;
    scoreGiven?: number | undefined;
    comment?: string | undefined;
}>;
declare const ResultSchema: z.ZodObject<{
    id: z.ZodString;
    scoreOf: z.ZodString;
    userId: z.ZodString;
    resultScore: z.ZodOptional<z.ZodNumber>;
    resultMaximum: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    userId: string;
    scoreOf: string;
    comment?: string | undefined;
    resultScore?: number | undefined;
    resultMaximum?: number | undefined;
}, {
    id: string;
    userId: string;
    scoreOf: string;
    comment?: string | undefined;
    resultScore?: number | undefined;
    resultMaximum?: number | undefined;
}>;
export type LineItem = z.infer<typeof LineItemSchema>;
export type Score = z.infer<typeof ScoreSchema>;
export type Result = z.infer<typeof ResultSchema>;
interface LTIClaims {
    [key: string]: any;
}
/**
 * AGS Service Implementation
 */
export declare class AGSService {
    /**
     * Get line items (gradebook columns) for the context
     */
    getLineItems(claims: LTIClaims): Promise<LineItem[]>;
    /**
     * Create a new line item (gradebook column)
     */
    createLineItem(claims: LTIClaims, lineItem: Omit<LineItem, 'id'>): Promise<LineItem>;
    /**
     * Submit a score for a user
     */
    submitScore(claims: LTIClaims, lineItemId: string, score: Score): Promise<void>;
    /**
     * Get results for a line item
     */
    getResults(claims: LTIClaims, lineItemId: string): Promise<Result[]>;
    /**
     * Get service access token for AGS requests
     */
    private getServiceAccessToken;
}
export declare const agsService: AGSService;
export {};
//# sourceMappingURL=ags.d.ts.map