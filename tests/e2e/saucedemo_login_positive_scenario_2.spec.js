import { test, expect } from '@playwright/test';

test('SauceDemo end‑to‑end demo flow', async ({ page }) => {
  // Step 1 – Open Application
  await page.goto('https://www.saucedemo.com', { timeout: 5000 });

  // Step 2 – Login
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();

  // Step 3 – Verify Inventory Page
  await expect(page).toHaveURL(/.*inventory\.html/);
  await expect(page.locator('#item_4_title_link')).toBeVisible();
  await expect(page.locator('#item_0_title_link')).toBeVisible();
  await expect(page.locator('#item_1_title_link')).toBeVisible();
  await expect(page.locator('#item_5_title_link')).toBeVisible();
  await expect(page.locator('#item_2_title_link')).toBeVisible();
  await expect(page.locator('#item_3_title_link')).toBeVisible();

  // Step 4 – Add Items to Cart
  await page.locator('#add-to-cart-sauce-labs-backpack').click();
  await page.locator('#add-to-cart-sauce-labs-bike-light').click();

  // Step 5 – Checkout (click checkout button)
  await page.locator('#checkout').click();

  // Step 6 – Logout
  await page.locator('#react-burger-menu-btn').click();
  await page.locator('#logout_sidebar_link').click();

  // Verify returned to login page
  await expect(page).toHaveURL('https://www.saucedemo.com/');
});