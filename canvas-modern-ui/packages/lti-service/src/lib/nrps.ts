import { z } from 'zod'
import { config } from './config.js'

/**
 * LTI Names and Roles Provisioning Service (NRPS) Implementation
 * 
 * Provides access to course membership information including:
 * - Course roster (students, instructors, TAs)
 * - User roles and enrollment status
 * - User profile information
 */

const NRPSMemberSchema = z.object({
  status: z.enum(['Active', 'Inactive']),
  name: z.string(),
  picture: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  middle_name: z.string().optional(),
  email: z.string().email().optional(),
  user_id: z.string(),
  lis_person_sourcedid: z.string().optional(),
  roles: z.array(z.string()),
})

const NRPSResponseSchema = z.object({
  id: z.string(),
  context: z.object({
    id: z.string(),
    label: z.string().optional(),
    title: z.string().optional(),
  }),
  members: z.array(NRPSMemberSchema),
})

export type NRPSMember = z.infer<typeof NRPSMemberSchema>
export type NRPSResponse = z.infer<typeof NRPSResponseSchema>

interface LTIClaims {
  [key: string]: any
}

/**
 * NRPS Service Implementation
 */
export class NRPSService {
  /**
   * Get course membership using NRPS
   */
  async getCourseMembership(claims: LTIClaims): Promise<NRPSResponse> {
    const nrpsEndpoint = claims['https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice']
    
    if (!nrpsEndpoint?.context_memberships_url) {
      throw new Error('NRPS endpoint not available in LTI claims')
    }

    try {
      // Get access token for NRPS
      const accessToken = await this.getServiceAccessToken(claims)
      
      const response = await fetch(nrpsEndpoint.context_memberships_url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.ims.lti-nrps.v2.membershipcontainer+json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`NRPS request failed: ${errorData.error || response.statusText}`)
      }

      const data = await response.json()
      return NRPSResponseSchema.parse(data)
    } catch (error) {
      console.error('NRPS membership request failed:', error)
      throw error
    }
  }

  /**
   * Get service access token for NRPS requests
   */
  private async getServiceAccessToken(claims: LTIClaims): Promise<string> {
    // Use Canvas OAuth2 client credentials flow for service access
    const tokenUrl = new URL('/login/oauth2/token', claims.iss)
    
    const response = await fetch(tokenUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.LTI_CLIENT_ID,
        client_secret: config.CANVAS_OAUTH_CLIENT_SECRET || '',
        scope: 'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Service token request failed: ${errorData.error_description || response.statusText}`)
    }

    const tokenData = await response.json()
    return tokenData.access_token
  }

  /**
   * Filter members by role
   */
  filterMembersByRole(members: NRPSMember[], role: string): NRPSMember[] {
    return members.filter(member => 
      member.roles.some(memberRole => 
        memberRole.toLowerCase().includes(role.toLowerCase())
      )
    )
  }

  /**
   * Get instructors from course membership
   */
  getInstructors(membership: NRPSResponse): NRPSMember[] {
    return this.filterMembersByRole(membership.members, 'instructor')
  }

  /**
   * Get students from course membership
   */
  getStudents(membership: NRPSResponse): NRPSMember[] {
    return this.filterMembersByRole(membership.members, 'learner')
  }

  /**
   * Get teaching assistants from course membership
   */
  getTeachingAssistants(membership: NRPSResponse): NRPSMember[] {
    return this.filterMembersByRole(membership.members, 'teachingassistant')
  }
}

// Singleton instance
export const nrpsService = new NRPSService()
