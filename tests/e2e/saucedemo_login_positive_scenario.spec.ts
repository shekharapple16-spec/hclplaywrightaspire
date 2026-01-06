import { test, expect } from '@playwright/test';

test('SauceDemo Positive Login Scenario - valid user can access inventory page', async ({ page }) => {
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
    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.waitFor({ state: 'attached' });
    await loginButton.click();

    // Wait for navigation to inventory page
    await page.waitForURL('**/inventory.html');

    // Verify URL is correct
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

    // Verify the "Products" header is visible
    const productsHeader = page.getByRole('heading', { name: 'Products' });
    await productsHeader.waitFor({ state: 'visible' });
    await expect(productsHeader).toBeVisible();

    // Verify the shopping cart icon is visible (aria-label "Shopping Cart")
    const cartIcon = page.getByRole('link', { name: 'Shopping Cart' });
    await cartIcon.waitFor({ state: 'visible' });
    await expect(cartIcon).toBeVisible();
  } catch (error) {
    // Log error details for debugging before rethrowing
    console.error('SauceDemo Positive Login test failed:', error);
    throw error;
  }
});