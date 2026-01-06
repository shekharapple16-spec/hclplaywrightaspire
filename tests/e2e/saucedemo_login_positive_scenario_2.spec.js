import { test, expect } from '@playwright/test';

test('Successful login, add product to cart, and logout on SauceDemo', async ({ page }) => {
  // Arrange - Navigate to login page and wait for load
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  // Act - Login
  const usernameInput = page.locator('[data-test="username"]');
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await expect(usernameInput).toHaveCount(1);
  await usernameInput.fill('standard_user');

  const passwordInput = page.locator('[data-test="password"]');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await expect(passwordInput).toHaveCount(1);
  await passwordInput.fill('secret_sauce');

  const loginButton = page.locator('[data-test="login-button"]');
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await expect(loginButton).toHaveCount(1);
  await loginButton.click();

  // Assert - Verify inventory page is displayed
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/inventory\.html/);
  const inventoryList = page.locator('.inventory_list .inventory_item');
  await inventoryList.first().waitFor({ state: 'visible', timeout: 10000 });
  await expect(inventoryList).toHaveCountGreaterThan(0);

  // Act - Add "Sauce Labs Backpack" to cart using data-test selector
  const addToCartButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
  await addToCartButton.waitFor({ state: 'visible', timeout: 10000 });
  await expect(addToCartButton).toHaveCount(1);
  await addToCartButton.click();

  // Assert - Cart badge shows 1 item
  const cartBadge = page.locator('[data-test="shopping-cart-badge"]');
  await cartBadge.waitFor({ state: 'visible', timeout: 10000 });
  await expect(cartBadge).toHaveCount(1);
  await expect(cartBadge).toContainText('1');

  // Act - Open cart
  const cartIcon = page.locator('[data-test="shopping-cart-link"]');
  await cartIcon.waitFor({ state: 'visible', timeout: 10000 });
  await expect(cartIcon).toHaveCount(1);
  await cartIcon.click();

  // Assert - Verify selected product appears in cart
  const cartItemName = page.locator('.cart_item .inventory_item_name', { hasText: 'Sauce Labs Backpack' });
  await cartItemName.waitFor({ state: 'visible', timeout: 10000 });
  await expect(cartItemName).toHaveCount(1);
  await expect(cartItemName).toContainText('Sauce Labs Backpack');

  // Act - Open menu and logout
  const menuButton = page.locator('[data-test="react-burger-menu-btn"]');
  await menuButton.waitFor({ state: 'visible', timeout: 10000 });
  await expect(menuButton).toHaveCount(1);
  await menuButton.click();

  const logoutLink = page.locator('[data-test="logout_sidebar_link"]');
  await logoutLink.waitFor({ state: 'visible', timeout: 10000 });
  await expect(logoutLink).toHaveCount(1);
  await logoutLink.click();

  // Assert - Verify redirected to login page
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL('https://www.saucedemo.com/');
});