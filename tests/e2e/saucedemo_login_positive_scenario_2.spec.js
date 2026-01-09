import { test, expect } from '@playwright/test';

test('login, add product to cart and logout', async ({ page }) => {
  // Navigate to login page
  await page.goto('https://www.saucedemo.com/', { timeout: 5000 });

  // Login
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();

  // Verify inventory page loaded
  await expect(page).toHaveURL(/.*inventory/);
  await expect(page.locator('.inventory_list')).toBeVisible();

  // Add "Sauce Labs Backpack" to cart
  await page.locator('#add-to-cart-sauce-labs-backpack').click();

  // Verify cart badge shows 1
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

  // Open cart and verify product is listed
  await page.locator('.shopping_cart_link').click();
  await expect(page).toHaveURL(/.*cart/);
  await expect(page.locator('.cart_item .inventory_item_name')).toHaveText('Sauce Labs Backpack');

  // Open side menu and logout
  await page.locator('#react-burger-menu-btn').click();
  await page.locator('#logout_sidebar_link').click();

  // Verify redirected to login page
  await expect(page).toHaveURL('https://www.saucedemo.com/');
  await expect(page.locator('#login-button')).toBeVisible();
});