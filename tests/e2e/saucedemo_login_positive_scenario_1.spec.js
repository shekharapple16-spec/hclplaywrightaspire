import { test, expect } from '@playwright/test';

test('User can log in with valid credentials', async ({ page }) => {
  // Arrange - Navigate to login page and wait for network idle
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act - Fill username
  const usernameInput = page.getByPlaceholder('Username');
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.fill('standard_user');

  // Act - Fill password
  const passwordInput = page.getByPlaceholder('Password');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill('secret_sauce');

  // Act - Click login button
  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // Assert - Verify URL contains inventory page
  await expect(page).toHaveURL(/inventory\.html/);

  // Assert - Verify "Products" header is visible
  const productsHeader = page.getByRole('heading', { name: 'Products' });
  await productsHeader.waitFor({ state: 'visible', timeout: 10000 });
  await expect(productsHeader).toBeTruthy();

  // Assert - Verify shopping cart icon is visible
  const cartIcon = page.locator('.shopping_cart_link');
  await cartIcon.waitFor({ state: 'visible', timeout: 10000 });
  await expect(cartIcon).toBeTruthy();
});

test('User cannot log in with invalid credentials', async ({ page }) => {
  // Arrange - Navigate to login page and wait for network idle
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act - Fill invalid username
  const usernameInput = page.getByPlaceholder('Username');
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.fill('invalid_user');

  // Act - Fill invalid password
  const passwordInput = page.getByPlaceholder('Password');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill('wrong_password');

  // Act - Click login button
  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // Assert - Verify error message is displayed
  const errorMessage = page.getByRole('alert');
  await errorMessage.waitFor({ state: 'visible', timeout: 10000 });
  await expect(errorMessage).toContainText('Username and password do not match');
});