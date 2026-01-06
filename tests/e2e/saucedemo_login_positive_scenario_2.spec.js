import { test, expect } from '@playwright/test';

test('Successful login, add product to cart, and logout on SauceDemo', async ({ page }) => {
  // Arrange: open login page and perform authentication
  await page.goto('https://www.saucedemo.com/');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  const loginButton = page.getByRole('button', { name: 'Login', exact: true });
  await expect(loginButton).toBeEnabled();
  await loginButton.click();

  // Assert: inventory page is displayed
  await expect(page).toHaveURL(/.*inventory\.html/);
  await expect(page.locator('.inventory_list')).toBeVisible();

  // Act: add the first product to the cart
  const firstAddToCart = page.locator('[data-test^="add-to-cart-"]').first();
  await expect(firstAddToCart).toBeEnabled();
  await firstAddToCart.click();

  // Assert: cart badge reflects one item
  const cartBadge = page.locator('.shopping_cart_badge');
  await expect(cartBadge).toHaveText('1');

  // Act: navigate to the cart
  await page.locator('.shopping_cart_link').click();

  // Assert: selected product appears in the cart
  await expect(page.locator('.cart_item')).toBeVisible();

  // Act: open the side menu and logout
  try {
    const menuButton = page.getByRole('button', { name: 'Open Menu', exact: true });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const logoutLink = page.getByRole('link', { name: 'Logout', exact: true });
    await expect(logoutLink).toBeVisible();
    await logoutLink.click();
  } catch (error) {
    // If menu interaction fails, fallback to direct selectors
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('#logout_sidebar_link').click();
  }

  // Assert: user is redirected back to the login page
  await expect(page).toHaveURL('https://www.saucedemo.com/');
  await expect(page.locator('[data-test="username"]')).toBeVisible();
});