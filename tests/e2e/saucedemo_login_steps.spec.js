import { test, expect } from '@playwright/test';

test('login with valid credentials and verify inventory page', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/', { timeout: 5000 });

  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();

  await expect(page).toHaveURL(/.*inventory\.html/);
});