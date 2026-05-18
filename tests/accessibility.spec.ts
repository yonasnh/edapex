import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('SchoolApex Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Modern UI
    await page.goto('http://localhost:3001')
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 })
  })

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    
    // Should have at least one h1
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThan(0)
    
    // Check heading structure
    for (const heading of headings) {
      const text = await heading.textContent()
      expect(text?.trim()).toBeTruthy()
    }
  })

  test('should have proper focus management', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab')
    
    // Should have visible focus indicator
    const focusedElement = await page.locator(':focus')
    expect(await focusedElement.count()).toBe(1)
  })

  test('should have proper color contrast', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('[data-testid="app-container"]')
      .analyze()

    const colorContrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    )
    
    expect(colorContrastViolations).toEqual([])
  })

  test('should have proper ARIA labels and roles', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze()

    const ariaViolations = accessibilityScanResults.violations.filter(
      violation => violation.id.includes('aria')
    )
    
    expect(ariaViolations).toEqual([])
  })

  test('should be keyboard navigable', async ({ page }) => {
    // Test keyboard navigation through interactive elements
    const interactiveElements = await page.locator('button, a, input, select, textarea, [tabindex]').all()
    
    for (let i = 0; i < Math.min(interactiveElements.length, 10); i++) {
      await page.keyboard.press('Tab')
      
      const focusedElement = await page.locator(':focus')
      expect(await focusedElement.count()).toBe(1)
    }
  })

  test('should have proper alt text for images', async ({ page }) => {
    const images = await page.locator('img').all()
    
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      const ariaLabel = await img.getAttribute('aria-label')
      const ariaLabelledBy = await img.getAttribute('aria-labelledby')
      
      // Images should have alt text or proper ARIA labeling
      expect(alt !== null || ariaLabel !== null || ariaLabelledBy !== null).toBeTruthy()
    }
  })

  test('should work with screen reader simulation', async ({ page }) => {
    // Test with screen reader simulation
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .options({
        rules: {
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'screen-reader': { enabled: true }
        }
      })
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})
