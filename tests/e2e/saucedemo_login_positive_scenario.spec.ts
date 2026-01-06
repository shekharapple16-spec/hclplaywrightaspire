import { test, expect } from '@playwright/test';

test('SauceDemo Positive Login Scenario - valid user can log in and see inventory page', async ({ page }) => {
  try {
    // Navigate to SauceDemo login page
    await page.goto('https://www.saucedemo.com/');
    await page.waitForURL('**/index.html');

    // Fill in username using placeholder locator
    const usernameInput = page.getByPlaceholder('Username');
    await expect(usernameInput).toBeVisible();
    await usernameInput.fill('standard_user');

    // Fill in password using placeholder locator
    const passwordInput = page.getByPlaceholder('Password');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('secret_sauce');

    // Click the Login button using role locator
    const loginButton = page.getByRole('button', { name: 'Login' });
    await expect(loginButton).toBeEnabled();
    await loginButton.click();

    // Wait for navigation to inventory page
    await page.waitForURL('**/inventory.html');

    // Verify URL is correct
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

    // Verify "Products" header is visible
    const productsHeader = page.getByRole('heading', { name: 'Products' });
    await expect(productsHeader).toBeVisible();

    // Verify shopping cart icon is visible (using its aria-label)
    const cartIcon = page.getByRole('link', { name: /shopping cart/i });
    await expect(cartIcon).toBeVisible();
  } catch (error) {
    // Fail the test with a clear message if any step throws
    test.fail(true, `Test failed due to unexpected error: ${error}`);
    throw error;
  }
});