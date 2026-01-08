import { test, expect } from '@playwright/test';

test('Successful login, add product to cart, and logout on SauceDemo', async ({ page }) => {
  // Navigate to login page and wait for DOM ready
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('domcontentloaded');

  // ---------- Login ----------
  // Username input: try label, then placeholder, then role
  let usernameInput;
  try {
    usernameInput = page.getByLabel(/username/i);
    await usernameInput.waitFor({ timeout: 3000 });
  } catch {
    try {
      usernameInput = page.getByPlaceholder(/username/i);
      await usernameInput.waitFor({ timeout: 3000 });
    } catch {
      usernameInput = page.getByRole('textbox', { name: /username/i });
      await usernameInput.waitFor({ timeout: 3000 });
    }
  }
  await usernameInput.fill('standard_user');

  // Password input: similar fallback strategy
  let passwordInput;
  try {
    passwordInput = page.getByLabel(/password/i);
    await passwordInput.waitFor({ timeout: 3000 });
  } catch {
    try {
      passwordInput = page.getByPlaceholder(/password/i);
      await passwordInput.waitFor({ timeout: 3000 });
    } catch {
      passwordInput = page.getByRole('textbox', { name: /password/i });
      await passwordInput.waitFor({ timeout: 3000 });
    }
  }
  await passwordInput.fill('secret_sauce');

  // Login button: primary role, fallback to text
  let loginButton;
  try {
    loginButton = page.getByRole('button', { name: /login/i });
    await loginButton.waitFor({ timeout: 3000 });
  } catch {
    loginButton = page.getByText(/^login$/i);
    await loginButton.waitFor({ timeout: 3000 });
  }
  await loginButton.click();

  // Verify we are on the inventory page
  await expect(page).toHaveURL(/inventory.html/);
  const inventoryTitle = page.getByRole('heading', { name: /products/i });
  await expect(inventoryTitle).toBeVisible();

  // ---------- Add Product to Cart ----------
  // Choose "Sauce Labs Backpack" (fallback if not found)
  const productName = 'Sauce Labs Backpack';
  const productContainer = page.locator('.inventory_item').filter({ hasText: productName }).first();

  await expect(productContainer).toBeVisible({ timeout: 5000 });

  // Within the product container, locate the "Add to cart" button
  let addToCartBtn;
  try {
    addToCartBtn = productContainer.getByRole('button', { name: /add to cart/i });
    await addToCartBtn.waitFor({ timeout: 3000 });
  } catch {
    addToCartBtn = productContainer.getByText(/^add to cart$/i);
    await addToCartBtn.waitFor({ timeout: 3000 });
  }
  await addToCartBtn.click();

  // Verify cart badge shows "1"
  const cartBadge = page.locator('.shopping_cart_badge');
  await expect(cartBadge).toHaveText('1');

  // ---------- Open Cart ----------
  // Cart icon may not have accessible name; fallback to selector
  let cartIcon;
  try {
    cartIcon = page.getByRole('link', { name: /cart/i });
    await cartIcon.waitFor({ timeout: 3000 });
  } catch {
    cartIcon = page.locator('.shopping_cart_link');
    await cartIcon.waitFor({ timeout: 3000 });
  }
  await cartIcon.click();

  // Verify product appears in cart
  const cartItem = page.locator('.cart_item').filter({ hasText: productName }).first();
  await expect(cartItem).toBeVisible({ timeout: 5000 });

  // ---------- Logout ----------
  // Open side menu
  let menuButton;
  try {
    menuButton = page.getByRole('button', { name: /open menu/i });
    await menuButton.waitFor({ timeout: 3000 });
  } catch {
    menuButton = page.locator('#react-burger-menu-btn');
    await menuButton.waitFor({ timeout: 3000 });
  }
  await menuButton.click();

  // Click logout link
  let logoutLink;
  try {
    logoutLink = page.getByRole('link', { name: /logout/i });
    await logoutLink.waitFor({ timeout: 3000 });
  } catch {
    logoutLink = page.getByText(/^logout$/i);
    await logoutLink.waitFor({ timeout: 3000 });
  }
  await logoutLink.click();

  // Verify we are back on the login page
  await expect(page).toHaveURL('https://www.saucedemo.com/');
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
});