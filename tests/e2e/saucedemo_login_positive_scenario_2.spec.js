// Content hash: accff124d661a243d9b03b44254f31a964a3beff91a564a01fab5fd24fe7c86a

import { test, expect } from '#fixtures';
test('Herokuapp Login Validation', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/login');
  await expect(page.locator('#username')).toBeVisible();
  await page.locator('#username').fill('tomsmith');
  await page.locator('#password').fill('SuperSecretPassword!');
  await page.locator('button', { hasText: 'Login' }).click();
  await expect(page.locator('#flash')).toContainText('You logged into a secure area!');
});
test('OrangeHRM Login Validation', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  await page.locator('input[placeholder="Username"]').fill('Admin');
  await page.locator('input[placeholder="Password"]').fill('admin123');
  await page.locator('button', { hasText: 'Login' }).click();
  await expect(page).toHaveURL(/dashboard/);
});