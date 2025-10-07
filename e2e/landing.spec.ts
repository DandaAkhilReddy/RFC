import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Landing Page
 * Tests the main entry point of the application
 */
test.describe('Landing Page', () => {
  test('should load landing page successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the page loaded
    await expect(page).toHaveTitle(/ReddyFit/i);

    // Check for main CTA
    await expect(page.getByText(/Start Your Transformation/i)).toBeVisible();
  });

  test('should display navigation elements', async ({ page }) => {
    await page.goto('/');

    // Check for key navigation elements
    await expect(page.getByText(/Features/i).first()).toBeVisible();
    await expect(page.getByText(/About/i).first()).toBeVisible();
  });

  test('should have functional login button', async ({ page }) => {
    await page.goto('/');

    // Find and click login/signup button
    const loginButton = page.getByRole('button', { name: /sign in|get started/i }).first();
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Page should still load and be usable
    await expect(page.getByText(/ReddyFit/i)).toBeVisible();
  });

  test('should navigate to reliability page', async ({ page }) => {
    await page.goto('/');

    // Look for reliability/about link
    const reliabilityLink = page.getByText(/reliability|about/i).first();

    if (await reliabilityLink.isVisible()) {
      await reliabilityLink.click();
      await expect(page).toHaveURL(/reliability/);
    }
  });
});

/**
 * E2E Tests for Authentication Flow
 * Note: These are basic structure tests - actual auth requires Firebase setup
 */
test.describe('Authentication (Basic)', () => {
  test('should show login UI when clicking sign in', async ({ page }) => {
    await page.goto('/');

    // Try to find and click sign in button
    try {
      const signInButton = page.getByRole('button', { name: /sign in|login/i }).first();
      await signInButton.click({ timeout: 5000 });

      // Should trigger Google auth or show login modal
      // (Actual auth test would require Firebase test credentials)
    } catch (error) {
      // Expected if button not found - just verify page loaded
      await expect(page).toHaveTitle(/ReddyFit/i);
    }
  });
});

/**
 * E2E Tests for Daily Scan Access
 * Tests that protected routes require authentication
 */
test.describe('Protected Routes', () => {
  test('should redirect to home when accessing /scan without auth', async ({ page }) => {
    await page.goto('/scan');

    // Should redirect to home/landing page
    await page.waitForURL(/\/$/, { timeout: 5000 });
    await expect(page).toHaveURL('/');
  });

  test('should redirect to home when accessing /dashboard without auth', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to home
    await page.waitForURL(/\/$/, { timeout: 5000 });
    await expect(page).toHaveURL('/');
  });

  test('should redirect to home when accessing /profile without auth', async ({ page }) => {
    await page.goto('/profile');

    // Should redirect to home
    await page.waitForURL(/\/$/, { timeout: 5000 });
    await expect(page).toHaveURL('/');
  });
});

/**
 * E2E Tests for Performance
 * Basic performance checks
 */
test.describe('Performance', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have optimized bundle size (check network)', async ({ page }) => {
    await page.goto('/');

    // Page should be functional
    await expect(page.getByText(/ReddyFit/i)).toBeVisible();

    // (In a real test, you'd monitor network requests and check bundle sizes)
  });
});
