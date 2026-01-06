import { test, expect } from '@playwright/test';

test('Successful login, product verification, add to cart, and logout', async ({ page }) => {
  // Arrange - Navigate to login page and wait for load
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act - Perform login
  const usernameInput = page.getByPlaceholder('Username');
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.fill('standard_user');

  const passwordInput = page.getByPlaceholder('Password');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill('secret_sauce');

  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // Assert - Verify Products page is displayed
  const productLink = page.getByRole('link', { name: 'Sauce Labs Backpack' });
  await productLink.waitFor({ state: 'visible', timeout: 10000 });
  await expect(productLink).toBeVisible();

  // Act - Add the product to the cart
  const addToCartButton = page.getByRole('button', { name: 'Add to cart' }).first();
  await addToCartButton.waitFor({ state: 'visible', timeout: 10000 });
  await addToCartButton.click();

  // Assert - Verify cart badge shows 1 item
  const cartLink = page.getByRole('link', { name: /Shopping cart/i });
  await cartLink.waitFor({ state: 'visible', timeout: 10000 });
  await expect(cartLink).toContainText('1');

  // Act - Open the cart
  await cartLink.click();

  // Assert - Verify selected product appears in the cart
  const cartItem = page.getByRole('link', { name: 'Sauce Labs Backpack' });
  await cartItem.waitFor({ state: 'visible', timeout: 10000 });
  await expect(cartItem).toBeVisible();

  // Act - Open the side menu
  const menuButton = page.getByRole('button', { name: 'Open Menu' });
  await menuButton.waitFor({ state: 'visible', timeout: 10000 });
  await menuButton.click();

  // Act - Click Logout
  const logoutLink = page.getByRole('link', { name: 'Logout' });
  await logoutLink.waitFor({ state: 'visible', timeout: 10000 });
  await logoutLink.click();

  // Assert - Verify user is redirected to login page
  const loginPageUsername = page.getByPlaceholder('Username');
  await loginPageUsername.waitFor({ state: 'visible', timeout: 10000 });
  await expect(loginPageUsername).toBeVisible();
});