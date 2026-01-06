import { test, expect } from '@playwright/test';

test('Successful login, product verification, add to cart, and logout', async ({ page }) => {
  // Arrange: Navigate to SauceDemo login page
  await page.goto('https://www.saucedemo.com/');

  // Act: Perform login using stable data-test selectors
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  const loginButton = page.getByRole('button', { name: 'Login', exact: true });
  await expect(loginButton).toBeEnabled();
  await loginButton.click();

  // Assert: Verify navigation to inventory page and product list visibility
  await expect(page).toHaveURL(/.*inventory\.html/);
  await expect(page.locator('.inventory_list')).toBeVisible();

  // Act: Capture first product name for later verification
  const firstProductNameLocator = page.locator('.inventory_item_name').first();
  const firstProductName = await firstProductNameLocator.textContent();

  // Act: Add the first product to the cart using data-test attribute pattern
  await page.locator('[data-test^="add-to-cart-"]').first().click();

  // Assert: Cart badge reflects one item
  const cartBadge = page.locator('.shopping_cart_badge');
  await expect(cartBadge).toHaveText('1');

  // Act: Open cart and verify the selected product appears
  await page.locator('.shopping_cart_link').click();
  const cartItemName = page.locator('.cart_item .inventory_item_name').first();
  await expect(cartItemName).toBeVisible();
  await expect(cartItemName).toHaveText(firstProductName?.trim() ?? '');

  // Act: Open side menu and logout
  try {
    const menuButton = page.getByRole('button', { name: 'Open Menu', exact: true });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    const logoutLink = page.locator('#logout_sidebar_link');
    await expect(logoutLink).toBeVisible();
    await logoutLink.click();
  } catch (error) {
    // If menu/logout fails, fail the test with a clear message
    throw new Error(`Logout sequence failed: ${error}`);
  }

  // Assert: Verify redirection back to login page
  await expect(page).toHaveURL('https://www.saucedemo.com/');
});