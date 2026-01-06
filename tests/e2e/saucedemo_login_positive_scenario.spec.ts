import { test, expect } from '@playwright/test';

test('SauceDemo positive login redirects to inventory page with Products header and cart icon', async ({ page }) => {
  try {
    // Navigate to the login page
    await page.goto('https://www.saucedemo.com/');
    // Verify login fields are visible
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();

    // Enter valid credentials
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');

    // Click the Login button
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for navigation to the inventory page
    await page.waitForURL('**/inventory.html');

    // Assert the URL is correct
    await expect(page).toHaveURL(/inventory\.html$/);

    // Verify the "Products" header is visible
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

    // Verify the shopping cart icon is visible
    await expect(page.getByRole('link', { name: /shopping cart/i })).toBeVisible();
  } catch (error) {
    // Fail the test with a clear message if any step throws
    expect.fail(`Test encountered an error: ${error}`);
  }
});