import { test, expect } from '@playwright/test';

test('should login, add to cart, and logout', async ({ page }) => {
  // Navigate to the login page
  await page.goto('https://www.saucedemo.com', { timeout: 5000 });

  // Fill in the username and password fields
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');

  // Click the login button
  await page.locator('#login-button').click();

  // Verify that the user is logged in
  await expect(page).toHaveURL(/.*inventory/);

  // Add a product to the cart
  await page.locator('#add-to-cart-sauce-labs-onesie').click();

  // Verify that the product is in the cart
  await expect(page.locator('#shopping_cart_container')).toContainText('1');

  // Click the cart link
  await page.locator('#shopping_cart_container').click();

  // Verify that the cart page is displayed
  await expect(page).toHaveURL(/.*cart/);

  // Click the logout link
  await page.locator('#logout_sidebar_link').click();

  // Verify that the user is logged out
  await expect(page).toHaveURL(/.*\/$/);
});