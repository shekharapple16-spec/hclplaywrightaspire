import { test, expect } from '@playwright/test';

test('login, add product to cart and start checkout flow', async ({ page }) => {
  // Step 1 – Open application
  await page.goto('https://www.saucedemo.com', { timeout: 5000 });

  // Step 2 – Login
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();

  // Step 3 – Verify inventory page
  await expect(page).toHaveURL(/.*inventory/);
  await expect(page.locator('#inventory_sidebar_link')).toBeVisible();

  // Step 4 – Add a product to the cart
  await page.locator('#add-to-cart-sauce-labs-onesie').click();

  // Step 5 – Checkout flow (navigate to cart and click checkout)
  await page.goto('https://www.saucedemo.com/cart.html', { timeout: 5000 });
  await page.locator('#checkout').click();

  // Verify we reached the first checkout step
  await expect(page).toHaveURL(/.*checkout-step-one/);
});