// Content hash: accff124d661a243d9b03b44254f31a964a3beff91a564a01fab5fd24fe7c86a

import { test, expect } from '#fixtures';

test('Saucedemo Login and Logout', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await page.waitForLoadState('networkidle');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  await page.locator('[data-test="logout"]').click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL('https://www.saucedemo.com/');
});

test('Saucedemo Add to Cart', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await page.waitForLoadState('networkidle');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await page.waitForLoadState('networkidle');
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
  await page.locator('.shopping_cart_link').click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.cart_item')).toContainText('Sauce Labs Backpack');
  await expect(page.locator('.cart_item')).toContainText('Sauce Labs Bike Light');
});