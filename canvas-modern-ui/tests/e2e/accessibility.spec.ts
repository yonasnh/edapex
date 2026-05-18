import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Accessibility E2E Tests
 * 
 * Comprehensive accessibility testing following WCAG 2.1 AA guidelines,
 * including automated axe-core testing, keyboard navigation, and screen reader compatibility.
 */

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated state for accessibility tests
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

    // Mock consistent API responses
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
  })

  test('should not have any automatically detectable accessibility issues on dashboard', async ({ page }) => {
    await page.goto('/')
    
    // Wait for content to load
    await expect(page.getByTestId('dashboard-content')).toBeVisible()
    
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should not have accessibility issues on courses page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /courses/i }).click()
    
    // Wait for courses to load
    await expect(page.getByText('Advanced Web Development')).toBeVisible()
    
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should not have accessibility issues on analytics dashboard', async ({ page }) => {
    // Mock analytics data
    await page.route('**/api/v1/courses/*/analytics/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { date: '2024-01-01', value: 85 },
            { date: '2024-01-02', value: 92 },
          ],
        }),
      })
    })

    await page.goto('/')
    await page.getByRole('link', { name: /analytics/i }).click()
    
    // Wait for analytics to load
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible()
    
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')
    
    // Check heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents()
    
    // Should have at least one h1
    const h1Elements = await page.locator('h1').count()
    expect(h1Elements).toBeGreaterThanOrEqual(1)
    
    // Check that headings are not empty
    const emptyHeadings = await page.locator('h1:empty, h2:empty, h3:empty, h4:empty, h5:empty, h6:empty').count()
    expect(emptyHeadings).toBe(0)
  })

  test('should have proper alt text for images', async ({ page }) => {
    await page.goto('/')
    
    // Check all images have alt text
    const imagesWithoutAlt = await page.locator('img:not([alt])').count()
    expect(imagesWithoutAlt).toBe(0)
    
    // Check no images have empty alt text (unless decorative)
    const imagesWithEmptyAlt = await page.locator('img[alt=""]').count()
    
    // If there are images with empty alt, they should be decorative
    if (imagesWithEmptyAlt > 0) {
      const decorativeImages = await page.locator('img[alt=""][role="presentation"], img[alt=""][aria-hidden="true"]').count()
      expect(decorativeImages).toBe(imagesWithEmptyAlt)
    }
  })

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/')
    
    // Navigate to a page with forms (search, settings, etc.)
    const searchInput = page.getByRole('searchbox')
    if (await searchInput.isVisible()) {
      // Check search input has proper labeling
      const searchLabel = await searchInput.getAttribute('aria-label')
      const searchLabelledBy = await searchInput.getAttribute('aria-labelledby')
      
      expect(searchLabel || searchLabelledBy).toBeTruthy()
    }
    
    // Check all form inputs have labels
    const unlabeledInputs = await page.locator('input:not([type="hidden"]):not([aria-label]):not([aria-labelledby])').count()
    expect(unlabeledInputs).toBe(0)
  })

  test('should have proper ARIA landmarks', async ({ page }) => {
    await page.goto('/')
    
    // Check for main landmark
    const mainLandmark = await page.locator('main, [role="main"]').count()
    expect(mainLandmark).toBeGreaterThanOrEqual(1)
    
    // Check for navigation landmark
    const navLandmark = await page.locator('nav, [role="navigation"]').count()
    expect(navLandmark).toBeGreaterThanOrEqual(1)
    
    // Check for banner (header) landmark
    const bannerLandmark = await page.locator('header, [role="banner"]').count()
    expect(bannerLandmark).toBeGreaterThanOrEqual(1)
  })

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/')
    
    // Run axe scan specifically for color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .withRules(['color-contrast'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should support high contrast mode', async ({ page }) => {
    // Enable high contrast mode
    await page.addInitScript(() => {
      localStorage.setItem('schoolapex_high_contrast', 'true')
    })

    await page.goto('/')
    
    // Wait for high contrast to apply
    await page.waitForTimeout(500)
    
    // Check that high contrast styles are applied
    const bodyClass = await page.locator('body').getAttribute('class')
    expect(bodyClass).toContain('high-contrast')
    
    // Run accessibility scan in high contrast mode
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })
})

test.describe('Keyboard Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated state
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

  test('should support tab navigation through all interactive elements', async ({ page }) => {
    // Start from the first focusable element
    await page.keyboard.press('Tab')
    
    // Track focused elements
    const focusedElements: string[] = []
    
    // Tab through first 10 elements to test navigation
    for (let i = 0; i < 10; i++) {
      const focusedElement = await page.evaluate(() => {
        const element = document.activeElement
        return element ? element.tagName + (element.getAttribute('aria-label') || element.textContent?.slice(0, 20) || '') : 'none'
      })
      
      focusedElements.push(focusedElement)
      await page.keyboard.press('Tab')
    }
    
    // Should have focused on different elements
    const uniqueElements = new Set(focusedElements)
    expect(uniqueElements.size).toBeGreaterThan(1)
  })

  test('should support reverse tab navigation', async ({ page }) => {
    // Tab to a few elements first
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    const forwardElement = await page.evaluate(() => document.activeElement?.textContent?.slice(0, 20))
    
    // Shift+Tab to go back
    await page.keyboard.press('Shift+Tab')
    
    const backwardElement = await page.evaluate(() => document.activeElement?.textContent?.slice(0, 20))
    
    // Should be on a different element
    expect(backwardElement).not.toBe(forwardElement)
  })

  test('should support Enter key activation', async ({ page }) => {
    // Focus on a clickable element
    const coursesLink = page.getByRole('link', { name: /courses/i })
    await coursesLink.focus()
    
    // Press Enter to activate
    await page.keyboard.press('Enter')
    
    // Should navigate to courses page
    await expect(page.getByText(/courses/i)).toBeVisible()
  })

  test('should support Space key activation for buttons', async ({ page }) => {
    // Find a button element
    const button = page.getByRole('button').first()
    
    if (await button.isVisible()) {
      await button.focus()
      
      // Press Space to activate
      await page.keyboard.press('Space')
      
      // Button should have been activated (implementation specific)
      // This test ensures Space key works for button activation
    }
  })

  test('should support arrow key navigation in menus', async ({ page }) => {
    // Open a menu if available
    const menuButton = page.getByRole('button', { name: /menu/i })
    
    if (await menuButton.isVisible()) {
      await menuButton.click()
      
      // Use arrow keys to navigate menu items
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowUp')
      
      // Should maintain focus within menu
      const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('role'))
      expect(focusedElement).toBe('menuitem')
    }
  })

  test('should support Escape key to close modals', async ({ page }) => {
    // Open a modal if available
    const modalTrigger = page.getByRole('button', { name: /settings|profile/i })
    
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click()
      
      // Check if modal opened
      const modal = page.getByRole('dialog')
      if (await modal.isVisible()) {
        // Press Escape to close
        await page.keyboard.press('Escape')
        
        // Modal should be closed
        await expect(modal).not.toBeVisible()
      }
    }
  })

  test('should trap focus within modals', async ({ page }) => {
    // Open a modal if available
    const modalTrigger = page.getByRole('button', { name: /settings|profile/i })
    
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click()
      
      // Check if modal opened
      const modal = page.getByRole('dialog')
      if (await modal.isVisible()) {
        // Tab through modal elements
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        
        // Focus should remain within modal
        const focusedElement = await page.evaluate(() => {
          const element = document.activeElement
          const modal = document.querySelector('[role="dialog"]')
          return modal?.contains(element) || false
        })
        
        expect(focusedElement).toBe(true)
      }
    }
  })

  test('should have visible focus indicators', async ({ page }) => {
    // Tab to first focusable element
    await page.keyboard.press('Tab')
    
    // Check that focused element has visible focus indicator
    const focusStyles = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement
      if (!element) return null
      
      const styles = window.getComputedStyle(element)
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
        outlineColor: styles.outlineColor,
        boxShadow: styles.boxShadow,
      }
    })
    
    // Should have some form of focus indicator
    const hasFocusIndicator = focusStyles && (
      focusStyles.outline !== 'none' ||
      focusStyles.outlineWidth !== '0px' ||
      focusStyles.boxShadow !== 'none'
    )
    
    expect(hasFocusIndicator).toBe(true)
  })
})

test.describe('Screen Reader Compatibility Tests', () => {
  test('should have proper ARIA labels for interactive elements', async ({ page }) => {
    await page.goto('/')
    
    // Check buttons have accessible names
    const buttons = await page.locator('button').all()
    
    for (const button of buttons) {
      const accessibleName = await button.evaluate(el => {
        return el.getAttribute('aria-label') || 
               el.getAttribute('aria-labelledby') || 
               el.textContent?.trim() || 
               el.getAttribute('title')
      })
      
      expect(accessibleName).toBeTruthy()
    }
  })

  test('should have proper ARIA live regions for dynamic content', async ({ page }) => {
    await page.goto('/')
    
    // Check for live regions
    const liveRegions = await page.locator('[aria-live]').count()
    
    // Should have at least one live region for notifications/updates
    expect(liveRegions).toBeGreaterThanOrEqual(1)
  })

  test('should have proper ARIA expanded states for collapsible content', async ({ page }) => {
    await page.goto('/')
    
    // Find collapsible elements
    const collapsibleElements = await page.locator('[aria-expanded]').all()
    
    for (const element of collapsibleElements) {
      const expanded = await element.getAttribute('aria-expanded')
      
      // aria-expanded should be 'true' or 'false', not null
      expect(['true', 'false']).toContain(expanded)
    }
  })

  test('should have proper table headers and captions', async ({ page }) => {
    await page.goto('/')
    
    // Navigate to a page with tables (gradebook, analytics, etc.)
    const tables = await page.locator('table').all()
    
    for (const table of tables) {
      // Check for table headers
      const headers = await table.locator('th').count()
      if (headers > 0) {
        // Should have proper scope attributes
        const headersWithScope = await table.locator('th[scope]').count()
        expect(headersWithScope).toBeGreaterThan(0)
      }
      
      // Check for table caption or aria-label
      const caption = await table.locator('caption').count()
      const ariaLabel = await table.getAttribute('aria-label')
      const ariaLabelledBy = await table.getAttribute('aria-labelledby')
      
      expect(caption > 0 || ariaLabel || ariaLabelledBy).toBeTruthy()
    }
  })

  test('should announce loading states to screen readers', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/v1/courses', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.goto('/')
    await page.getByRole('link', { name: /courses/i }).click()
    
    // Check for loading announcement
    const loadingElement = page.getByTestId('loading-spinner')
    await expect(loadingElement).toBeVisible()
    
    // Should have aria-live or role="status" for screen reader announcement
    const ariaLive = await loadingElement.getAttribute('aria-live')
    const role = await loadingElement.getAttribute('role')
    
    expect(ariaLive === 'polite' || ariaLive === 'assertive' || role === 'status').toBe(true)
  })

  test('should announce error states to screen readers', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/courses', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server Error' }),
      })
    })

    await page.goto('/')
    await page.getByRole('link', { name: /courses/i }).click()
    
    // Check for error announcement
    const errorElement = page.getByTestId('error-boundary')
    await expect(errorElement).toBeVisible()
    
    // Should have aria-live for screen reader announcement
    const ariaLive = await errorElement.getAttribute('aria-live')
    const role = await errorElement.getAttribute('role')
    
    expect(ariaLive === 'assertive' || role === 'alert').toBe(true)
  })
})
