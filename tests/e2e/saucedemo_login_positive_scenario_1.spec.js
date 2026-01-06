import { test, expect } from '@playwright/test';

test('User can log in with valid credentials', async ({ page }) => {
  // Arrange – Navigate to login page and wait for network idle
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act – Fill username
  const usernameInput = page.getByPlaceholder('Username');
  try {
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  } catch {
    // Fallback to CSS selector if placeholder locator fails
    await page.locator('input[data-test="username"]').waitFor({ state: 'visible', timeout: 10000 });
  }
  await usernameInput.fill('standard_user');

  // Act – Fill password
  const passwordInput = page.getByPlaceholder('Password');
  try {
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  } catch {
    await page.locator('input[data-test="password"]').waitFor({ state: 'visible', timeout: 10000 });
  }
  await passwordInput.fill('secret_sauce');

  // Act – Click Login button
  const loginButton = page.getByRole('button', { name: 'Login' });
  try {
    await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  } catch {
    await page.locator('input[data-test="login-button"]').waitFor({ state: 'visible', timeout: 10000 });
  }
  await loginButton.click();

  // Wait for post‑login navigation
  await page.waitForLoadState('networkidle');

  // Assert – URL contains inventory page
  await expect(page).toHaveURL(/inventory\.html/);

  // Assert – Products header is visible
  const productsHeader = page.getByRole('heading', { name: 'Products' });
  await productsHeader.waitFor({ state: 'visible', timeout: 10000 });
  await expect(productsHeader).toBeTruthy();

  // Assert – Shopping cart icon is visible
  const cartIcon = page.getByRole('link', { name: 'Shopping Cart' });
  await cartIcon.waitFor({ state: 'visible', timeout: 10000 });
  await expect(cartIcon).toBeTruthy();
});

test('User cannot log in with invalid credentials', async ({ page }) => {
  // Arrange – Navigate to login page and wait for network idle
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act – Fill invalid username
  const usernameInput = page.getByPlaceholder('Username');
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.fill('invalid_user');

  // Act – Fill invalid password
  const passwordInput = page.getByPlaceholder('Password');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill('wrong_pass');

  // Act – Click Login button
  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // Wait for error message to appear
  const errorAlert = page.getByRole('alert');
  await errorAlert.waitFor({ state: 'visible', timeout: 10000 });

  // Assert – Error message contains expected text
  const errorText = await errorAlert.textContent();
  await expect(errorText).toContain('Username and password do not match any user in this service');
});