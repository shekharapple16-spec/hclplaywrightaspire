import { test, expect } from '@playwright/test';

test('Successful login, add product to cart, and logout', async ({ page }) => {
  // Navigate to login page
  await page.goto('https://www.saucedemo.com/');

  // Perform login
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  // Verify inventory page loaded
  await expect(page).toHaveURL(/.*inventory\.html/);
  await expect(page.getByTestId('inventory-item')).first().toBeVisible();

  // Add specific product to cart
  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();

  // Verify cart badge shows 1 item
  const cartBadge = page.getByTestId('shopping_cart_badge');
  await expect(cartBadge).toHaveText('1');

  // Open cart and verify product is listed
  await page.locator('.shopping_cart_link').click();
  await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();

  // Open side menu and logout
  await page.locator('#react-burger-menu-btn').click();
  await page.locator('#logout_sidebar_link').click();

  // Verify redirected to login page
  await expect(page).toHaveURL('https://www.saucedemo.com/');
});