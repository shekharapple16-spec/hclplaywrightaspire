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
    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.waitFor({ state: 'attached' });
    await loginButton.click();

    // Verify redirection to inventory page
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

    // Verify the "Products" header is visible
    const productsHeader = page.getByRole('heading', { name: 'Products' });
    await productsHeader.waitFor({ state: 'visible' });
    await expect(productsHeader).toBeVisible();

    // Verify the shopping cart icon is visible
    const cartIcon = page.getByRole('link', { name: /shopping cart/i });
    await cartIcon.waitFor({ state: 'visible' });
    await expect(cartIcon).toBeVisible();
  } catch (error) {
    // Capture screenshot on failure for debugging
    await page.screenshot({ path: 'sauce-demo-login-failure.png', fullPage: true });
    throw error;
  }
});