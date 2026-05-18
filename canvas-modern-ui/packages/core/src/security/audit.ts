/**
 * Security Audit Module for SchoolApex Modern UI
 * 
 * Provides comprehensive security validation and audit capabilities
 * following Canvas LMS security best practices and OWASP guidelines.
 */

import { OAuth2Config } from '../auth/oauth2'

/**
 * Security audit result interface
 */
export interface SecurityAuditResult {
  passed: boolean
  score: number // 0-100
  issues: SecurityIssue[]
  recommendations: string[]
  summary: string
}

/**
 * Security issue interface
 */
export interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  category: 'authentication' | 'authorization' | 'transport' | 'storage' | 'validation' | 'configuration'
  title: string
  description: string
  impact: string
  remediation: string
  cwe?: string // Common Weakness Enumeration ID
}

/**
 * Security configuration interface
 */
export interface SecurityConfig {
  enforceHttps: boolean
  validateCors: boolean
  checkTokenStorage: boolean
  validateRedirectUris: boolean
  checkCsp: boolean
  auditEnvironment: boolean
}

/**
 * Default security configuration
 */
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  enforceHttps: true,
  validateCors: true,
  checkTokenStorage: true,
  validateRedirectUris: true,
  checkCsp: true,
  auditEnvironment: true,
}

/**
 * Security Auditor Class
 * 
 * Performs comprehensive security audits of the SchoolApex application
 * including OAuth2 configuration, transport security, and data protection.
 */
export class SecurityAuditor {
  private config: SecurityConfig
  private issues: SecurityIssue[] = []

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config }
  }

  /**
   * Perform comprehensive security audit
   */
  async performAudit(oauth2Config?: OAuth2Config): Promise<SecurityAuditResult> {
    this.issues = []

    // Audit different security aspects
    await this.auditTransportSecurity()
    await this.auditOAuth2Configuration(oauth2Config)
    await this.auditTokenStorage()
    await this.auditCorsConfiguration()
    await this.auditContentSecurityPolicy()
    await this.auditEnvironmentConfiguration()
    await this.auditBrowserSecurity()

    // Calculate security score
    const score = this.calculateSecurityScore()
    const passed = score >= 80 && !this.hasCriticalIssues()

    return {
      passed,
      score,
      issues: this.issues,
      recommendations: this.generateRecommendations(),
      summary: this.generateSummary(score, passed),
    }
  }

  /**
   * Audit transport security (HTTPS, TLS)
   */
  private async auditTransportSecurity(): Promise<void> {
    if (!this.config.enforceHttps) return

    // Check if running on HTTPS in production
    if (typeof window !== 'undefined') {
      const isProduction = import.meta.env.VITE_ENVIRONMENT === 'production'
      const isHttps = window.location.protocol === 'https:'
      const isLocalhost = window.location.hostname === 'localhost'

      if (isProduction && !isHttps && !isLocalhost) {
        this.addIssue({
          severity: 'critical',
          category: 'transport',
          title: 'HTTPS Not Enforced in Production',
          description: 'Application is running over HTTP in production environment',
          impact: 'Credentials and sensitive data transmitted in plaintext',
          remediation: 'Configure HTTPS with valid SSL/TLS certificate',
          cwe: 'CWE-319',
        })
      }

      // Check for mixed content
      if (isHttps) {
        const canvasBaseUrl = import.meta.env.VITE_CANVAS_BASE_URL
        if (canvasBaseUrl && !canvasBaseUrl.startsWith('https:')) {
          this.addIssue({
            severity: 'high',
            category: 'transport',
            title: 'Mixed Content Detected',
            description: 'Canvas base URL uses HTTP while application uses HTTPS',
            impact: 'Potential for man-in-the-middle attacks',
            remediation: 'Ensure Canvas base URL uses HTTPS',
            cwe: 'CWE-319',
          })
        }
      }
    }
  }

  /**
   * Audit OAuth2 configuration
   */
  private async auditOAuth2Configuration(config?: OAuth2Config): Promise<void> {
    if (!config) {
      // Try to get config from environment
      try {
        const { getOAuth2Config } = await import('../auth/oauth2')
        config = getOAuth2Config()
      } catch (error) {
        this.addIssue({
          severity: 'critical',
          category: 'configuration',
          title: 'OAuth2 Configuration Missing',
          description: 'Unable to load OAuth2 configuration',
          impact: 'Authentication will fail',
          remediation: 'Configure required environment variables',
        })
        return
      }
    }

    // Validate redirect URIs
    if (this.config.validateRedirectUris) {
      const redirectUri = config.redirectUri
      if (!redirectUri.startsWith('https:') && !redirectUri.includes('localhost')) {
        this.addIssue({
          severity: 'high',
          category: 'authentication',
          title: 'Insecure Redirect URI',
          description: 'OAuth2 redirect URI does not use HTTPS',
          impact: 'Authorization code could be intercepted',
          remediation: 'Use HTTPS for all redirect URIs in production',
          cwe: 'CWE-319',
        })
      }

      // Check for wildcard or overly permissive redirect URIs
      if (redirectUri.includes('*') || redirectUri.endsWith('/')) {
        this.addIssue({
          severity: 'medium',
          category: 'authentication',
          title: 'Permissive Redirect URI',
          description: 'Redirect URI may be too permissive',
          impact: 'Potential for redirect attacks',
          remediation: 'Use exact redirect URI matches',
          cwe: 'CWE-601',
        })
      }
    }

    // Validate Canvas base URL
    if (!config.canvasBaseUrl.startsWith('https:')) {
      this.addIssue({
        severity: 'high',
        category: 'configuration',
        title: 'Insecure Canvas Base URL',
        description: 'Canvas base URL does not use HTTPS',
        impact: 'API communications not encrypted',
        remediation: 'Use HTTPS Canvas instance',
        cwe: 'CWE-319',
      })
    }

    // Check for required scopes
    const requiredScopes = ['url:GET|/api/v1/users/self']
    const missingScopes = requiredScopes.filter(scope => !config.scopes.includes(scope))
    if (missingScopes.length > 0) {
      this.addIssue({
        severity: 'medium',
        category: 'authorization',
        title: 'Missing Required Scopes',
        description: `Missing OAuth2 scopes: ${missingScopes.join(', ')}`,
        impact: 'Application may not function correctly',
        remediation: 'Add required scopes to OAuth2 configuration',
      })
    }
  }

  /**
   * Audit token storage security
   */
  private async auditTokenStorage(): Promise<void> {
    if (!this.config.checkTokenStorage) return

    if (typeof window !== 'undefined') {
      // Check for tokens in localStorage
      const tokenKey = 'schoolapex_canvas_token'
      const storedToken = localStorage.getItem(tokenKey)
      
      if (storedToken) {
        try {
          const token = JSON.parse(storedToken)
          
          // Check for token integrity
          if (!token.integrity) {
            this.addIssue({
              severity: 'medium',
              category: 'storage',
              title: 'Token Integrity Check Missing',
              description: 'Stored tokens lack integrity validation',
              impact: 'Tokens could be tampered with',
              remediation: 'Implement token integrity checks',
            })
          }

          // Check for token expiration
          if (token.expires_in && token.created_at) {
            const expiresAt = token.created_at + (token.expires_in * 1000)
            if (Date.now() > expiresAt) {
              this.addIssue({
                severity: 'low',
                category: 'storage',
                title: 'Expired Token in Storage',
                description: 'Expired authentication token found in storage',
                impact: 'Potential for stale token usage',
                remediation: 'Implement automatic token cleanup',
              })
            }
          }
        } catch (error) {
          this.addIssue({
            severity: 'medium',
            category: 'storage',
            title: 'Malformed Token in Storage',
            description: 'Unable to parse stored authentication token',
            impact: 'Authentication may fail unexpectedly',
            remediation: 'Clear and regenerate authentication tokens',
          })
        }
      }

      // Check for sensitive data in sessionStorage
      const sensitiveKeys = ['oauth2_state', 'schoolapex_pkce_verifier']
      sensitiveKeys.forEach(key => {
        if (sessionStorage.getItem(key)) {
          // This is actually expected for PKCE flow, so just info level
          this.addIssue({
            severity: 'info',
            category: 'storage',
            title: 'Sensitive Data in Session Storage',
            description: `Found ${key} in session storage`,
            impact: 'Data cleared on tab close (expected behavior)',
            remediation: 'Ensure proper cleanup on logout',
          })
        }
      })
    }
  }

  /**
   * Audit CORS configuration
   */
  private async auditCorsConfiguration(): Promise<void> {
    if (!this.config.validateCors) return

    const allowedOrigins = import.meta.env.VITE_ALLOWED_ORIGINS
    if (allowedOrigins) {
      const origins = allowedOrigins.split(',')
      
      // Check for wildcard origins in production
      if (origins.includes('*') && import.meta.env.VITE_ENVIRONMENT === 'production') {
        this.addIssue({
          severity: 'high',
          category: 'configuration',
          title: 'Wildcard CORS Origin in Production',
          description: 'CORS allows all origins (*) in production',
          impact: 'Potential for cross-origin attacks',
          remediation: 'Specify exact allowed origins',
          cwe: 'CWE-346',
        })
      }

      // Check for HTTP origins
      const httpOrigins = origins.filter(origin => origin.startsWith('http:'))
      if (httpOrigins.length > 0) {
        this.addIssue({
          severity: 'medium',
          category: 'configuration',
          title: 'HTTP Origins in CORS',
          description: `HTTP origins allowed: ${httpOrigins.join(', ')}`,
          impact: 'Potential for insecure cross-origin requests',
          remediation: 'Use HTTPS origins only',
          cwe: 'CWE-319',
        })
      }
    }
  }

  /**
   * Audit Content Security Policy
   */
  private async auditContentSecurityPolicy(): Promise<void> {
    if (!this.config.checkCsp) return

    if (typeof document !== 'undefined') {
      const metaCsp = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
      const cspReportUri = import.meta.env.VITE_CSP_REPORT_URI

      if (!metaCsp && !cspReportUri) {
        this.addIssue({
          severity: 'medium',
          category: 'configuration',
          title: 'Content Security Policy Not Configured',
          description: 'No CSP headers or meta tags found',
          impact: 'Vulnerable to XSS and injection attacks',
          remediation: 'Implement Content Security Policy',
          cwe: 'CWE-79',
        })
      }
    }
  }

  /**
   * Audit environment configuration
   */
  private async auditEnvironmentConfiguration(): Promise<void> {
    if (!this.config.auditEnvironment) return

    // Check for debug mode in production
    if (import.meta.env.VITE_ENVIRONMENT === 'production') {
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        this.addIssue({
          severity: 'medium',
          category: 'configuration',
          title: 'Debug Mode Enabled in Production',
          description: 'Debug mode is enabled in production environment',
          impact: 'Potential information disclosure',
          remediation: 'Disable debug mode in production',
        })
      }

      if (import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true') {
        this.addIssue({
          severity: 'low',
          category: 'configuration',
          title: 'Console Logging Enabled in Production',
          description: 'Console logging is enabled in production',
          impact: 'Potential information disclosure in browser console',
          remediation: 'Disable console logging in production',
        })
      }
    }

    // Check for missing security headers configuration
    const securityHeaders = [
      'VITE_SENTRY_DSN',
      'VITE_CSP_REPORT_URI',
    ]

    securityHeaders.forEach(header => {
      if (!import.meta.env[header] && import.meta.env.VITE_ENVIRONMENT === 'production') {
        this.addIssue({
          severity: 'low',
          category: 'configuration',
          title: `Missing ${header}`,
          description: `${header} not configured for production`,
          impact: 'Reduced security monitoring capabilities',
          remediation: `Configure ${header} for production environment`,
        })
      }
    })
  }

  /**
   * Audit browser security features
   */
  private async auditBrowserSecurity(): Promise<void> {
    if (typeof window === 'undefined') return

    // Check for secure context
    if (!window.isSecureContext && import.meta.env.VITE_ENVIRONMENT === 'production') {
      this.addIssue({
        severity: 'high',
        category: 'transport',
        title: 'Not Running in Secure Context',
        description: 'Application not running in secure context (HTTPS)',
        impact: 'Crypto APIs and secure features unavailable',
        remediation: 'Serve application over HTTPS',
        cwe: 'CWE-319',
      })
    }

    // Check for crypto API availability
    if (!window.crypto || !window.crypto.subtle) {
      this.addIssue({
        severity: 'medium',
        category: 'configuration',
        title: 'Crypto API Unavailable',
        description: 'Web Crypto API not available',
        impact: 'Reduced cryptographic capabilities',
        remediation: 'Ensure secure context and modern browser support',
      })
    }
  }

  /**
   * Add security issue to the audit
   */
  private addIssue(issue: SecurityIssue): void {
    this.issues.push(issue)
  }

  /**
   * Calculate overall security score
   */
  private calculateSecurityScore(): number {
    if (this.issues.length === 0) return 100

    const severityWeights = {
      critical: 25,
      high: 15,
      medium: 10,
      low: 5,
      info: 1,
    }

    const totalDeductions = this.issues.reduce((total, issue) => {
      return total + severityWeights[issue.severity]
    }, 0)

    return Math.max(0, 100 - totalDeductions)
  }

  /**
   * Check if there are critical security issues
   */
  private hasCriticalIssues(): boolean {
    return this.issues.some(issue => issue.severity === 'critical')
  }

  /**
   * Generate security recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations = new Set<string>()

    this.issues.forEach(issue => {
      recommendations.add(issue.remediation)
    })

    // Add general recommendations
    recommendations.add('Regularly update dependencies to patch security vulnerabilities')
    recommendations.add('Implement security monitoring and alerting')
    recommendations.add('Conduct regular security audits and penetration testing')
    recommendations.add('Train development team on secure coding practices')

    return Array.from(recommendations)
  }

  /**
   * Generate audit summary
   */
  private generateSummary(score: number, passed: boolean): string {
    const criticalCount = this.issues.filter(i => i.severity === 'critical').length
    const highCount = this.issues.filter(i => i.severity === 'high').length
    const totalIssues = this.issues.length

    let summary = `Security audit ${passed ? 'PASSED' : 'FAILED'} with score ${score}/100. `
    
    if (totalIssues === 0) {
      summary += 'No security issues detected.'
    } else {
      summary += `Found ${totalIssues} issue(s): `
      if (criticalCount > 0) summary += `${criticalCount} critical, `
      if (highCount > 0) summary += `${highCount} high, `
      summary += `${totalIssues - criticalCount - highCount} other.`
    }

    return summary
  }
}

/**
 * Perform quick security audit
 */
export async function performSecurityAudit(config?: Partial<SecurityConfig>): Promise<SecurityAuditResult> {
  const auditor = new SecurityAuditor(config)
  return await auditor.performAudit()
}

/**
 * Export security audit utilities
 */
export default SecurityAuditor
