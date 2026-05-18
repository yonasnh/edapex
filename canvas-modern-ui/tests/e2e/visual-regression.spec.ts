import { test, expect } from '@playwright/test'

/**
 * Visual Regression Tests
 * 
 * Tests visual consistency across different browsers, screen sizes,
 * and user interactions to ensure UI/UX quality and prevent regressions.
 */

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated state for consistent screenshots
    await page.addInitScript(() => {
      const mockToken = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          avatar_url: 'https://example.com/avatar.jpg',
        },
        created_at: Date.now(),
        integrity: 'mock-integrity-hash',
      }
      localStorage.setItem('schoolapex_canvas_token', JSON.stringify(mockToken))
    })

    // Mock consistent API responses for visual tests
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
          },
        ]),
      })
    })
  })

  test('should match dashboard layout', async ({ page }) => {
    await page.goto('/')
    
    // Wait for content to load
    await expect(page.getByTestId('dashboard-content')).toBeVisible()
    
    // Take screenshot of full page
    await expect(page).toHaveScreenshot('dashboard-full-page.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should match course cards layout', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /courses/i }).click()
    
    // Wait for courses to load
    await expect(page.getByText('Advanced Web Development')).toBeVisible()
    
    // Take screenshot of course cards
    await expect(page.getByTestId('courses-grid')).toHaveScreenshot('course-cards.png', {
      animations: 'disabled',
    })
  })

  test('should match navigation sidebar', async ({ page }) => {
    await page.goto('/')
    
    // Ensure sidebar is visible
    await expect(page.getByTestId('navigation-sidebar')).toBeVisible()
    
    // Take screenshot of sidebar
    await expect(page.getByTestId('navigation-sidebar')).toHaveScreenshot('navigation-sidebar.png', {
      animations: 'disabled',
    })
  })

  test('should match header layout', async ({ page }) => {
    await page.goto('/')
    
    // Wait for header to load
    await expect(page.getByTestId('app-header')).toBeVisible()
    
    // Take screenshot of header
    await expect(page.getByTestId('app-header')).toHaveScreenshot('app-header.png', {
      animations: 'disabled',
    })
  })

  test('should match assignment cards', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /courses/i }).click()
    await page.getByText('Advanced Web Development').click()
    
    // Wait for assignments to load
    await expect(page.getByText('React Component Assignment')).toBeVisible()
    
    // Take screenshot of assignment cards
    await expect(page.getByTestId('assignments-list')).toHaveScreenshot('assignment-cards.png', {
      animations: 'disabled',
    })
  })

  test('should match analytics dashboard', async ({ page }) => {
    // Mock analytics data
    await page.route('**/api/v1/courses/*/analytics/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { date: '2024-01-01', value: 85 },
            { date: '2024-01-02', value: 92 },
            { date: '2024-01-03', value: 78 },
          ],
        }),
      })
    })

    await page.goto('/')
    await page.getByRole('link', { name: /analytics/i }).click()
    
    // Wait for charts to render
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible()
    await page.waitForTimeout(1000) // Allow charts to fully render
    
    // Take screenshot of analytics dashboard
    await expect(page.getByTestId('analytics-dashboard')).toHaveScreenshot('analytics-dashboard.png', {
      animations: 'disabled',
    })
  })

  test('should match error states', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/courses', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal Server Error',
        }),
      })
    })

    await page.goto('/')
    await page.getByRole('link', { name: /courses/i }).click()
    
    // Wait for error state
    await expect(page.getByText(/error loading courses/i)).toBeVisible()
    
    // Take screenshot of error state
    await expect(page.getByTestId('error-boundary')).toHaveScreenshot('error-state.png', {
      animations: 'disabled',
    })
  })

  test('should match loading states', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/v1/courses', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.goto('/')
    await page.getByRole('link', { name: /courses/i }).click()
    
    // Capture loading state
    await expect(page.getByTestId('loading-spinner')).toBeVisible()
    
    // Take screenshot of loading state
    await expect(page.getByTestId('loading-container')).toHaveScreenshot('loading-state.png', {
      animations: 'disabled',
    })
  })

  test('should match empty states', async ({ page }) => {
    // Mock empty API response
    await page.route('**/api/v1/courses', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.goto('/')
    await page.getByRole('link', { name: /courses/i }).click()
    
    // Wait for empty state
    await expect(page.getByText(/no courses found/i)).toBeVisible()
    
    // Take screenshot of empty state
    await expect(page.getByTestId('empty-courses-state')).toHaveScreenshot('empty-courses-state.png', {
      animations: 'disabled',
    })
  })
})

test.describe('Responsive Visual Tests', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'large-desktop', width: 1920, height: 1080 },
  ]

  viewports.forEach(({ name, width, height }) => {
    test(`should match dashboard layout on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      
      // Wait for content to load
      await expect(page.getByTestId('dashboard-content')).toBeVisible()
      
      // Take screenshot for this viewport
      await expect(page).toHaveScreenshot(`dashboard-${name}.png`, {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test(`should match navigation on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      
      // Handle mobile navigation (hamburger menu)
      if (width < 768) {
        const menuButton = page.getByTestId('mobile-menu-button')
        if (await menuButton.isVisible()) {
          await menuButton.click()
        }
      }
      
      // Wait for navigation to be visible
      await expect(page.getByTestId('navigation-sidebar')).toBeVisible()
      
      // Take screenshot of navigation
      await expect(page.getByTestId('navigation-sidebar')).toHaveScreenshot(`navigation-${name}.png`, {
        animations: 'disabled',
      })
    })
  })
})

test.describe('Theme Visual Tests', () => {
  const themes = ['light', 'dark']

  themes.forEach(theme => {
    test(`should match dashboard in ${theme} theme`, async ({ page }) => {
      // Set theme preference
      await page.addInitScript((theme) => {
        localStorage.setItem('schoolapex_theme', theme)
      }, theme)

      await page.goto('/')
      
      // Wait for theme to apply
      await page.waitForTimeout(500)
      
      // Wait for content to load
      await expect(page.getByTestId('dashboard-content')).toBeVisible()
      
      // Take screenshot for this theme
      await expect(page).toHaveScreenshot(`dashboard-${theme}-theme.png`, {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test(`should match course cards in ${theme} theme`, async ({ page }) => {
      // Set theme preference
      await page.addInitScript((theme) => {
        localStorage.setItem('schoolapex_theme', theme)
      }, theme)

      await page.goto('/')
      await page.getByRole('link', { name: /courses/i }).click()
      
      // Wait for theme to apply and content to load
      await page.waitForTimeout(500)
      await expect(page.getByText('Advanced Web Development')).toBeVisible()
      
      // Take screenshot for this theme
      await expect(page.getByTestId('courses-grid')).toHaveScreenshot(`course-cards-${theme}-theme.png`, {
        animations: 'disabled',
      })
    })
  })
})

test.describe('Interaction Visual Tests', () => {
  test('should match hover states', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /courses/i }).click()
    
    // Wait for courses to load
    await expect(page.getByText('Advanced Web Development')).toBeVisible()
    
    // Hover over first course card
    const firstCourseCard = page.getByTestId('course-card').first()
    await firstCourseCard.hover()
    
    // Take screenshot of hover state
    await expect(firstCourseCard).toHaveScreenshot('course-card-hover.png', {
      animations: 'disabled',
    })
  })

  test('should match focus states', async ({ page }) => {
    await page.goto('/')
    
    // Focus on navigation link
    const coursesLink = page.getByRole('link', { name: /courses/i })
    await coursesLink.focus()
    
    // Take screenshot of focus state
    await expect(coursesLink).toHaveScreenshot('navigation-link-focus.png', {
      animations: 'disabled',
    })
  })

  test('should match active states', async ({ page }) => {
    await page.goto('/')
    
    // Click and hold on button
    const button = page.getByRole('button', { name: /refresh/i }).first()
    await button.hover()
    await page.mouse.down()
    
    // Take screenshot of active state
    await expect(button).toHaveScreenshot('button-active.png', {
      animations: 'disabled',
    })
    
    await page.mouse.up()
  })
})

test.describe('Accessibility Visual Tests', () => {
  test('should match high contrast mode', async ({ page }) => {
    // Enable high contrast mode
    await page.addInitScript(() => {
      localStorage.setItem('schoolapex_high_contrast', 'true')
    })

    await page.goto('/')
    
    // Wait for high contrast to apply
    await page.waitForTimeout(500)
    
    // Wait for content to load
    await expect(page.getByTestId('dashboard-content')).toBeVisible()
    
    // Take screenshot in high contrast mode
    await expect(page).toHaveScreenshot('dashboard-high-contrast.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should match reduced motion mode', async ({ page }) => {
    // Enable reduced motion
    await page.addInitScript(() => {
      localStorage.setItem('schoolapex_reduced_motion', 'true')
    })

    await page.goto('/')
    
    // Wait for content to load
    await expect(page.getByTestId('dashboard-content')).toBeVisible()
    
    // Take screenshot with reduced motion
    await expect(page).toHaveScreenshot('dashboard-reduced-motion.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})
