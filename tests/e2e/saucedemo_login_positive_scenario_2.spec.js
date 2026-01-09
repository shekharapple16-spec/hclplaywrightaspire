import { test, expect } from '@playwright/test';

test('login and verify inventory page', async ({ page }) => {
  // Navigate to the app
  await page.goto('https://www.saucedemo.com', { timeout: 5000 });

  // Login using CSS selectors (id attributes)
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();

  // Verify navigation to inventory page
  await expect(page).toHaveURL(/.*inventory\.html/);

  // Verify product list is displayed
  await expect(page.locator('.inventory_item')).toBeVisible();

  // Verify at least one product title is visible
  await expect(page.locator('.inventory_item_name')).toBeVisible();

  // Add first product to cart
  await page.locator('.btn_inventory').first().click();

  // Verify cart badge shows 1 item
  await expect(page.locator('#shopping_cart_container .shopping_cart_badge')).toHaveText('1');
});