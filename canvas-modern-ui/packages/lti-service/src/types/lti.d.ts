import { z } from 'zod';
export declare const LTILaunchClaimsSchema: z.ZodObject<{
    iss: z.ZodString;
    aud: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    sub: z.ZodString;
    exp: z.ZodNumber;
    iat: z.ZodNumber;
    nonce: z.ZodString;
    'https://purl.imsglobal.org/spec/lti/claim/message_type': z.ZodLiteral<"LtiResourceLinkRequest">;
    'https://purl.imsglobal.org/spec/lti/claim/version': z.ZodLiteral<"1.3.0">;
    'https://purl.imsglobal.org/spec/lti/claim/deployment_id': z.ZodString;
    'https://purl.imsglobal.org/spec/lti/claim/target_link_uri': z.ZodString;
    'https://purl.imsglobal.org/spec/lti/claim/resource_link': z.ZodObject<{
        id: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description?: string | undefined;
        title?: string | undefined;
    }, {
        id: string;
        description?: string | undefined;
        title?: string | undefined;
    }>;
    name: z.ZodOptional<z.ZodString>;
    given_name: z.ZodOptional<z.ZodString>;
    family_name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    'https://purl.imsglobal.org/spec/lti/claim/roles': z.ZodArray<z.ZodString, "many">;
    'https://purl.imsglobal.org/spec/lti/claim/context': z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type?: string[] | undefined;
        title?: string | undefined;
        label?: string | undefined;
    }, {
        id: string;
        type?: string[] | undefined;
        title?: string | undefined;
        label?: string | undefined;
    }>>;
    'https://purl.imsglobal.org/spec/lti/claim/tool_platform': z.ZodOptional<z.ZodObject<{
        guid: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodString>;
        product_family_code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        guid: string;
        name?: string | undefined;
        version?: string | undefined;
        product_family_code?: string | undefined;
    }, {
        guid: string;
        name?: string | undefined;
        version?: string | undefined;
        product_family_code?: string | undefined;
    }>>;
    'https://purl.imsglobal.org/spec/lti/claim/launch_presentation': z.ZodOptional<z.ZodObject<{
        document_target: z.ZodOptional<z.ZodEnum<["iframe", "window"]>>;
        height: z.ZodOptional<z.ZodNumber>;
        width: z.ZodOptional<z.ZodNumber>;
        return_url: z.ZodOptional<z.ZodString>;
        locale: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        locale?: string | undefined;
        document_target?: "iframe" | "window" | undefined;
        height?: number | undefined;
        width?: number | undefined;
        return_url?: string | undefined;
    }, {
        locale?: string | undefined;
        document_target?: "iframe" | "window" | undefined;
        height?: number | undefined;
        width?: number | undefined;
        return_url?: string | undefined;
    }>>;
    'https://purl.imsglobal.org/spec/lti/claim/custom': z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint': z.ZodOptional<z.ZodObject<{
        scope: z.ZodArray<z.ZodString, "many">;
        lineitems: z.ZodOptional<z.ZodString>;
        lineitem: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        scope: string[];
        lineitems?: string | undefined;
        lineitem?: string | undefined;
    }, {
        scope: string[];
        lineitems?: string | undefined;
        lineitem?: string | undefined;
    }>>;
    'https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice': z.ZodOptional<z.ZodObject<{
        context_memberships_url: z.ZodString;
        service_versions: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        context_memberships_url: string;
        service_versions: string[];
    }, {
        context_memberships_url: string;
        service_versions: string[];
    }>>;
    'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings': z.ZodOptional<z.ZodObject<{
        deep_link_return_url: z.ZodString;
        accept_types: z.ZodArray<z.ZodString, "many">;
        accept_presentation_document_targets: z.ZodArray<z.ZodString, "many">;
        accept_copy_advice: z.ZodOptional<z.ZodBoolean>;
        auto_create: z.ZodOptional<z.ZodBoolean>;
        title: z.ZodOptional<z.ZodString>;
        text: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        deep_link_return_url: string;
        accept_types: string[];
        accept_presentation_document_targets: string[];
        title?: string | undefined;
        accept_copy_advice?: boolean | undefined;
        auto_create?: boolean | undefined;
        text?: string | undefined;
    }, {
        deep_link_return_url: string;
        accept_types: string[];
        accept_presentation_document_targets: string[];
        title?: string | undefined;
        accept_copy_advice?: boolean | undefined;
        auto_create?: boolean | undefined;
        text?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    sub: string;
    iss: string;
    aud: string | string[];
    exp: number;
    iat: number;
    nonce: string;
    'https://purl.imsglobal.org/spec/lti/claim/message_type': "LtiResourceLinkRequest";
    'https://purl.imsglobal.org/spec/lti/claim/version': "1.3.0";
    'https://purl.imsglobal.org/spec/lti/claim/deployment_id': string;
    'https://purl.imsglobal.org/spec/lti/claim/target_link_uri': string;
    'https://purl.imsglobal.org/spec/lti/claim/resource_link': {
        id: string;
        description?: string | undefined;
        title?: string | undefined;
    };
    'https://purl.imsglobal.org/spec/lti/claim/roles': string[];
    name?: string | undefined;
    given_name?: string | undefined;
    family_name?: string | undefined;
    email?: string | undefined;
    'https://purl.imsglobal.org/spec/lti/claim/context'?: {
        id: string;
        type?: string[] | undefined;
        title?: string | undefined;
        label?: string | undefined;
    } | undefined;
    'https://purl.imsglobal.org/spec/lti/claim/tool_platform'?: {
        guid: string;
        name?: string | undefined;
        version?: string | undefined;
        product_family_code?: string | undefined;
    } | undefined;
    'https://purl.imsglobal.org/spec/lti/claim/launch_presentation'?: {
        locale?: string | undefined;
        document_target?: "iframe" | "window" | undefined;
        height?: number | undefined;
        width?: number | undefined;
        return_url?: string | undefined;
    } | undefined;
    'https://purl.imsglobal.org/spec/lti/claim/custom'?: Record<string, string> | undefined;
    'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'?: {
        scope: string[];
        lineitems?: string | undefined;
        lineitem?: string | undefined;
    } | undefined;
    'https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice'?: {
        context_memberships_url: string;
        service_versions: string[];
    } | undefined;
    'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'?: {
        deep_link_return_url: string;
        accept_types: string[];
        accept_presentation_document_targets: string[];
        title?: string | undefined;
        accept_copy_advice?: boolean | undefined;
        auto_create?: boolean | undefined;
        text?: string | undefined;
    } | undefined;
}, {
    sub: string;
    iss: string;
    aud: string | string[];
    exp: number;
    iat: number;
    nonce: string;
    'https://purl.imsglobal.org/spec/lti/claim/message_type': "LtiResourceLinkRequest";
    'https://purl.imsglobal.org/spec/lti/claim/version': "1.3.0";
    'https://purl.imsglobal.org/spec/lti/claim/deployment_id': string;
    'https://purl.imsglobal.org/spec/lti/claim/target_link_uri': string;
    'https://purl.imsglobal.org/spec/lti/claim/resource_link': {
        id: string;
        description?: string | undefined;
        title?: string | undefined;
    };
    'https://purl.imsglobal.org/spec/lti/claim/roles': string[];
    name?: string | undefined;
    given_name?: string | undefined;
    family_name?: string | undefined;
    email?: string | undefined;
    'https://purl.imsglobal.org/spec/lti/claim/context'?: {
        id: string;
        type?: string[] | undefined;
        title?: string | undefined;
        label?: string | undefined;
    } | undefined;
    'https://purl.imsglobal.org/spec/lti/claim/tool_platform'?: {
        guid: string;
        name?: string | undefined;
        version?: string | undefined;
        product_family_code?: string | undefined;
    } | undefined;
    'https://purl.imsglobal.org/spec/lti/claim/launch_presentation'?: {
        locale?: string | undefined;
        document_target?: "iframe" | "window" | undefined;
        height?: number | undefined;
        width?: number | undefined;
        return_url?: string | undefined;
    } | undefined;
    'https://purl.imsglobal.org/spec/lti/claim/custom'?: Record<string, string> | undefined;
    'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'?: {
        scope: string[];
        lineitems?: string | undefined;
        lineitem?: string | undefined;
    } | undefined;
    'https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice'?: {
        context_memberships_url: string;
        service_versions: string[];
    } | undefined;
    'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'?: {
        deep_link_return_url: string;
        accept_types: string[];
        accept_presentation_document_targets: string[];
        title?: string | undefined;
        accept_copy_advice?: boolean | undefined;
        auto_create?: boolean | undefined;
        text?: string | undefined;
    } | undefined;
}>;
export type LTILaunchClaims = z.infer<typeof LTILaunchClaimsSchema>;
export declare const OIDCLoginRequestSchema: z.ZodObject<{
    iss: z.ZodString;
    login_hint: z.ZodString;
    target_link_uri: z.ZodString;
    lti_message_hint: z.ZodOptional<z.ZodString>;
    client_id: z.ZodOptional<z.ZodString>;
    lti_deployment_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    iss: string;
    login_hint: string;
    target_link_uri: string;
    lti_message_hint?: string | undefined;
    client_id?: string | undefined;
    lti_deployment_id?: string | undefined;
}, {
    iss: string;
    login_hint: string;
    target_link_uri: string;
    lti_message_hint?: string | undefined;
    client_id?: string | undefined;
    lti_deployment_id?: string | undefined;
}>;
export type OIDCLoginRequest = z.infer<typeof OIDCLoginRequestSchema>;
export declare const LTI_ROLES: {
    readonly ADMINISTRATOR: "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator";
    readonly FACULTY: "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Faculty";
    readonly GUEST: "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Guest";
    readonly NONE: "http://purl.imsglobal.org/vocab/lis/v2/institution/person#None";
    readonly OTHER: "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Other";
    readonly STAFF: "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Staff";
    readonly STUDENT: "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student";
    readonly INSTRUCTOR: "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor";
    readonly LEARNER: "http://purl.imsglobal.org/vocab/lis/v2/membership#Learner";
    readonly MENTOR: "http://purl.imsglobal.org/vocab/lis/v2/membership#Mentor";
    readonly SYSTEM_ADMINISTRATOR: "http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator";
    readonly SYSTEM_SUPPORT: "http://purl.imsglobal.org/vocab/lis/v2/system/person#Support";
};
export declare function hasRole(roles: string[], targetRole: string): boolean;
export declare function isInstructor(roles: string[]): boolean;
export declare function isStudent(roles: string[]): boolean;
export declare function isAdmin(roles: string[]): boolean;
//# sourceMappingURL=lti.d.ts.map