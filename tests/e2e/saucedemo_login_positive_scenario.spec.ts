import { test, expect } from '@playwright/test';

test('SauceDemo Positive Login Scenario - valid user can log in and see inventory page', async ({ page }) => {
  try {
    // Navigate to SauceDemo login page
    await page.goto('https://www.saucedemo.com/');

    // Fill in username using placeholder locator
    await page.getByPlaceholder('Username').fill('standard_user');

    // Fill in password using placeholder locator
    await page.getByPlaceholder('Password').fill('secret_sauce');

    // Click the Login button using role locator
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for navigation to the inventory page
    await page.waitForURL('**/inventory.html');

    // Assert that the URL is correct
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

    // Verify that the "Products" header is visible
    const productsHeader = page.getByRole('heading', { name: 'Products' });
    await expect(productsHeader).toBeVisible();

    // Verify that the shopping cart icon is visible
    const cartIcon = page.getByRole('link', { name: /shopping cart/i });
    await expect(cartIcon).toBeVisible();
  } catch (error) {
    // Re‑throw with context for easier debugging
    throw new Error(`SauceDemo login test failed: ${(error as Error).message}`);
  }
});