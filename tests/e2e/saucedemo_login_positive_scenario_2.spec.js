import { test, expect } from '@playwright/test';

test('login and verify inventory page', async ({ page }) => {
  // Step 1: Open Application
  await page.goto('https://www.saucedemo.com', { timeout: 5000 });

  // Step 2: Login
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();

  // Step 3: Verify Inventory Page
  await expect(page).toHaveURL(/.*inventory/);
  await expect(page.locator('#inventory_sidebar_link')).toBeVisible();
  await expect(page.locator('#item_0_title_link')).toBeVisible();
});