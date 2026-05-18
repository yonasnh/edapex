import { test, expect } from '@playwright/test'

/**
 * Canvas API Integration E2E Tests
 * 
 * Tests the integration with Canvas LMS API endpoints,
 * including data fetching, error handling, and real-time updates.
 */

test.describe('Canvas API Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated state for API tests
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
    
    await page.goto('/')
  })

  test('should load courses from Canvas API', async ({ page }) => {
    // Mock Canvas API response
    await page.route('**/api/v1/courses', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: 'Advanced Web Development',
            course_code: 'CS401',
            enrollment_term_id: 1,
            created_at: '2024-01-15T10:00:00Z',
          },
          {
            id: 2,
            name: 'Database Systems',
            course_code: 'CS301',
            enrollment_term_id: 1,
            created_at: '2024-01-15T10:00:00Z',
          },
        ]),
      })
    })
    
    // Navigate to courses page
    await page.getByRole('link', { name: /courses/i }).click()
    
    // Should display courses from API
    await expect(page.getByText('Advanced Web Development')).toBeVisible()
    await expect(page.getByText('Database Systems')).toBeVisible()
    await expect(page.getByText('CS401')).toBeVisible()
    await expect(page.getByText('CS301')).toBeVisible()
  })

  test('should handle Canvas API errors gracefully', async ({ page }) => {
    // Mock Canvas API error
    await page.route('**/api/v1/courses', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal Server Error',
          message: 'Canvas API temporarily unavailable',
        }),
      })
    })
    
    // Navigate to courses page
    await page.getByRole('link', { name: /courses/i }).click()
    
    // Should show error state
    await expect(page.getByText(/error loading courses/i)).toBeVisible()
    await expect(page.getByText(/try again/i)).toBeVisible()
    
    // Should provide retry functionality
    const retryButton = page.getByRole('button', { name: /try again/i })
    await expect(retryButton).toBeVisible()
  })

  test('should load assignments for a course', async ({ page }) => {
    // Mock courses API
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
        ]),
      })
    })
    
    // Mock assignments API
    await page.route('**/api/v1/courses/1/assignments', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: 'React Component Assignment',
            course_id: 1,
            due_at: '2024-02-15T23:59:59Z',
            points_possible: 100,
            submission_types: ['online_text_entry'],
          },
          {
            id: 2,
            name: 'Final Project',
            course_id: 1,
            due_at: '2024-03-15T23:59:59Z',
            points_possible: 200,
            submission_types: ['online_upload'],
          },
        ]),
      })
    })
    
    // Navigate to courses and select a course
    await page.getByRole('link', { name: /courses/i }).click()
    await page.getByText('Advanced Web Development').click()
    
    // Should display assignments
    await expect(page.getByText('React Component Assignment')).toBeVisible()
    await expect(page.getByText('Final Project')).toBeVisible()
    await expect(page.getByText('100 points')).toBeVisible()
    await expect(page.getByText('200 points')).toBeVisible()
  })

  test('should handle authentication errors', async ({ page }) => {
    // Mock 401 Unauthorized response
    await page.route('**/api/v1/courses', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'Invalid or expired access token',
        }),
      })
    })
    
    // Navigate to courses page
    await page.getByRole('link', { name: /courses/i }).click()
    
    // Should redirect to login or show authentication error
    await expect(page.getByText(/authentication required/i)).toBeVisible()
    
    // Should provide login option
    const loginButton = page.getByRole('button', { name: /login|sign in/i })
    await expect(loginButton).toBeVisible()
  })

  test('should display loading states during API calls', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/v1/courses', async route => {
      // Delay response to test loading state
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })
    
    // Navigate to courses page
    await page.getByRole('link', { name: /courses/i }).click()
    
    // Should show loading state
    await expect(page.getByTestId('loading-spinner')).toBeVisible()
    await expect(page.getByText(/loading courses/i)).toBeVisible()
    
    // Loading state should disappear after API response
    await expect(page.getByTestId('loading-spinner')).not.toBeVisible({ timeout: 2000 })
  })

  test('should cache API responses', async ({ page }) => {
    let apiCallCount = 0
    
    // Mock Canvas API with call counting
    await page.route('**/api/v1/courses', async route => {
      apiCallCount++
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: 'Test Course',
            course_code: 'TEST101',
          },
        ]),
      })
    })
    
    // Navigate to courses page
    await page.getByRole('link', { name: /courses/i }).click()
    await expect(page.getByText('Test Course')).toBeVisible()
    
    // Navigate away and back
    await page.getByRole('link', { name: /dashboard/i }).click()
    await page.getByRole('link', { name: /courses/i }).click()
    
    // Should display cached data without additional API call
    await expect(page.getByText('Test Course')).toBeVisible()
    
    // API should only be called once due to caching
    expect(apiCallCount).toBe(1)
  })

  test('should handle rate limiting', async ({ page }) => {
    // Mock rate limit response
    await page.route('**/api/v1/courses', async route => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        headers: {
          'Retry-After': '60',
        },
        body: JSON.stringify({
          error: 'Rate Limit Exceeded',
          message: 'Too many requests. Please try again later.',
        }),
      })
    })
    
    // Navigate to courses page
    await page.getByRole('link', { name: /courses/i }).click()
    
    // Should show rate limit message
    await expect(page.getByText(/too many requests/i)).toBeVisible()
    await expect(page.getByText(/try again later/i)).toBeVisible()
  })

  test('should refresh data when requested', async ({ page }) => {
    let apiCallCount = 0
    
    // Mock Canvas API with call counting
    await page.route('**/api/v1/courses', async route => {
      apiCallCount++
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: `Test Course (Call ${apiCallCount})`,
            course_code: 'TEST101',
          },
        ]),
      })
    })
    
    // Navigate to courses page
    await page.getByRole('link', { name: /courses/i }).click()
    await expect(page.getByText('Test Course (Call 1)')).toBeVisible()
    
    // Click refresh button
    const refreshButton = page.getByRole('button', { name: /refresh/i })
    await refreshButton.click()
    
    // Should show updated data
    await expect(page.getByText('Test Course (Call 2)')).toBeVisible()
    
    // API should be called twice
    expect(apiCallCount).toBe(2)
  })

  test('should handle network connectivity issues', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/v1/courses', route => {
      route.abort('failed')
    })
    
    // Navigate to courses page
    await page.getByRole('link', { name: /courses/i }).click()
    
    // Should show network error
    await expect(page.getByText(/network error/i)).toBeVisible()
    await expect(page.getByText(/check your connection/i)).toBeVisible()
    
    // Should provide retry option
    const retryButton = page.getByRole('button', { name: /try again/i })
    await expect(retryButton).toBeVisible()
  })

  test('should validate API response data', async ({ page }) => {
    // Mock invalid API response
    await page.route('**/api/v1/courses', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          invalid: 'response format',
          missing: 'required fields',
        }),
      })
    })
    
    // Navigate to courses page
    await page.getByRole('link', { name: /courses/i }).click()
    
    // Should handle invalid data gracefully
    await expect(page.getByText(/error loading courses/i)).toBeVisible()
    
    // Should not crash the application
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Canvas API Performance', () => {
  test('should load courses within performance budget', async ({ page }) => {
    // Mock Canvas API
    await page.route('**/api/v1/courses', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: 'Test Course',
            course_code: 'TEST101',
          },
        ]),
      })
    })
    
    // Measure performance
    const startTime = Date.now()
    
    // Navigate to courses page
    await page.getByRole('link', { name: /courses/i }).click()
    await expect(page.getByText('Test Course')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should handle large datasets efficiently', async ({ page }) => {
    // Mock large dataset
    const largeCourseList = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `Course ${i + 1}`,
      course_code: `COURSE${String(i + 1).padStart(3, '0')}`,
    }))
    
    await page.route('**/api/v1/courses', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(largeCourseList),
      })
    })
    
    // Navigate to courses page
    await page.getByRole('link', { name: /courses/i }).click()
    
    // Should render efficiently without blocking
    await expect(page.getByText('Course 1')).toBeVisible()
    await expect(page.getByText('Course 100')).toBeVisible()
    
    // Should implement virtualization or pagination for large lists
    const courseElements = await page.locator('[data-testid="course-card"]').count()
    
    // Should not render all 100 courses at once (virtualization)
    expect(courseElements).toBeLessThan(50)
  })
})
