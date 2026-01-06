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
    await page.getByRole('textbox', { name: 'Username' }).waitFor({ state: 'visible', timeout: 10000 });
  }
  await usernameInput.fill('standard_user');

  // Act - Fill in password
  const passwordInput = page.getByPlaceholder('Password');
  try {
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  } catch (e) {
    await page.getByRole('textbox', { name: 'Password' }).waitFor({ state: 'visible', timeout: 10000 });
  }
  await passwordInput.fill('secret_sauce');

  // Act - Click Login button
  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // Wait for navigation to inventory page
  await page.waitForURL('**/inventory.html');
  await page.waitForLoadState('networkidle');

  // Assert - Products header is visible
  const productsHeader = page.getByRole('heading', { name: 'Products' });
  await productsHeader.waitFor({ state: 'visible', timeout: 10000 });
  await expect(productsHeader).toContainText('Products');

  // Assert - Shopping cart icon is visible
  const cartIcon = page.getByRole('link', { name: 'Shopping Cart' });
  await cartIcon.waitFor({ state: 'visible', timeout: 10000 });
  await expect(cartIcon).toBeVisible();
});