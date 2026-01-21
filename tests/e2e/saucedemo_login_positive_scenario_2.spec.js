import { test, expect } from '@playwright/test';

test('should login, add to cart, and logout', async ({ page }) => {
  // Navigate
  await page.goto('https://www.saucedemo.com', { timeout: 5000 });

  // Login
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();

  // Verify login
  await expect(page).toHaveURL(/.*inventory/);

  // Add to cart
  await page.locator('#add-to-cart-sauce-labs-onesie').click();

  // Verify cart
  await expect(page.locator('#shopping_cart_container')).toBeVisible();

  // Logout
  await page.locator('#react-burger-menu-btn').click();
  await page.locator('#logout_sidebar_link').click();

  // Verify logout
  await expect(page).toHaveURL('https://www.saucedemo.com/');
});