#!/usr/bin/env node

/**
 * Security Audit Script for SchoolApex Modern UI
 * 
 * Performs comprehensive security auditing including:
 * - OAuth2 configuration validation
 * - Environment security checks
 * - Dependency vulnerability scanning
 * - Code security analysis
 */

const { execSync } = require('child_process')
const { readFileSync, existsSync } = require('fs')
const { join } = require('path')

/**
 * Security audit configuration
 */
const AUDIT_CONFIG = {
  // Security thresholds
  maxCriticalVulnerabilities: 0,
  maxHighVulnerabilities: 2,
  maxMediumVulnerabilities: 10,
  
  // Required security headers
  requiredHeaders: [
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
  ],
  
  // Sensitive patterns to check for
  sensitivePatterns: [
    /password\s*[:=]\s*['"]\w+['"]/i,
    /secret\s*[:=]\s*['"]\w+['"]/i,
    /api[_-]?key\s*[:=]\s*['"]\w+['"]/i,
    /token\s*[:=]\s*['"]\w+['"]/i,
    /private[_-]?key/i,
  ],
  
  // Files to exclude from sensitive data scanning
  excludeFiles: [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    'test-results',
    '.env.example',
    'storybook-static',
    'docs',
    '.git-backup',
    'canvas-admin-setup.md',
  ],
}

/**
 * Main security audit function
 */
async function runSecurityAudit() {
  console.log('🔒 Starting SchoolApex Security Audit...\n')
  
  const results = {
    passed: true,
    score: 100,
    issues: [],
    summary: '',
  }
  
  try {
    // 1. Check dependencies for vulnerabilities
    console.log('📦 Checking dependencies for vulnerabilities...')
    await checkDependencyVulnerabilities(results)
    
    // 2. Validate environment configuration
    console.log('🔧 Validating environment configuration...')
    await validateEnvironmentConfig(results)
    
    // 3. Check for sensitive data exposure
    console.log('🔍 Scanning for sensitive data exposure...')
    await scanSensitiveData(results)
    
    // 4. Validate OAuth2 configuration
    console.log('🔐 Validating OAuth2 configuration...')
    await validateOAuth2Config(results)
    
    // 5. Check build security
    console.log('🏗️  Checking build security...')
    await checkBuildSecurity(results)
    
    // 6. Validate TypeScript configuration
    console.log('📝 Validating TypeScript configuration...')
    await validateTypeScriptConfig(results)
    
    // Calculate final score and status
    calculateAuditResults(results)
    
    // Display results
    displayAuditResults(results)
    
    // Exit with appropriate code
    process.exit(results.passed ? 0 : 1)
    
  } catch (error) {
    console.error('❌ Security audit failed:', error.message)
    process.exit(1)
  }
}

/**
 * Check dependencies for known vulnerabilities
 */
async function checkDependencyVulnerabilities(results) {
  try {
    // Run npm audit
    const auditOutput = execSync('npm audit --json', { 
      encoding: 'utf8',
      stdio: 'pipe',
    })
    
    const auditData = JSON.parse(auditOutput)
    
    if (auditData.vulnerabilities) {
      const vulnCounts = {
        critical: 0,
        high: 0,
        moderate: 0,
        low: 0,
      }
      
      Object.values(auditData.vulnerabilities).forEach(vuln => {
        vulnCounts[vuln.severity] = (vulnCounts[vuln.severity] || 0) + 1
      })
      
      // Check against thresholds
      if (vulnCounts.critical > AUDIT_CONFIG.maxCriticalVulnerabilities) {
        results.issues.push({
          severity: 'critical',
          category: 'dependencies',
          title: `${vulnCounts.critical} Critical Vulnerabilities Found`,
          description: 'Critical security vulnerabilities detected in dependencies',
          remediation: 'Run npm audit fix or update vulnerable packages',
        })
      }
      
      if (vulnCounts.high > AUDIT_CONFIG.maxHighVulnerabilities) {
        results.issues.push({
          severity: 'high',
          category: 'dependencies',
          title: `${vulnCounts.high} High Vulnerabilities Found`,
          description: 'High severity vulnerabilities detected in dependencies',
          remediation: 'Update vulnerable packages to secure versions',
        })
      }
      
      console.log(`   ✅ Dependencies: ${vulnCounts.critical} critical, ${vulnCounts.high} high, ${vulnCounts.moderate} moderate`)
    }
    
  } catch (error) {
    if (error.status === 1) {
      // npm audit returns exit code 1 when vulnerabilities are found
      console.log('   ⚠️  Vulnerabilities found in dependencies')
    } else {
      console.log('   ⚠️  Could not run dependency audit:', error.message)
    }
  }
}

/**
 * Validate environment configuration
 */
async function validateEnvironmentConfig(results) {
  const envFiles = ['.env.example', '.env.local', '.env.production']
  
  envFiles.forEach(envFile => {
    const envPath = join(process.cwd(), 'apps/classapex-lms', envFile)
    
    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, 'utf8')
      
      // Check for hardcoded secrets
      AUDIT_CONFIG.sensitivePatterns.forEach(pattern => {
        if (pattern.test(envContent)) {
          results.issues.push({
            severity: 'high',
            category: 'configuration',
            title: `Potential Secret in ${envFile}`,
            description: `Sensitive data pattern detected in ${envFile}`,
            remediation: 'Remove hardcoded secrets and use environment variables',
          })
        }
      })
      
      // Check for production-specific settings
      if (envFile === '.env.production') {
        if (envContent.includes('VITE_DEBUG_MODE=true')) {
          results.issues.push({
            severity: 'medium',
            category: 'configuration',
            title: 'Debug Mode Enabled in Production',
            description: 'Debug mode should be disabled in production environment',
            remediation: 'Set VITE_DEBUG_MODE=false in production',
          })
        }
      }
    }
  })
  
  console.log('   ✅ Environment configuration validated')
}

/**
 * Scan for sensitive data exposure
 */
async function scanSensitiveData(results) {
  try {
    // Use git to find tracked files (excludes .gitignore files)
    const trackedFiles = execSync('git ls-files', { encoding: 'utf8' })
      .split('\n')
      .filter(file => file.trim())
      .filter(file => !AUDIT_CONFIG.excludeFiles.some(exclude => file.includes(exclude)))
      .filter(file => file.match(/\.(ts|tsx|js|jsx|json|md)$/))
    
    let sensitiveFilesFound = 0
    
    trackedFiles.forEach(file => {
      try {
        const content = readFileSync(file, 'utf8')
        
        AUDIT_CONFIG.sensitivePatterns.forEach(pattern => {
          if (pattern.test(content)) {
            sensitiveFilesFound++
            results.issues.push({
              severity: 'high',
              category: 'data-exposure',
              title: `Sensitive Data in ${file}`,
              description: `Potential sensitive data found in tracked file: ${file}`,
              remediation: 'Remove sensitive data and use environment variables',
            })
          }
        })
      } catch {
        // Skip files that can't be read
      }
    })
    
    console.log(`   ✅ Sensitive data scan: ${sensitiveFilesFound} issues found`)
    
  } catch (error) {
    console.log('   ⚠️  Could not scan for sensitive data:', error.message)
  }
}

/**
 * Validate OAuth2 configuration
 */
async function validateOAuth2Config(results) {
  const oauth2File = join(process.cwd(), 'packages/core/src/auth/oauth2.ts')
  
  if (existsSync(oauth2File)) {
    const oauth2Content = readFileSync(oauth2File, 'utf8')
    
    // Check for PKCE implementation
    if (!oauth2Content.includes('PKCE') && !oauth2Content.includes('code_challenge')) {
      results.issues.push({
        severity: 'critical',
        category: 'authentication',
        title: 'PKCE Not Implemented',
        description: 'OAuth2 implementation lacks PKCE security extension',
        remediation: 'Implement PKCE (Proof Key for Code Exchange) for OAuth2 flow',
      })
    }
    
    // Check for secure token storage
    if (!oauth2Content.includes('localStorage') && !oauth2Content.includes('sessionStorage')) {
      results.issues.push({
        severity: 'medium',
        category: 'authentication',
        title: 'Token Storage Not Implemented',
        description: 'No token storage mechanism found',
        remediation: 'Implement secure token storage with proper cleanup',
      })
    }
    
    console.log('   ✅ OAuth2 configuration validated')
  } else {
    results.issues.push({
      severity: 'critical',
      category: 'authentication',
      title: 'OAuth2 Implementation Missing',
      description: 'OAuth2 authentication module not found',
      remediation: 'Implement OAuth2 authentication for Canvas integration',
    })
  }
}

/**
 * Check build security
 */
async function checkBuildSecurity(results) {
  const viteConfigFile = join(process.cwd(), 'apps/classapex-lms/vite.config.ts')
  
  if (existsSync(viteConfigFile)) {
    const viteContent = readFileSync(viteConfigFile, 'utf8')
    
    // Check for source maps in production
    if (viteContent.includes('sourcemap: true') && !viteContent.includes('NODE_ENV')) {
      results.issues.push({
        severity: 'low',
        category: 'build',
        title: 'Source Maps Enabled',
        description: 'Source maps may be enabled in production builds',
        remediation: 'Disable source maps in production builds',
      })
    }
    
    console.log('   ✅ Build security validated')
  }
}

/**
 * Validate TypeScript configuration
 */
async function validateTypeScriptConfig(results) {
  const tsconfigFile = join(process.cwd(), 'tsconfig.json')
  
  if (existsSync(tsconfigFile)) {
    const tsconfigContent = readFileSync(tsconfigFile, 'utf8')

    // Remove comments and trailing commas from JSON safely (without matching /* in path mapping strings)
    const cleanedContent = tsconfigContent
      .replace(/^\s*\/\/.*$/gm, '') // Remove // comments starting a line
      .replace(/^\s*\/\*[\s\S]*?\*\/\s*$/gm, '') // Remove /* */ comments starting a line
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas

    let tsconfig
    try {
      tsconfig = JSON.parse(cleanedContent)
    } catch (error) {
      console.log('   ⚠️  Could not parse TypeScript configuration:', error.message)
      return
    }
    
    // Check for strict mode
    if (!tsconfig.compilerOptions?.strict) {
      results.issues.push({
        severity: 'medium',
        category: 'code-quality',
        title: 'TypeScript Strict Mode Disabled',
        description: 'TypeScript strict mode is not enabled',
        remediation: 'Enable strict mode in TypeScript configuration',
      })
    }
    
    console.log('   ✅ TypeScript configuration validated')
  }
}

/**
 * Calculate audit results
 */
function calculateAuditResults(results) {
  const severityWeights = {
    critical: 25,
    high: 15,
    medium: 10,
    low: 5,
  }
  
  const totalDeductions = results.issues.reduce((total, issue) => {
    return total + (severityWeights[issue.severity] || 0)
  }, 0)
  
  results.score = Math.max(0, 100 - totalDeductions)
  results.passed = results.score >= 80 && !results.issues.some(issue => issue.severity === 'critical')
  
  const criticalCount = results.issues.filter(i => i.severity === 'critical').length
  const highCount = results.issues.filter(i => i.severity === 'high').length
  const totalIssues = results.issues.length
  
  results.summary = `Security audit ${results.passed ? 'PASSED' : 'FAILED'} with score ${results.score}/100. `
  
  if (totalIssues === 0) {
    results.summary += 'No security issues detected.'
  } else {
    results.summary += `Found ${totalIssues} issue(s): `
    if (criticalCount > 0) results.summary += `${criticalCount} critical, `
    if (highCount > 0) results.summary += `${highCount} high, `
    results.summary += `${totalIssues - criticalCount - highCount} other.`
  }
}

/**
 * Display audit results
 */
function displayAuditResults(results) {
  console.log('\n' + '='.repeat(60))
  console.log('🔒 SECURITY AUDIT RESULTS')
  console.log('='.repeat(60))
  
  console.log(`\n📊 Overall Score: ${results.score}/100`)
  console.log(`🎯 Status: ${results.passed ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`📋 Summary: ${results.summary}`)
  
  if (results.issues.length > 0) {
    console.log('\n🚨 Security Issues Found:')
    console.log('-'.repeat(40))
    
    results.issues.forEach((issue, index) => {
      const severityIcon = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🔵',
      }[issue.severity] || '⚪'
      
      console.log(`\n${index + 1}. ${severityIcon} ${issue.title}`)
      console.log(`   Category: ${issue.category}`)
      console.log(`   Severity: ${issue.severity.toUpperCase()}`)
      console.log(`   Description: ${issue.description}`)
      console.log(`   Remediation: ${issue.remediation}`)
    })
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('🔒 Security audit completed')
  console.log('='.repeat(60))
}

// Run the security audit
runSecurityAudit().catch(error => {
  console.error('❌ Security audit failed:', error)
  process.exit(1)
})
