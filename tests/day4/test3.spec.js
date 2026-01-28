import { test, expect } from '#fixtures';

test('OrangeHRM Login Validation', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', { waitUntil: 'networkidle' });

  await page.fill('input[name="username"]', 'Admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');

  await page.waitForURL(/dashboard/, { timeout: 15000 });
  await expect(page).toHaveURL(/dashboard/);
});