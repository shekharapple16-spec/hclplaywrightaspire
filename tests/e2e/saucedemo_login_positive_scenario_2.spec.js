import { test, expect } from '@playwright/test';

const URL = 'https://www.saucedemo.com';

test('login and verify inventory page', async ({ page }) => {
  // Navigate
  await page.goto(URL, { timeout: 5000 });

  // Login – CSS selectors (id)
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();

  // Verify navigation to inventory
  await expect(page).toHaveURL(/.*inventory\.html/);

  // Verify product list is displayed
  await expect(page.locator('.inventory_item').first()).toBeVisible();

  // Verify first product's title and add‑to‑cart button
  await expect(page.locator('.inventory_item_name').first()).toBeVisible();
  await expect(page.locator('.btn_inventory').first()).toBeVisible();
});