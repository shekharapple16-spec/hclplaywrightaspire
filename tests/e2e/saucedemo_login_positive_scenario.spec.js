import { test, expect } from '@playwright/test';

test('SauceDemo Positive Login Scenario', async ({ page }) => {
  // Arrange – Navigate to login page and wait for network to be idle
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act – Fill in username
  const usernameInput = page.getByPlaceholder('Username');
  try {
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  } catch {
    // Fallback: use CSS selector if placeholder locator fails
    await page.locator('input[data-test="username"]').waitFor({ state: 'visible', timeout: 10000 });
  }
  await usernameInput.fill('standard_user');

  // Act – Fill in password
  const passwordInput = page.getByPlaceholder('Password');
  try {
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  } catch {
    // Fallback: use CSS selector if placeholder locator fails
    await page.locator('input[data-test="password"]').waitFor({ state: 'visible', timeout: 10000 });
  }
  await passwordInput.fill('secret_sauce');

  // Act – Click the Login button
  const loginButton = page.getByRole('button', { name: 'Login' });
  try {
    await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  } catch {
    // Fallback: use CSS selector for the button
    await page.locator('input[data-test="login-button"]').waitFor({ state: 'visible', timeout: 10000 });
  }
  await loginButton.click();

  // Assert – Verify URL contains inventory page
  await page.waitForURL('**/inventory.html', { timeout: 10000 });
  await expect(page.url()).toContain('/inventory.html');

  // Assert – Verify "Products" header is visible
  const productsHeader = page.getByRole('heading', { name: 'Products' });
  await productsHeader.waitFor({ state: 'visible', timeout: 10000 });
  await expect(productsHeader).toBeTruthy();

  // Assert – Verify shopping cart icon is visible
  const cartIcon = page.locator('.shopping_cart_link');
  await cartIcon.waitFor({ state: 'visible', timeout: 10000 });
  await expect(cartIcon).toBeTruthy();
});