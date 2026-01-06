import { test, expect } from '@playwright/test';

test('SauceDemo Positive Login Scenario - valid user can log in successfully', async ({ page }) => {
  try {
    // Navigate to SauceDemo login page
    await page.goto('https://www.saucedemo.com/');
    await expect(page).toHaveURL('https://www.saucedemo.com/');

    // Fill in username
    const usernameInput = page.getByPlaceholder('Username');
    await expect(usernameInput).toBeVisible();
    await usernameInput.fill('standard_user');

    // Fill in password
    const passwordInput = page.getByPlaceholder('Password');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('secret_sauce');

    // Click the Login button
    const loginButton = page.getByRole('button', { name: 'Login' });
    await expect(loginButton).toBeEnabled();
    await loginButton.click();

    // Wait for navigation to inventory page
    await page.waitForURL('**/inventory.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

    // Verify the "Products" header is visible
    const productsHeader = page.getByRole('heading', { name: 'Products' });
    await expect(productsHeader).toBeVisible();

    // Verify the shopping cart icon is visible
    const cartIcon = page.getByRole('link', { name: /shopping cart/i });
    await expect(cartIcon).toBeVisible();
  } catch (error) {
    // Re‑throw with context for easier debugging
    throw new Error(`SauceDemo login test failed: ${error instanceof Error ? error.message : error}`);
  }
});