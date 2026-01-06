import { test, expect } from '@playwright/test';

test('SauceDemo Positive Login Scenario', async ({ page }) => {
  // Arrange - Navigate to login page and wait for network idle
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act - Fill in username
  const usernameInput = page.getByPlaceholder('Username');
  try {
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  } catch (e) {
    // Fallback: try locating by role if placeholder fails
    const fallbackUsername = page.getByRole('textbox', { name: /username/i });
    await fallbackUsername.waitFor({ state: 'visible', timeout: 10000 });
    await fallbackUsername.fill('standard_user');
  }
  await usernameInput.fill('standard_user');

  // Act - Fill in password
  const passwordInput = page.getByPlaceholder('Password');
  try {
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  } catch (e) {
    const fallbackPassword = page.getByRole('textbox', { name: /password/i });
    await fallbackPassword.waitFor({ state: 'visible', timeout: 10000 });
    await fallbackPassword.fill('secret_sauce');
  }
  await passwordInput.fill('secret_sauce');

  // Act - Click the Login button
  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // Wait for post‑login navigation to complete
  await page.waitForLoadState('networkidle');

  // Assert - Verify the Products header is visible
  const productsHeader = page.getByRole('heading', { name: 'Products' });
  await productsHeader.waitFor({ state: 'visible', timeout: 10000 });
  await expect(productsHeader).toBeVisible();

  // Assert - Verify the shopping cart icon is visible
  const cartLink = page.getByRole('link', { name: /shopping cart/i });
  await cartLink.waitFor({ state: 'visible', timeout: 10000 });
  await expect(cartLink).toBeVisible();
});