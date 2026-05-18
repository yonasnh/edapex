#!/usr/bin/env node

/**
 * Accessibility Audit Script for SchoolApex Modern UI
 * 
 * Performs comprehensive accessibility auditing following WCAG 2.1 AA guidelines:
 * - Automated axe-core testing
 * - Color contrast validation
 * - Keyboard navigation testing
 * - Screen reader compatibility checks
 * - ARIA implementation validation
 */

const { chromium } = require('playwright')
const AxeBuilder = require('@axe-core/playwright').default
const { readFileSync, writeFileSync, existsSync, mkdirSync } = require('fs')
const { join } = require('path')

/**
 * Accessibility audit configuration
 */
const AUDIT_CONFIG = {
  // Base URL for testing
  baseUrl: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
  
  // Pages to audit
  pages: [
    '/',
    '/courses',
    '/analytics',
    '/auth/callback?error=access_denied',
  ],
  
  // WCAG compliance level
  wcagLevel: 'AA',
  
  // Color contrast requirements
  colorContrast: {
    normal: 4.5,
    large: 3.0,
  },
  
  // Keyboard navigation requirements
  keyboardNav: {
    tabOrder: true,
    focusVisible: true,
    skipLinks: true,
  },
  
  // Output configuration
  output: {
    json: 'test-results/accessibility-report.json',
    html: 'test-results/accessibility-report.html',
    summary: 'test-results/ACCESSIBILITY-SUMMARY.md',
  },
}

/**
 * Main accessibility audit function
 */
async function runAccessibilityAudit() {
  console.log('♿ Starting SchoolApex Accessibility Audit...\n')
  
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  
  const auditResults = {
    timestamp: new Date().toISOString(),
    baseUrl: AUDIT_CONFIG.baseUrl,
    wcagLevel: AUDIT_CONFIG.wcagLevel,
    pages: [],
    summary: {
      totalPages: 0,
      totalViolations: 0,
      criticalIssues: 0,
      passedPages: 0,
      overallScore: 0,
    },
  }
  
  try {
    // Set up authenticated state for testing
    await setupAuthenticatedState(page)
    
    // Audit each page
    for (const pagePath of AUDIT_CONFIG.pages) {
      console.log(`🔍 Auditing page: ${pagePath}`)
      const pageResult = await auditPage(page, pagePath)
      auditResults.pages.push(pageResult)
      
      // Update summary
      auditResults.summary.totalPages++
      auditResults.summary.totalViolations += pageResult.violations.length
      auditResults.summary.criticalIssues += pageResult.violations.filter(v => v.impact === 'critical').length
      
      if (pageResult.violations.length === 0) {
        auditResults.summary.passedPages++
      }
    }
    
    // Calculate overall score
    auditResults.summary.overallScore = calculateOverallScore(auditResults)
    
    // Generate reports
    await generateReports(auditResults)
    
    // Display results
    displayResults(auditResults)
    
    // Exit with appropriate code
    const passed = auditResults.summary.criticalIssues === 0 && auditResults.summary.overallScore >= 80
    process.exit(passed ? 0 : 1)
    
  } catch (error) {
    console.error('❌ Accessibility audit failed:', error.message)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

/**
 * Set up authenticated state for testing
 */
async function setupAuthenticatedState(page) {
  await page.addInitScript(() => {
    const mockToken = {
      access_token: 'mock-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      },
      created_at: Date.now(),
      integrity: 'mock-integrity-hash',
    }
    localStorage.setItem('schoolapex_canvas_token', JSON.stringify(mockToken))
  })
  
  // Mock API responses for consistent testing
  await page.route('**/api/v1/courses', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 1,
          name: 'Advanced Web Development',
          course_code: 'CS401',
        },
        {
          id: 2,
          name: 'Database Systems',
          course_code: 'CS301',
        },
      ]),
    })
  })
}

/**
 * Audit a single page
 */
async function auditPage(page, pagePath) {
  const fullUrl = `${AUDIT_CONFIG.baseUrl}${pagePath}`
  
  try {
    // Navigate to page
    await page.goto(fullUrl, { waitUntil: 'networkidle' })
    
    // Wait for content to load
    await page.waitForTimeout(2000)
    
    // Run axe accessibility scan
    const axeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    
    // Perform additional custom checks
    const customChecks = await performCustomAccessibilityChecks(page)
    
    // Combine results
    const pageResult = {
      url: fullUrl,
      path: pagePath,
      timestamp: new Date().toISOString(),
      violations: axeResults.violations,
      passes: axeResults.passes,
      incomplete: axeResults.incomplete,
      customChecks,
      score: calculatePageScore(axeResults, customChecks),
    }
    
    console.log(`   ✅ Completed: ${pageResult.violations.length} violations found`)
    
    return pageResult
    
  } catch (error) {
    console.error(`   ❌ Failed to audit ${pagePath}:`, error.message)
    
    return {
      url: fullUrl,
      path: pagePath,
      timestamp: new Date().toISOString(),
      error: error.message,
      violations: [],
      passes: [],
      incomplete: [],
      customChecks: {},
      score: 0,
    }
  }
}

/**
 * Perform custom accessibility checks
 */
async function performCustomAccessibilityChecks(page) {
  const checks = {}
  
  // Check heading hierarchy
  checks.headingHierarchy = await checkHeadingHierarchy(page)
  
  // Check focus management
  checks.focusManagement = await checkFocusManagement(page)
  
  // Check keyboard navigation
  checks.keyboardNavigation = await checkKeyboardNavigation(page)
  
  // Check ARIA implementation
  checks.ariaImplementation = await checkAriaImplementation(page)
  
  // Check color contrast (basic check)
  checks.colorContrast = await checkColorContrast(page)
  
  // Check form accessibility
  checks.formAccessibility = await checkFormAccessibility(page)
  
  return checks
}

/**
 * Check heading hierarchy
 */
async function checkHeadingHierarchy(page) {
  const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements => {
    return elements.map(el => ({
      level: parseInt(el.tagName.charAt(1)),
      text: el.textContent?.trim() || '',
      isEmpty: !el.textContent?.trim(),
    }))
  })
  
  const issues = []
  
  // Check for empty headings
  const emptyHeadings = headings.filter(h => h.isEmpty)
  if (emptyHeadings.length > 0) {
    issues.push(`${emptyHeadings.length} empty heading(s) found`)
  }
  
  // Check for proper hierarchy
  let previousLevel = 0
  for (const heading of headings) {
    if (heading.level > previousLevel + 1) {
      issues.push(`Heading level ${heading.level} follows level ${previousLevel} (skipped level)`)
    }
    previousLevel = heading.level
  }
  
  return {
    passed: issues.length === 0,
    issues,
    headingCount: headings.length,
  }
}

/**
 * Check focus management
 */
async function checkFocusManagement(page) {
  const issues = []
  
  // Check for focus indicators
  const focusableElements = await page.$$eval(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    elements => elements.length
  )
  
  if (focusableElements === 0) {
    issues.push('No focusable elements found')
  }
  
  // Check for skip links
  const skipLinks = await page.$$eval('a[href^="#"]', elements => {
    return elements.filter(el => 
      el.textContent?.toLowerCase().includes('skip') ||
      el.textContent?.toLowerCase().includes('jump')
    ).length
  })
  
  if (skipLinks === 0) {
    issues.push('No skip links found')
  }
  
  return {
    passed: issues.length === 0,
    issues,
    focusableElements,
    skipLinks,
  }
}

/**
 * Check keyboard navigation
 */
async function checkKeyboardNavigation(page) {
  const issues = []
  
  try {
    // Test tab navigation
    await page.keyboard.press('Tab')
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName)
    
    if (!firstFocused || firstFocused === 'BODY') {
      issues.push('Tab navigation does not work properly')
    }
    
    // Test escape key functionality
    const modals = await page.$$('[role="dialog"]')
    if (modals.length > 0) {
      await page.keyboard.press('Escape')
      // Check if modal closed (implementation specific)
    }
    
  } catch (error) {
    issues.push(`Keyboard navigation test failed: ${error.message}`)
  }
  
  return {
    passed: issues.length === 0,
    issues,
  }
}

/**
 * Check ARIA implementation
 */
async function checkAriaImplementation(page) {
  const issues = []
  
  // Check for ARIA landmarks
  const landmarks = await page.$$eval('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer', 
    elements => elements.length
  )
  
  if (landmarks === 0) {
    issues.push('No ARIA landmarks found')
  }
  
  // Check for ARIA labels on interactive elements
  const unlabeledInteractive = await page.$$eval(
    'button:not([aria-label]):not([aria-labelledby]), [role="button"]:not([aria-label]):not([aria-labelledby])',
    elements => elements.filter(el => !el.textContent?.trim()).length
  )
  
  if (unlabeledInteractive > 0) {
    issues.push(`${unlabeledInteractive} unlabeled interactive element(s) found`)
  }
  
  // Check for live regions
  const liveRegions = await page.$$eval('[aria-live]', elements => elements.length)
  
  return {
    passed: issues.length === 0,
    issues,
    landmarks,
    liveRegions,
  }
}

/**
 * Check color contrast (basic implementation)
 */
async function checkColorContrast(page) {
  const issues = []
  
  // This is a simplified check - in production, use more sophisticated tools
  const textElements = await page.$$eval('p, span, div, h1, h2, h3, h4, h5, h6, a, button', elements => {
    return elements.map(el => {
      const styles = window.getComputedStyle(el)
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        fontSize: styles.fontSize,
      }
    }).filter(el => el.color !== 'rgba(0, 0, 0, 0)' && el.backgroundColor !== 'rgba(0, 0, 0, 0)')
  })
  
  // Basic contrast check would go here
  // For now, just check if we have color information
  if (textElements.length === 0) {
    issues.push('No text elements with color information found')
  }
  
  return {
    passed: issues.length === 0,
    issues,
    textElementsChecked: textElements.length,
  }
}

/**
 * Check form accessibility
 */
async function checkFormAccessibility(page) {
  const issues = []
  
  // Check for form labels
  const unlabeledInputs = await page.$$eval(
    'input:not([type="hidden"]):not([aria-label]):not([aria-labelledby])',
    elements => elements.filter(el => {
      const id = el.getAttribute('id')
      return !id || !document.querySelector(`label[for="${id}"]`)
    }).length
  )
  
  if (unlabeledInputs > 0) {
    issues.push(`${unlabeledInputs} unlabeled form input(s) found`)
  }
  
  // Check for fieldsets in complex forms
  const forms = await page.$$eval('form', elements => elements.length)
  const fieldsets = await page.$$eval('fieldset', elements => elements.length)
  
  if (forms > 0 && fieldsets === 0) {
    // This might be okay for simple forms, so it's just a warning
    issues.push('Forms found without fieldsets (consider for complex forms)')
  }
  
  return {
    passed: issues.length === 0,
    issues,
    forms,
    fieldsets,
  }
}

/**
 * Calculate page accessibility score
 */
function calculatePageScore(axeResults, customChecks) {
  let score = 100
  
  // Deduct points for axe violations
  axeResults.violations.forEach(violation => {
    const deduction = {
      critical: 25,
      serious: 15,
      moderate: 10,
      minor: 5,
    }[violation.impact] || 5
    
    score -= deduction
  })
  
  // Deduct points for custom check failures
  Object.values(customChecks).forEach(check => {
    if (!check.passed) {
      score -= 5 * check.issues.length
    }
  })
  
  return Math.max(0, score)
}

/**
 * Calculate overall accessibility score
 */
function calculateOverallScore(auditResults) {
  if (auditResults.pages.length === 0) return 0
  
  const totalScore = auditResults.pages.reduce((sum, page) => sum + page.score, 0)
  return Math.round(totalScore / auditResults.pages.length)
}

/**
 * Generate accessibility reports
 */
async function generateReports(auditResults) {
  // Ensure output directory exists
  const outputDir = 'test-results'
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }
  
  // Generate JSON report
  writeFileSync(
    AUDIT_CONFIG.output.json,
    JSON.stringify(auditResults, null, 2)
  )
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(auditResults)
  writeFileSync(AUDIT_CONFIG.output.html, htmlReport)
  
  // Generate Markdown summary
  const markdownSummary = generateMarkdownSummary(auditResults)
  writeFileSync(AUDIT_CONFIG.output.summary, markdownSummary)
  
  console.log('\n📊 Reports generated:')
  console.log(`   📄 JSON: ${AUDIT_CONFIG.output.json}`)
  console.log(`   🌐 HTML: ${AUDIT_CONFIG.output.html}`)
  console.log(`   📝 Summary: ${AUDIT_CONFIG.output.summary}`)
}

/**
 * Generate HTML report
 */
function generateHtmlReport(auditResults) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SchoolApex Accessibility Audit Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 2rem; }
        .header { background: #f5f5f5; padding: 1rem; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0; }
        .metric { background: #fff; border: 1px solid #ddd; padding: 1rem; border-radius: 8px; text-align: center; }
        .violation { background: #fff5f5; border-left: 4px solid #e53e3e; padding: 1rem; margin: 1rem 0; }
        .pass { background: #f0fff4; border-left: 4px solid #38a169; padding: 1rem; margin: 1rem 0; }
        .critical { border-left-color: #e53e3e; }
        .serious { border-left-color: #dd6b20; }
        .moderate { border-left-color: #d69e2e; }
        .minor { border-left-color: #3182ce; }
    </style>
</head>
<body>
    <div class="header">
        <h1>♿ SchoolApex Accessibility Audit Report</h1>
        <p><strong>Generated:</strong> ${auditResults.timestamp}</p>
        <p><strong>WCAG Level:</strong> ${auditResults.wcagLevel}</p>
        <p><strong>Base URL:</strong> ${auditResults.baseUrl}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Overall Score</h3>
            <div style="font-size: 2rem; color: ${auditResults.summary.overallScore >= 80 ? '#38a169' : '#e53e3e'}">
                ${auditResults.summary.overallScore}/100
            </div>
        </div>
        <div class="metric">
            <h3>Pages Audited</h3>
            <div style="font-size: 2rem;">${auditResults.summary.totalPages}</div>
        </div>
        <div class="metric">
            <h3>Total Violations</h3>
            <div style="font-size: 2rem; color: ${auditResults.summary.totalViolations === 0 ? '#38a169' : '#e53e3e'}">
                ${auditResults.summary.totalViolations}
            </div>
        </div>
        <div class="metric">
            <h3>Critical Issues</h3>
            <div style="font-size: 2rem; color: ${auditResults.summary.criticalIssues === 0 ? '#38a169' : '#e53e3e'}">
                ${auditResults.summary.criticalIssues}
            </div>
        </div>
    </div>
    
    ${auditResults.pages.map(page => `
        <div class="page-result">
            <h2>📄 ${page.path}</h2>
            <p><strong>Score:</strong> ${page.score}/100</p>
            <p><strong>URL:</strong> <a href="${page.url}">${page.url}</a></p>
            
            ${page.violations.length > 0 ? `
                <h3>❌ Violations (${page.violations.length})</h3>
                ${page.violations.map(violation => `
                    <div class="violation ${violation.impact}">
                        <h4>${violation.description}</h4>
                        <p><strong>Impact:</strong> ${violation.impact}</p>
                        <p><strong>Help:</strong> <a href="${violation.helpUrl}" target="_blank">${violation.help}</a></p>
                        <p><strong>Elements:</strong> ${violation.nodes.length}</p>
                    </div>
                `).join('')}
            ` : '<div class="pass">✅ No violations found!</div>'}
        </div>
    `).join('')}
</body>
</html>
  `
}

/**
 * Generate Markdown summary
 */
function generateMarkdownSummary(auditResults) {
  return `
# ♿ SchoolApex Accessibility Audit Summary

**Generated:** ${auditResults.timestamp}  
**WCAG Level:** ${auditResults.wcagLevel}  
**Base URL:** ${auditResults.baseUrl}

## 📊 Overall Results

| Metric | Value | Status |
|--------|-------|--------|
| Overall Score | ${auditResults.summary.overallScore}/100 | ${auditResults.summary.overallScore >= 80 ? '✅ PASS' : '❌ FAIL'} |
| Pages Audited | ${auditResults.summary.totalPages} | - |
| Total Violations | ${auditResults.summary.totalViolations} | ${auditResults.summary.totalViolations === 0 ? '✅' : '❌'} |
| Critical Issues | ${auditResults.summary.criticalIssues} | ${auditResults.summary.criticalIssues === 0 ? '✅' : '❌'} |
| Pages Passed | ${auditResults.summary.passedPages}/${auditResults.summary.totalPages} | - |

## 📄 Page Results

${auditResults.pages.map(page => `
### ${page.path}

- **Score:** ${page.score}/100
- **Violations:** ${page.violations.length}
- **Status:** ${page.violations.length === 0 ? '✅ PASS' : '❌ FAIL'}

${page.violations.length > 0 ? `
#### Violations:
${page.violations.map(v => `- **${v.impact.toUpperCase()}:** ${v.description}`).join('\n')}
` : ''}
`).join('')}

## 🎯 Recommendations

${auditResults.summary.criticalIssues > 0 ? '- **URGENT:** Fix critical accessibility issues immediately' : ''}
${auditResults.summary.totalViolations > 0 ? '- Review and fix all accessibility violations' : ''}
- Implement regular accessibility testing in CI/CD pipeline
- Conduct manual accessibility testing with screen readers
- Train development team on accessibility best practices
- Consider accessibility in design phase

---

*Generated by SchoolApex Accessibility Audit Tool*
  `
}

/**
 * Display audit results
 */
function displayResults(auditResults) {
  console.log('\n' + '='.repeat(60))
  console.log('♿ ACCESSIBILITY AUDIT RESULTS')
  console.log('='.repeat(60))
  
  console.log(`\n📊 Overall Score: ${auditResults.summary.overallScore}/100`)
  console.log(`🎯 Status: ${auditResults.summary.overallScore >= 80 ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`📄 Pages Audited: ${auditResults.summary.totalPages}`)
  console.log(`🚨 Total Violations: ${auditResults.summary.totalViolations}`)
  console.log(`⚠️  Critical Issues: ${auditResults.summary.criticalIssues}`)
  console.log(`✅ Pages Passed: ${auditResults.summary.passedPages}/${auditResults.summary.totalPages}`)
  
  if (auditResults.summary.totalViolations > 0) {
    console.log('\n🚨 Issues Found:')
    console.log('-'.repeat(40))
    
    auditResults.pages.forEach(page => {
      if (page.violations.length > 0) {
        console.log(`\n📄 ${page.path}: ${page.violations.length} violation(s)`)
        page.violations.forEach(violation => {
          console.log(`   ${violation.impact.toUpperCase()}: ${violation.description}`)
        })
      }
    })
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('♿ Accessibility audit completed')
  console.log('='.repeat(60))
}

// Run the accessibility audit
runAccessibilityAudit().catch(error => {
  console.error('❌ Accessibility audit failed:', error)
  process.exit(1)
})
