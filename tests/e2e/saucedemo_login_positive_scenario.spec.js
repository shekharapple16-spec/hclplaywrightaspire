import { test, expect } from '@playwright/test';

test('Positive: User can log in with valid credentials', async ({ page }) => {
  // Arrange – Navigate to the login page and wait for network to be idle
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act – Fill in username
  const usernameInput = page.getByPlaceholder('Username');
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.fill('standard_user');

  // Act – Fill in password
  const passwordInput = page.getByPlaceholder('Password');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill('secret_sauce');

  // Act – Click the Login button
  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // Assert – Verify URL contains inventory page
  await page.waitForURL('**/inventory.html', { timeout: 10000 });

  // Assert – Verify the "Products" header is visible
  const productsHeader = page.locator('.title');
  await productsHeader.waitFor({ state: 'visible', timeout: 10000 });
  await expect(productsHeader).toContainText('Products');

  // Assert – Verify the shopping cart icon is visible
  const cartIcon = page.locator('.shopping_cart_link');
  await cartIcon.waitFor({ state: 'visible', timeout: 10000 });
  await expect(cartIcon).toBeTruthy();
});

test('Negative: Login fails with invalid credentials', async ({ page }) => {
  // Arrange – Navigate to the login page and wait for network to be idle
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act – Fill in invalid username
  const usernameInput = page.getByPlaceholder('Username');
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.fill('invalid_user');

  // Act – Fill in invalid password
  const passwordInput = page.getByPlaceholder('Password');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill('wrong_password');

  // Act – Click the Login button
  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // Assert – Verify error message is displayed
  const errorMessage = page.locator('[data-test="error"]');
  await errorMessage.waitFor({ state: 'visible', timeout: 10000 });
  await expect(errorMessage).toContainText('Username and password do not match any user in this service');
});