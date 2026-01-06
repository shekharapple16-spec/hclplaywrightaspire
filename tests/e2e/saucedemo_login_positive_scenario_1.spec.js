import { test, expect } from '@playwright/test';

test('Positive login: user can log in with valid credentials', async ({ page }) => {
  // Arrange – navigate to the login page and wait for network idle
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act – fill in username
  const usernameInput = page.getByPlaceholder('Username');
  try {
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  } catch {
    // fallback selector if placeholder fails
    await page.waitForSelector('#user-name', { state: 'visible', timeout: 10000 });
  }
  await usernameInput.fill('standard_user');

  // Act – fill in password
  const passwordInput = page.getByPlaceholder('Password');
  try {
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  } catch {
    await page.waitForSelector('#password', { state: 'visible', timeout: 10000 });
  }
  await passwordInput.fill('secret_sauce');

  // Act – click the Login button
  const loginButton = page.getByRole('button', { name: 'Login' });
  try {
    await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  } catch {
    await page.waitForSelector('#login-button', { state: 'visible', timeout: 10000 });
  }
  await loginButton.click();

  // Assert – verify navigation to inventory page
  await page.waitForURL('**/inventory.html', { timeout: 10000 });
  await expect(page).toHaveURL(/inventory\.html/);

  // Assert – Products header is visible
  const productsHeader = page.getByRole('heading', { name: 'Products' });
  await productsHeader.waitFor({ state: 'visible', timeout: 10000 });
  await expect(productsHeader).toBeTruthy();

  // Assert – shopping cart icon is visible
  const cartIcon = page.getByRole('link', { name: 'Shopping Cart' });
  await cartIcon.waitFor({ state: 'visible', timeout: 10000 });
  await expect(cartIcon).toBeTruthy();
});

test('Negative login: user sees error with invalid credentials', async ({ page }) => {
  // Arrange – navigate to the login page and wait for network idle
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act – fill in username
  const usernameInput = page.getByPlaceholder('Username');
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.fill('standard_user');

  // Act – fill in incorrect password
  const passwordInput = page.getByPlaceholder('Password');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill('wrong_password');

  // Act – click the Login button
  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // Assert – error message is displayed
  const errorAlert = page.getByRole('alert');
  await errorAlert.waitFor({ state: 'visible', timeout: 10000 });
  await expect(errorAlert).toContainText('Username and password do not match any user in this service');
});