import { test, expect } from '@playwright/test';

test('should login, add to cart, and logout', async ({ page }) => {
  // Navigate to the login page
  await page.goto('https://www.saucedemo.com', { timeout: 5000 });

  // Fill in the username and password fields
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');

  // Click the login button
  await page.locator('#login-button').click();

  // Verify that the inventory page is displayed
  await expect(page).toHaveURL(/.*inventory/);

  // Add a product to the cart
  await page.locator('#add-to-cart-sauce-labs-backpack').click();

  // Verify that the product is added to the cart
  await expect(page.locator('#shopping_cart_container')).toBeVisible();

  // Click the menu button
  await page.locator('#react-burger-menu-btn').click();

  // Click the logout link
  await page.locator('#logout_sidebar_link').click();

  // Verify that the login page is displayed
  await expect(page).toHaveURL('https://www.saucedemo.com');
});