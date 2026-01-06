import { test, expect } from '@playwright/test';

test('Successful login, product verification, add to cart, and logout', async ({ page }) => {
  // Arrange – Navigate to the login page and wait for network idle
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act – Perform login
  const usernameInput = page.getByPlaceholder('Username');
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.fill('standard_user');

  const passwordInput = page.getByPlaceholder('Password');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill('secret_sauce');

  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // Assert – Verify that the Products page is displayed by checking a known product link
  const productLink = page.getByRole('link', { name: 'Sauce Labs Backpack' });
  await productLink.waitFor({ state: 'visible', timeout: 10000 });
  await expect(productLink).toBeTruthy();

  // Act – Open the product details
  await productLink.click();

  // Act – Add the product to the cart
  const addToCartButton = page.getByRole('button', { name: 'Add to cart' });
  await addToCartButton.waitFor({ state: 'visible', timeout: 10000 });
  await addToCartButton.click();

  //