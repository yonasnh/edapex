import { chromium, FullConfig } from '@playwright/test'

/**
 * Global setup for Playwright E2E tests
 * 
 * Performs one-time setup before all tests run, including:
 * - Environment validation
 * - Test data preparation
 * - Authentication setup
 * - Performance baseline establishment
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting SchoolApex E2E Test Suite Global Setup')
  
  // Validate environment
  await validateEnvironment()
  
  // Setup test authentication if needed
  await setupTestAuthentication()
  
  // Prepare test data
  await prepareTestData()
  
  // Establish performance baselines
  await establishPerformanceBaselines()
  
  console.log('✅ Global setup completed successfully')
}

/**
 * Validate test environment configuration
 */
async function validateEnvironment() {
  console.log('🔍 Validating test environment...')
  
  const requiredEnvVars = [
    'VITE_CANVAS_BASE_URL',
    'VITE_CANVAS_CLIENT_ID',
    'VITE_OAUTH2_REDIRECT_URI',
  ]
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`)
    console.warn('Some tests may be skipped or use mock data')
  }
  
  // Check if Canvas instance is accessible
  const canvasBaseUrl = process.env.VITE_CANVAS_BASE_URL
  if (canvasBaseUrl) {
    try {
      const response = await fetch(`${canvasBaseUrl}/api/v1/courses`, {
        method: 'HEAD',
      })
      console.log(`📡 Canvas instance accessible: ${response.status}`)
    } catch (error) {
      console.warn('⚠️  Canvas instance not accessible, using mock mode')
    }
  }
}

/**
 * Setup test authentication
 */
async function setupTestAuthentication() {
  console.log('🔐 Setting up test authentication...')
  
  // For E2E tests, we'll use a test user account
  // In a real scenario, you'd set up a dedicated test user
  const testUser = {
    username: process.env.TEST_CANVAS_USERNAME || 'test-user',
    password: process.env.TEST_CANVAS_PASSWORD || 'test-password',
  }
  
  if (testUser.username === 'test-user') {
    console.warn('⚠️  Using default test credentials - configure TEST_CANVAS_USERNAME and TEST_CANVAS_PASSWORD')
  }
  
  // Store test credentials for use in tests
  process.env.E2E_TEST_USERNAME = testUser.username
  process.env.E2E_TEST_PASSWORD = testUser.password
}

/**
 * Prepare test data
 */
async function prepareTestData() {
  console.log('📊 Preparing test data...')
  
  // Create test data directory if it doesn't exist
  const fs = await import('fs/promises')
  const path = await import('path')
  
  const testDataDir = path.join(process.cwd(), 'tests/e2e/data')
  
  try {
    await fs.access(testDataDir)
  } catch {
    await fs.mkdir(testDataDir, { recursive: true })
  }
  
  // Generate mock data for offline testing
  const mockData = {
    courses: [
      {
        id: 'test-course-1',
        name: 'Test Course 1',
        course_code: 'TEST101',
        enrollment_term_id: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'test-course-2',
        name: 'Test Course 2',
        course_code: 'TEST102',
        enrollment_term_id: 1,
        created_at: new Date().toISOString(),
      },
    ],
    assignments: [
      {
        id: 'test-assignment-1',
        name: 'Test Assignment 1',
        course_id: 'test-course-1',
        due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        points_possible: 100,
      },
    ],
    users: [
      {
        id: 'test-user-1',
        name: 'Test User',
        email: 'test@example.com',
        avatar_url: null,
      },
    ],
  }
  
  await fs.writeFile(
    path.join(testDataDir, 'mock-data.json'),
    JSON.stringify(mockData, null, 2)
  )
}

/**
 * Establish performance baselines
 */
async function establishPerformanceBaselines() {
  console.log('⚡ Establishing performance baselines...')
  
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Navigate to the application
    await page.goto('http://localhost:3001')
    
    // Measure initial load performance
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      }
    })
    
    console.log('📊 Performance baselines:', performanceMetrics)
    
    // Store baselines for comparison in tests
    const fs = await import('fs/promises')
    const path = await import('path')
    
    await fs.writeFile(
      path.join(process.cwd(), 'tests/e2e/data/performance-baselines.json'),
      JSON.stringify(performanceMetrics, null, 2)
    )
    
  } catch (error) {
    console.warn('⚠️  Could not establish performance baselines:', error)
  } finally {
    await browser.close()
  }
}

export default globalSetup
