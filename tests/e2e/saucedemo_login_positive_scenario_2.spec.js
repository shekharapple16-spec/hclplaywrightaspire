import { test, expect } from '@playwright/test';

const URL = 'https://www.saucedemo.com';
const USER = 'standard_user';
const PASS = 'secret_sauce';

test('Saucedemo login and basic UI verification', async ({ page }) => {
  // Navigate
  await page.goto(URL, { timeout: 5000 });

  // Login form – use id selectors
  await page.locator('#user-name').fill(USER);
  await page.locator('#password').fill(PASS);
  await page.locator('#login-button').click();

  // Verify successful navigation to inventory page
  await expect(page).toHaveURL(/.*inventory\.html/);

  // Product list – verify at least one product is displayed
  const firstProduct = page.locator('.inventory_item').first();
  await expect(firstProduct).toBeVisible();

  // Verify product details within the first item
  await expect(firstProduct.locator('.inventory_item_name')).toBeVisible();
  await expect(firstProduct.locator('.inventory_item_price')).toBeVisible();
  await expect(firstProduct.locator('button.btn_inventory')).toBeVisible();

  // Navigation bar – verify logo and menu button
  await expect(page.locator('.app_logo')).toBeVisible();
  await expect(page.locator('#react-burger-menu-btn')).toBeVisible();

  // Verify shopping cart icon is present
  await expect(page.locator('.shopping_cart_link')).toBeVisible();
});