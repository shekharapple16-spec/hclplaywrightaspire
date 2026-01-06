import { test, expect } from '@playwright/test';

test('User can log in with valid credentials', async ({ page }) => {
  // Arrange – navigate to login page and wait for network idle
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act – fill username
  const usernameInput = page.getByPlaceholder('Username');
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.fill('standard_user');

  // Act – fill password
  const passwordInput = page.getByPlaceholder('Password');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill('secret_sauce');

  // Act – click login button
  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // Assert – verify navigation to inventory page
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

  // Assert – verify "Products" header is visible
  const productsHeader = page.locator('.header_secondary_container .title');
  await productsHeader.waitFor({ state: 'visible', timeout: 10000 });
  await expect(productsHeader).toContainText('Products');

  // Assert – verify shopping cart icon is visible
  const cartIcon = page.locator('.shopping_cart_link');
  await cartIcon.waitFor({ state: 'visible', timeout: 10000 });
  await expect(cartIcon).toBeTruthy();
});

test('User cannot log in with invalid credentials', async ({ page }) => {
  // Arrange – navigate to login page and wait for network idle
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act – fill username
  const usernameInput = page.getByPlaceholder('Username');
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.fill('standard_user');

  // Act – fill invalid password
  const passwordInput = page.getByPlaceholder('Password');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill('wrong_password');

  // Act – click login button
  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // Assert – verify error message is displayed
  const errorMessage = page.locator('[data-test="error"]');
  await errorMessage.waitFor({ state: 'visible', timeout: 10000 });
  await expect(errorMessage).toContainText('Username and password do not match any user in this service');
});