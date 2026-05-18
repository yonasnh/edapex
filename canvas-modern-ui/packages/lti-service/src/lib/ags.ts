import { z } from 'zod'
import { config } from './config.js'

/**
 * LTI Assignments and Grades Service (AGS) Implementation
 * 
 * Provides access to assignment and grade management:
 * - Create and manage line items (gradebook columns)
 * - Submit scores and grades
 * - Retrieve assignment information
 */

const LineItemSchema = z.object({
  id: z.string(),
  scoreMaximum: z.number(),
  label: z.string(),
  resourceId: z.string().optional(),
  resourceLinkId: z.string().optional(),
  tag: z.string().optional(),
  startDateTime: z.string().optional(),
  endDateTime: z.string().optional(),
})

const ScoreSchema = z.object({
  userId: z.string(),
  scoreGiven: z.number().optional(),
  scoreMaximum: z.number().optional(),
  comment: z.string().optional(),
  timestamp: z.string(),
  activityProgress: z.enum(['Initialized', 'Started', 'InProgress', 'Submitted', 'Completed']),
  gradingProgress: z.enum(['FullyGraded', 'Pending', 'PendingManual', 'Failed', 'NotReady']),
})

const ResultSchema = z.object({
  id: z.string(),
  scoreOf: z.string(), // Line item URL
  userId: z.string(),
  resultScore: z.number().optional(),
  resultMaximum: z.number().optional(),
  comment: z.string().optional(),
})

export type LineItem = z.infer<typeof LineItemSchema>
export type Score = z.infer<typeof ScoreSchema>
export type Result = z.infer<typeof ResultSchema>

interface LTIClaims {
  [key: string]: any
}

/**
 * AGS Service Implementation
 */
export class AGSService {
  /**
   * Get line items (gradebook columns) for the context
   */
  async getLineItems(claims: LTIClaims): Promise<LineItem[]> {
    const agsEndpoint = claims['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint']
    
    if (!agsEndpoint?.lineitems) {
      throw new Error('AGS line items endpoint not available in LTI claims')
    }

    try {
      const accessToken = await this.getServiceAccessToken(claims)
      
      const response = await fetch(agsEndpoint.lineitems, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.ims.lis.v2.lineitemcontainer+json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`AGS line items request failed: ${errorData.error || response.statusText}`)
      }

      const data = await response.json()
      return z.array(LineItemSchema).parse(data)
    } catch (error) {
      console.error('AGS line items request failed:', error)
      throw error
    }
  }

  /**
   * Create a new line item (gradebook column)
   */
  async createLineItem(claims: LTIClaims, lineItem: Omit<LineItem, 'id'>): Promise<LineItem> {
    const agsEndpoint = claims['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint']
    
    if (!agsEndpoint?.lineitems) {
      throw new Error('AGS line items endpoint not available in LTI claims')
    }

    try {
      const accessToken = await this.getServiceAccessToken(claims)
      
      const response = await fetch(agsEndpoint.lineitems, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.ims.lis.v2.lineitem+json',
          'Accept': 'application/vnd.ims.lis.v2.lineitem+json',
        },
        body: JSON.stringify(lineItem),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`AGS create line item failed: ${errorData.error || response.statusText}`)
      }

      const data = await response.json()
      return LineItemSchema.parse(data)
    } catch (error) {
      console.error('AGS create line item failed:', error)
      throw error
    }
  }

  /**
   * Submit a score for a user
   */
  async submitScore(claims: LTIClaims, lineItemId: string, score: Score): Promise<void> {
    const agsEndpoint = claims['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint']
    
    if (!agsEndpoint?.lineitems) {
      throw new Error('AGS endpoint not available in LTI claims')
    }

    try {
      const accessToken = await this.getServiceAccessToken(claims)
      const scoresUrl = `${agsEndpoint.lineitems}/${lineItemId}/scores`
      
      const response = await fetch(scoresUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.ims.lis.v1.score+json',
        },
        body: JSON.stringify(score),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`AGS submit score failed: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error('AGS submit score failed:', error)
      throw error
    }
  }

  /**
   * Get results for a line item
   */
  async getResults(claims: LTIClaims, lineItemId: string): Promise<Result[]> {
    const agsEndpoint = claims['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint']
    
    if (!agsEndpoint?.lineitems) {
      throw new Error('AGS endpoint not available in LTI claims')
    }

    try {
      const accessToken = await this.getServiceAccessToken(claims)
      const resultsUrl = `${agsEndpoint.lineitems}/${lineItemId}/results`
      
      const response = await fetch(resultsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.ims.lis.v2.resultcontainer+json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`AGS get results failed: ${errorData.error || response.statusText}`)
      }

      const data = await response.json()
      return z.array(ResultSchema).parse(data)
    } catch (error) {
      console.error('AGS get results failed:', error)
      throw error
    }
  }

  /**
   * Get service access token for AGS requests
   */
  private async getServiceAccessToken(claims: LTIClaims): Promise<string> {
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
        scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly https://purl.imsglobal.org/spec/lti-ags/scope/score',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`AGS service token request failed: ${errorData.error_description || response.statusText}`)
    }

    const tokenData = await response.json()
    return tokenData.access_token
  }
}

// Singleton instance
export const agsService = new AGSService()
