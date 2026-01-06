import { test, expect } from '@playwright/test';

test('SauceDemo Positive Login Scenario', async ({ page }) => {
  // Arrange - Navigate to login page and wait for load
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act - Fill in username
  await page.waitForSelector('input[placeholder="Username"]', { timeout: 10000 });
  const usernameInput = page.getByPlaceholder('Username');
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.fill('standard_user');

  // Act - Fill in password
  await page.waitForSelector('input[placeholder="Password"]', { timeout: 10000 });
  const passwordInput = page.getByPlaceholder('Password');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill('secret_sauce');

  // Act - Click Login button
  await page.waitForSelector('button', { timeout: 10000 });
  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // Assert - Verify URL contains inventory page
  await page.waitForLoadState('networkidle');
  await expect(page.url()).toContain('inventory.html');

  // Assert - Verify Products header is visible
  await page.waitForSelector('.title', { timeout: 10000 });
  const productsHeader = page.locator('.title');
  await productsHeader.waitFor({ state: 'visible', timeout: 10000 });
  await expect(productsHeader).toBeVisible();

  // Assert - Verify shopping cart icon is visible
  await page.waitForSelector('.shopping_cart_link', { timeout: 10000 });
  const cartIcon = page.locator('.shopping_cart_link');
  await cartIcon.waitFor({ state: 'visible', timeout: 10000 });
  await expect(cartIcon).toBeVisible();
});