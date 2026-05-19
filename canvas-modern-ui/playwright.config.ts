import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration for SchoolApex Modern UI
 * 
 * Comprehensive E2E testing configuration following best practices
 * for Canvas LMS integration testing and cross-browser compatibility.
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ...(process.env.CI ? [['github']] : [['list']]),
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Global timeout for each action
    actionTimeout: 30000,
    
    // Global timeout for navigation
    navigationTimeout: 30000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Tablet testing
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
    
    // High DPI testing
    {
      name: 'High DPI',
      use: {
        ...devices['Desktop Chrome'],
        deviceScaleFactor: 2,
      },
    },
    
    // Accessibility testing
    {
      name: 'Accessibility',
      use: {
        ...devices['Desktop Chrome'],
        // Enable accessibility tree snapshots
        extraHTTPHeaders: {
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  
  // Global setup and teardown
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  
  // Test timeout
  timeout: 60000,
  
  // Expect timeout
  expect: {
    timeout: 10000,
  },
  
  // Output directory for test artifacts
  outputDir: 'test-results/',
  
  // Test metadata
  metadata: {
    'test-suite': 'SchoolApex Modern UI E2E Tests',
    'version': '1.0.0',
    'environment': process.env.NODE_ENV || 'test',
  },
})
