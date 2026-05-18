import { z } from 'zod';
/**
 * LTI Names and Roles Provisioning Service (NRPS) Implementation
 *
 * Provides access to course membership information including:
 * - Course roster (students, instructors, TAs)
 * - User roles and enrollment status
 * - User profile information
 */
declare const NRPSMemberSchema: z.ZodObject<{
    status: z.ZodEnum<["Active", "Inactive"]>;
    name: z.ZodString;
    picture: z.ZodOptional<z.ZodString>;
    given_name: z.ZodOptional<z.ZodString>;
    family_name: z.ZodOptional<z.ZodString>;
    middle_name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    user_id: z.ZodString;
    lis_person_sourcedid: z.ZodOptional<z.ZodString>;
    roles: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    roles: string[];
    name: string;
    status: "Active" | "Inactive";
    user_id: string;
    given_name?: string | undefined;
    family_name?: string | undefined;
    email?: string | undefined;
    picture?: string | undefined;
    middle_name?: string | undefined;
    lis_person_sourcedid?: string | undefined;
}, {
    roles: string[];
    name: string;
    status: "Active" | "Inactive";
    user_id: string;
    given_name?: string | undefined;
    family_name?: string | undefined;
    email?: string | undefined;
    picture?: string | undefined;
    middle_name?: string | undefined;
    lis_person_sourcedid?: string | undefined;
}>;
declare const NRPSResponseSchema: z.ZodObject<{
    id: z.ZodString;
    context: z.ZodObject<{
        id: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title?: string | undefined;
        label?: string | undefined;
    }, {
        id: string;
        title?: string | undefined;
        label?: string | undefined;
    }>;
    members: z.ZodArray<z.ZodObject<{
        status: z.ZodEnum<["Active", "Inactive"]>;
        name: z.ZodString;
        picture: z.ZodOptional<z.ZodString>;
        given_name: z.ZodOptional<z.ZodString>;
        family_name: z.ZodOptional<z.ZodString>;
        middle_name: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        user_id: z.ZodString;
        lis_person_sourcedid: z.ZodOptional<z.ZodString>;
        roles: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        roles: string[];
        name: string;
        status: "Active" | "Inactive";
        user_id: string;
        given_name?: string | undefined;
        family_name?: string | undefined;
        email?: string | undefined;
        picture?: string | undefined;
        middle_name?: string | undefined;
        lis_person_sourcedid?: string | undefined;
    }, {
        roles: string[];
        name: string;
        status: "Active" | "Inactive";
        user_id: string;
        given_name?: string | undefined;
        family_name?: string | undefined;
        email?: string | undefined;
        picture?: string | undefined;
        middle_name?: string | undefined;
        lis_person_sourcedid?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    context: {
        id: string;
        title?: string | undefined;
        label?: string | undefined;
    };
    members: {
        roles: string[];
        name: string;
        status: "Active" | "Inactive";
        user_id: string;
        given_name?: string | undefined;
        family_name?: string | undefined;
        email?: string | undefined;
        picture?: string | undefined;
        middle_name?: string | undefined;
        lis_person_sourcedid?: string | undefined;
    }[];
}, {
    id: string;
    context: {
        id: string;
        title?: string | undefined;
        label?: string | undefined;
    };
    members: {
        roles: string[];
        name: string;
        status: "Active" | "Inactive";
        user_id: string;
        given_name?: string | undefined;
        family_name?: string | undefined;
        email?: string | undefined;
        picture?: string | undefined;
        middle_name?: string | undefined;
        lis_person_sourcedid?: string | undefined;
    }[];
}>;
export type NRPSMember = z.infer<typeof NRPSMemberSchema>;
export type NRPSResponse = z.infer<typeof NRPSResponseSchema>;
interface LTIClaims {
    [key: string]: any;
}
/**
 * NRPS Service Implementation
 */
export declare class NRPSService {
    /**
     * Get course membership using NRPS
     */
    getCourseMembership(claims: LTIClaims): Promise<NRPSResponse>;
    /**
     * Get service access token for NRPS requests
     */
    private getServiceAccessToken;
    /**
     * Filter members by role
     */
    filterMembersByRole(members: NRPSMember[], role: string): NRPSMember[];
    /**
     * Get instructors from course membership
     */
    getInstructors(membership: NRPSResponse): NRPSMember[];
    /**
     * Get students from course membership
     */
    getStudents(membership: NRPSResponse): NRPSMember[];
    /**
     * Get teaching assistants from course membership
     */
    getTeachingAssistants(membership: NRPSResponse): NRPSMember[];
}
export declare const nrpsService: NRPSService;
export {};
//# sourceMappingURL=nrps.d.ts.map