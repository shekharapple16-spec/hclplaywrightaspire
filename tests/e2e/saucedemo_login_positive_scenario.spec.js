import { test, expect } from '@playwright/test';

test('SauceDemo Positive Login Scenario', async ({ page }) => {
  // Arrange - Navigate to login page and wait for network idle
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act - Fill in Username
  let usernameInput;
  try {
    usernameInput = page.getByPlaceholder('Username');
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  } catch (e) {
    // Fallback selector if placeholder locator fails
    usernameInput = page.locator('#user-name');
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  }
  await usernameInput.fill('standard_user');

  // Act - Fill in Password
  let passwordInput;
  try {
    passwordInput = page.getByPlaceholder('Password');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  } catch (e) {
    // Fallback selector if placeholder locator fails
    passwordInput = page.locator('#password');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  }
  await passwordInput.fill('secret_sauce');

  // Act - Click Login button
  let loginButton;
  try {
    loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  } catch (e) {
    // Fallback selector if role locator fails
    loginButton = page.locator('#login-button');
    await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  }
  await loginButton.click();

  // Assert - Verify URL contains inventory page
  await page.waitForURL('**/inventory.html', { timeout: 10000 });
  await expect(page.url()).toContain('inventory.html');

  // Assert - Verify "Products" header is visible
  let productsHeader;
  try {
    productsHeader = page.getByRole('heading', { name: 'Products' });
    await productsHeader.waitFor({ state: 'visible', timeout: 10000 });
  } catch (e) {
    // Fallback selector if role locator fails
    productsHeader = page.locator('.title');
    await productsHeader.waitFor({ state: 'visible', timeout: 10000 });
  }
  await expect(productsHeader).toBeVisible();

  // Assert - Verify shopping cart icon is visible
  let cartIcon;
  try {
    cartIcon = page.getByRole('link', { name: /shopping cart/i });
    await cartIcon.waitFor({ state: 'visible', timeout: 10000 });
  } catch (e) {
    // Fallback selector if role locator fails
    cartIcon = page.locator('.shopping_cart_link');
    await cartIcon.waitFor({ state: 'visible', timeout: 10000 });
  }
  await expect(cart