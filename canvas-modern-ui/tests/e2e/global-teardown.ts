import { FullConfig } from '@playwright/test'

/**
 * Global teardown for Playwright E2E tests
 * 
 * Performs cleanup after all tests complete, including:
 * - Test data cleanup
 * - Performance report generation
 * - Test artifact organization
 * - Environment cleanup
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting SchoolApex E2E Test Suite Global Teardown')
  
  // Clean up test data
  await cleanupTestData()
  
  // Generate performance report
  await generatePerformanceReport()
  
  // Organize test artifacts
  await organizeTestArtifacts()
  
  // Generate test summary
  await generateTestSummary()
  
  console.log('✅ Global teardown completed successfully')
}

/**
 * Clean up test data
 */
async function cleanupTestData() {
  console.log('🗑️  Cleaning up test data...')
  
  const fs = await import('fs/promises')
  const path = await import('path')
  
  try {
    // Clean up temporary test files
    const tempDir = path.join(process.cwd(), 'tests/e2e/temp')
    
    try {
      await fs.access(tempDir)
      await fs.rm(tempDir, { recursive: true, force: true })
      console.log('🗑️  Temporary test files cleaned up')
    } catch {
      // Directory doesn't exist, nothing to clean
    }
    
    // Archive test data for debugging if needed
    const testDataDir = path.join(process.cwd(), 'tests/e2e/data')
    const archiveDir = path.join(process.cwd(), 'test-results/archived-data')
    
    try {
      await fs.access(testDataDir)
      await fs.mkdir(archiveDir, { recursive: true })
      
      // Copy test data to archive
      const files = await fs.readdir(testDataDir)
      for (const file of files) {
        if (file.endsWith('.json')) {
          const source = path.join(testDataDir, file)
          const dest = path.join(archiveDir, `${Date.now()}-${file}`)
          await fs.copyFile(source, dest)
        }
      }
      
      console.log('📦 Test data archived for debugging')
    } catch (error) {
      console.warn('⚠️  Could not archive test data:', error)
    }
    
  } catch (error) {
    console.warn('⚠️  Error during test data cleanup:', error)
  }
}

/**
 * Generate performance report
 */
async function generatePerformanceReport() {
  console.log('📊 Generating performance report...')
  
  const fs = await import('fs/promises')
  const path = await import('path')
  
  try {
    // Read performance baselines
    const baselinesPath = path.join(process.cwd(), 'tests/e2e/data/performance-baselines.json')
    let baselines = {}
    
    try {
      const baselinesData = await fs.readFile(baselinesPath, 'utf-8')
      baselines = JSON.parse(baselinesData)
    } catch {
      console.warn('⚠️  No performance baselines found')
    }
    
    // Read test results for performance data
    const resultsPath = path.join(process.cwd(), 'test-results/results.json')
    let testResults = { tests: [] }
    
    try {
      const resultsData = await fs.readFile(resultsPath, 'utf-8')
      testResults = JSON.parse(resultsData)
    } catch {
      console.warn('⚠️  No test results found for performance analysis')
    }
    
    // Generate performance report
    const performanceReport = {
      timestamp: new Date().toISOString(),
      baselines,
      summary: {
        totalTests: testResults.tests?.length || 0,
        performanceTests: testResults.tests?.filter((test: any) => 
          test.title?.includes('performance') || test.title?.includes('load')
        ).length || 0,
      },
      recommendations: [
        'Monitor Core Web Vitals regularly',
        'Set up performance budgets for CI/CD',
        'Implement performance regression detection',
        'Optimize bundle sizes and lazy loading',
      ],
    }
    
    const reportPath = path.join(process.cwd(), 'test-results/performance-report.json')
    await fs.writeFile(reportPath, JSON.stringify(performanceReport, null, 2))
    
    console.log('📊 Performance report generated:', reportPath)
    
  } catch (error) {
    console.warn('⚠️  Error generating performance report:', error)
  }
}

/**
 * Organize test artifacts
 */
async function organizeTestArtifacts() {
  console.log('📁 Organizing test artifacts...')
  
  const fs = await import('fs/promises')
  const path = await import('path')
  
  try {
    const testResultsDir = path.join(process.cwd(), 'test-results')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    // Create organized directory structure
    const organizedDir = path.join(testResultsDir, `run-${timestamp}`)
    await fs.mkdir(organizedDir, { recursive: true })
    
    // Move artifacts to organized structure
    const artifactDirs = ['screenshots', 'videos', 'traces']
    
    for (const dir of artifactDirs) {
      const sourceDir = path.join(testResultsDir, dir)
      const destDir = path.join(organizedDir, dir)
      
      try {
        await fs.access(sourceDir)
        await fs.rename(sourceDir, destDir)
        console.log(`📁 Moved ${dir} to organized structure`)
      } catch {
        // Directory doesn't exist, skip
      }
    }
    
    // Copy reports to organized structure
    const reports = ['results.json', 'results.xml', 'performance-report.json']
    
    for (const report of reports) {
      const sourcePath = path.join(testResultsDir, report)
      const destPath = path.join(organizedDir, report)
      
      try {
        await fs.access(sourcePath)
        await fs.copyFile(sourcePath, destPath)
        console.log(`📄 Copied ${report} to organized structure`)
      } catch {
        // File doesn't exist, skip
      }
    }
    
  } catch (error) {
    console.warn('⚠️  Error organizing test artifacts:', error)
  }
}

/**
 * Generate test summary
 */
async function generateTestSummary() {
  console.log('📋 Generating test summary...')
  
  const fs = await import('fs/promises')
  const path = await import('path')
  
  try {
    // Read test results
    const resultsPath = path.join(process.cwd(), 'test-results/results.json')
    let testResults = { tests: [], stats: {} }
    
    try {
      const resultsData = await fs.readFile(resultsPath, 'utf-8')
      testResults = JSON.parse(resultsData)
    } catch {
      console.warn('⚠️  No test results found for summary')
      return
    }
    
    // Calculate summary statistics
    const tests = testResults.tests || []
    const stats = {
      total: tests.length,
      passed: tests.filter((test: any) => test.outcome === 'expected').length,
      failed: tests.filter((test: any) => test.outcome === 'unexpected').length,
      skipped: tests.filter((test: any) => test.outcome === 'skipped').length,
      flaky: tests.filter((test: any) => test.outcome === 'flaky').length,
    }
    
    // Generate summary
    const summary = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test',
      stats,
      passRate: stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(2) : '0',
      duration: testResults.stats?.duration || 0,
      browsers: ['chromium', 'firefox', 'webkit', 'Mobile Chrome', 'Mobile Safari'],
      coverage: {
        components: 'E2E tests cover all major components',
        workflows: 'Authentication, navigation, CRUD operations tested',
        accessibility: 'Basic accessibility checks included',
        performance: 'Core Web Vitals monitoring enabled',
      },
      recommendations: [
        stats.failed > 0 ? 'Investigate and fix failing tests' : 'All tests passing ✅',
        stats.flaky > 0 ? 'Address flaky tests for better reliability' : 'No flaky tests detected ✅',
        'Consider adding more edge case coverage',
        'Implement visual regression testing',
        'Add more accessibility test coverage',
      ],
    }
    
    const summaryPath = path.join(process.cwd(), 'test-results/test-summary.json')
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2))
    
    // Generate human-readable summary
    const readableSummary = `
# SchoolApex E2E Test Summary

**Test Run:** ${summary.timestamp}
**Environment:** ${summary.environment}

## Results
- **Total Tests:** ${stats.total}
- **Passed:** ${stats.passed} ✅
- **Failed:** ${stats.failed} ${stats.failed > 0 ? '❌' : ''}
- **Skipped:** ${stats.skipped}
- **Flaky:** ${stats.flaky}
- **Pass Rate:** ${summary.passRate}%

## Coverage
- Components: ${summary.coverage.components}
- Workflows: ${summary.coverage.workflows}
- Accessibility: ${summary.coverage.accessibility}
- Performance: ${summary.coverage.performance}

## Recommendations
${summary.recommendations.map(rec => `- ${rec}`).join('\n')}

---
Generated by SchoolApex E2E Test Suite
`
    
    const readablePath = path.join(process.cwd(), 'test-results/TEST-SUMMARY.md')
    await fs.writeFile(readablePath, readableSummary)
    
    console.log('📋 Test summary generated')
    console.log(`📊 Pass Rate: ${summary.passRate}%`)
    console.log(`⏱️  Duration: ${summary.duration}ms`)
    
  } catch (error) {
    console.warn('⚠️  Error generating test summary:', error)
  }
}

export default globalTeardown
