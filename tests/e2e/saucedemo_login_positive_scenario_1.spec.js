import { test, expect } from '@playwright/test';

test('Login with valid credentials redirects to inventory page', async ({ page }) => {
  // Arrange - Navigate to SauceDemo login page and wait for network idle
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act - Fill in username
  const usernameInput = page.getByPlaceholder('Username');
  try {
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  } catch (e) {
    // Fallback: use CSS selector if placeholder locator fails
    await page.locator('[data-test="username"]').waitFor({ state: 'visible', timeout: 10000 });
  }
  await usernameInput.fill('standard_user');

  // Act - Fill in password
  const passwordInput = page.getByPlaceholder('Password');
  try {
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  } catch (e) {
    await page.locator('[data-test="password"]').waitFor({ state: 'visible', timeout: 10000 });
  }
  await passwordInput.fill('secret_sauce');

  // Act - Click the Login button
  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // Assert - Verify URL contains inventory page
  await page.waitForURL('**/inventory.html', { timeout: 10000 });

  // Assert - Verify "Products" header is visible
  const productsHeader = page.locator('.title');
  await productsHeader.waitFor({ state: 'visible', timeout: 10000 });
  await expect(productsHeader).toContainText('Products');

  // Assert - Verify shopping cart icon is visible
  const cartIcon = page.locator('[data-test="shopping-cart-link"]');
  await cartIcon.waitFor({ state: 'visible', timeout: 10000 });
  await expect(cartIcon).toBeVisible();
});

test('Login with invalid credentials shows error message', async ({ page }) => {
  // Arrange - Navigate to SauceDemo login page and wait for network idle
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act - Fill in invalid username
  const usernameInput = page.getByPlaceholder('Username');
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.fill('invalid_user');

  // Act - Fill in invalid password
  const passwordInput = page.getByPlaceholder('Password');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill('wrong_password');

  // Act - Click the Login button
  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // Assert - Verify error message is displayed
  const errorMsg = page.locator('[data-test="error"]');
  await errorMsg.waitFor({ state: 'visible', timeout: 10000 });
  await expect(errorMsg).toContainText('Username and password do not match any user in this service');
});