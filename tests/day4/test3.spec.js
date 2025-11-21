const { test, expect } = require('@playwright/test');

test('OrangeHRM Login Validation', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');

  await page.fill('input[name="username"]', 'Admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');

  await page.waitForSelector('h6:has-text("Dashboard")', { state: 'visible' });
  await expect(page.locator('h6:has-text("Dashboard")')).toBeVisible();
});