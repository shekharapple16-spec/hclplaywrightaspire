import { test, expect } from '@playwright/test';

test('SauceDemo Positive Login Scenario - valid user can log in and see inventory', async ({ page }) => {
  try {
    // Navigate to the SauceDemo login page
    await page.goto('https://www.saucedemo.com/');
    // Verify login form is ready
    await expect(page.getByPlaceholder('Username')).toBeVisible();

    // Enter valid username
    await page.getByPlaceholder('Username').fill('standard_user');
    // Enter valid password
    await page.getByPlaceholder('Password').fill('secret_sauce');

    // Click the Login button
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for successful navigation to the inventory page
    await page.waitForURL('**/inventory.html');

    // Assert the URL is correct
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

    // Verify the "Products" header is visible
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

    // Verify the shopping cart icon is visible
    await expect(page.getByRole('link', { name: /shopping cart/i })).toBeVisible();
  } catch (error) {
    // Add context to any unexpected errors
    throw new Error(`SauceDemo login test failed: ${error}`);
  }
});