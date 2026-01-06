import { test, expect } from '@playwright/test';

test('SauceDemo Positive Login Scenario - valid user can log in and see inventory page', async ({ page }) => {
  try {
    // Navigate to SauceDemo login page
    await page.goto('https://www.saucedemo.com/');
    await expect(page).toHaveURL('https://www.saucedemo.com/');

    // Fill in username using placeholder locator
    const usernameInput = page.getByPlaceholder('Username');
    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill('standard_user');

    // Fill in password using placeholder locator
    const passwordInput = page.getByPlaceholder('Password');
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill('secret_sauce');

    // Click the Login button using role locator
    const loginButton = page.getByRole('button', { name: /login/i });
    await loginButton.waitFor({ state: 'attached' });
    await loginButton.click();

    // Wait for navigation to inventory page
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
    // Log the error and fail the test
    console.error('Test failed with error:', error);
    throw error;
  }
});