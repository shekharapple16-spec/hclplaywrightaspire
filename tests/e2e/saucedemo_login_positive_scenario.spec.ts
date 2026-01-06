import { test, expect } from '@playwright/test';

test('SauceDemo Positive Login Scenario - valid credentials allow access to inventory', async ({ page }) => {
  try {
    // Navigate to the SauceDemo login page
    await page.goto('https://www.saucedemo.com/');

    // Wait for the Username field to be visible and fill it
    const usernameField = page.getByPlaceholder('Username');
    await usernameField.waitFor({ state: 'visible' });
    await usernameField.fill('standard_user');

    // Wait for the Password field to be visible and fill it
    const passwordField = page.getByPlaceholder('Password');
    await passwordField.waitFor({ state: 'visible' });
    await passwordField.fill('secret_sauce');

    // Click the Login button
    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.waitFor({ state: 'attached' });
    await loginButton.click();

    // Wait for navigation to the inventory page
    await page.waitForURL('**/inventory.html');

    // Assert that the URL is correct
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

    // Verify that the "Products" header is visible
    const productsHeader = page.getByRole('heading', { name: 'Products' });
    await expect(productsHeader).toBeVisible();

    // Verify that the shopping cart icon is visible
    const cartIcon = page.getByRole('link', { name: /cart/i });
    await expect(cartIcon).toBeVisible();
  } catch (error) {
    // Fail the test with a clear error message
    expect.fail(`SauceDemo login test failed: ${error}`);
  }
});