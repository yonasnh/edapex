import { z } from 'zod';
// LTI 1.3 Launch Claims Schema
export const LTILaunchClaimsSchema = z.object({
    // Standard JWT claims
    iss: z.string(),
    aud: z.union([z.string(), z.array(z.string())]),
    sub: z.string(),
    exp: z.number(),
    iat: z.number(),
    nonce: z.string(),
    // LTI specific claims
    'https://purl.imsglobal.org/spec/lti/claim/message_type': z.literal('LtiResourceLinkRequest'),
    'https://purl.imsglobal.org/spec/lti/claim/version': z.literal('1.3.0'),
    'https://purl.imsglobal.org/spec/lti/claim/deployment_id': z.string(),
    'https://purl.imsglobal.org/spec/lti/claim/target_link_uri': z.string(),
    'https://purl.imsglobal.org/spec/lti/claim/resource_link': z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional()
    }),
    // User information
    name: z.string().optional(),
    given_name: z.string().optional(),
    family_name: z.string().optional(),
    email: z.string().email().optional(),
    'https://purl.imsglobal.org/spec/lti/claim/roles': z.array(z.string()),
    // Context (course) information
    'https://purl.imsglobal.org/spec/lti/claim/context': z.object({
        id: z.string(),
        label: z.string().optional(),
        title: z.string().optional(),
        type: z.array(z.string()).optional()
    }).optional(),
    // Platform information
    'https://purl.imsglobal.org/spec/lti/claim/tool_platform': z.object({
        guid: z.string(),
        name: z.string().optional(),
        version: z.string().optional(),
        product_family_code: z.string().optional()
    }).optional(),
    // Launch presentation
    'https://purl.imsglobal.org/spec/lti/claim/launch_presentation': z.object({
        document_target: z.enum(['iframe', 'window']).optional(),
        height: z.number().optional(),
        width: z.number().optional(),
        return_url: z.string().optional(),
        locale: z.string().optional()
    }).optional(),
    // Custom parameters
    'https://purl.imsglobal.org/spec/lti/claim/custom': z.record(z.string()).optional(),
    // LTI Advantage Services
    'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint': z.object({
        scope: z.array(z.string()),
        lineitems: z.string().optional(),
        lineitem: z.string().optional()
    }).optional(),
    'https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice': z.object({
        context_memberships_url: z.string(),
        service_versions: z.array(z.string())
    }).optional(),
    // Deep Linking
    'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings': z.object({
        deep_link_return_url: z.string(),
        accept_types: z.array(z.string()),
        accept_presentation_document_targets: z.array(z.string()),
        accept_copy_advice: z.boolean().optional(),
        auto_create: z.boolean().optional(),
        title: z.string().optional(),
        text: z.string().optional()
    }).optional()
});
// OIDC Login Request Schema
export const OIDCLoginRequestSchema = z.object({
    iss: z.string(),
    login_hint: z.string(),
    target_link_uri: z.string(),
    lti_message_hint: z.string().optional(),
    client_id: z.string().optional(),
    lti_deployment_id: z.string().optional()
});
// LTI Roles
export const LTI_ROLES = {
    // Institution roles
    ADMINISTRATOR: 'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator',
    FACULTY: 'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Faculty',
    GUEST: 'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Guest',
    NONE: 'http://purl.imsglobal.org/vocab/lis/v2/institution/person#None',
    OTHER: 'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Other',
    STAFF: 'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Staff',
    STUDENT: 'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student',
    // Context roles
    INSTRUCTOR: 'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor',
    LEARNER: 'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner',
    MENTOR: 'http://purl.imsglobal.org/vocab/lis/v2/membership#Mentor',
    // System roles
    SYSTEM_ADMINISTRATOR: 'http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator',
    SYSTEM_SUPPORT: 'http://purl.imsglobal.org/vocab/lis/v2/system/person#Support'
};
export function hasRole(roles, targetRole) {
    return roles.some(role => role === targetRole || role.startsWith(targetRole));
}
export function isInstructor(roles) {
    return hasRole(roles, LTI_ROLES.INSTRUCTOR) || hasRole(roles, LTI_ROLES.FACULTY);
}
export function isStudent(roles) {
    return hasRole(roles, LTI_ROLES.LEARNER) || hasRole(roles, LTI_ROLES.STUDENT);
}
export function isAdmin(roles) {
    return hasRole(roles, LTI_ROLES.ADMINISTRATOR) || hasRole(roles, LTI_ROLES.SYSTEM_ADMINISTRATOR);
}
//# sourceMappingURL=lti.js.map