// tests/saucedemo.spec.js
const { test, expect } = require('@playwright/test');

test.describe('SauceDemo - Login, Add to Cart and Logout', () => {
  const url = 'https://www.saucedemo.com/';
  const username = 'standard_user';
  const password = 'secret_sauce';
  const productName = 'Sauce Labs Backpack';

  async function fillUsername(page) {
    try {
      await page.getByTestId('username', { timeout: 2000 }).fill(username);
    } catch {
      await page.getByLabel(/username/i).fill(username);
    }
  }

  async function fillPassword(page) {
    try {
      await page.getByTestId('password', { timeout: 2000 }).fill(password);
    } catch {
      await page.getByLabel(/password/i).fill(password);
    }
  }

  async function clickLogin(page) {
    try {
      await page.getByTestId('login-button', { timeout: 2000 }).click();
    } catch {
      await page.getByRole('button', { name: /login/i }).click();
    }
  }

  async function addProductToCart(page, name) {
    const product = page.getByText(name, { exact: true }).first();
    await expect(product).toBeVisible();
    const addBtn = product.locator('..').locator('button:has-text("Add to cart")');
    await addBtn.click();
  }

  async function openCart(page) {
    try {
      await page.getByTestId('shopping_cart_container', { timeout: 2000 }).click();
    } catch {
      await page.getByRole('link', { name: /shopping cart/i }).click();
    }
  }

  async function openMenu(page) {
    try {
      await page.getByTestId('react-burger-menu-btn', { timeout: 2000 }).click();
    } catch {
      await page.getByRole('button', { name: /open menu|menu/i }).click();
    }
  }

  async function clickLogout(page) {
    try {
      await page.getByTestId('logout_sidebar_link', { timeout: 2000 }).click();
    } catch {
      await page.getByRole('link', { name: /logout/i }).click();
    }
  }

  test('should login, add product to cart and logout successfully', async ({ page }) => {
    // Navigate to login page
    await page.goto(url);
    await expect(page).toHaveURL(/saucedemo\.com\/?$/);

    // Login
    await fillUsername(page);
    await fillPassword(page);
    await clickLogin(page);

    // Verify inventory page
    await expect(page).toHaveURL(/inventory\.html/);
    await page.getByText('Products', { exact: true }).waitFor({ timeout: 5000 });

    // Add product to cart
    await addProductToCart(page, productName);

    // Verify cart badge shows 1
    const badge = page.locator('.shopping_cart_badge');
    await expect(badge).toHaveText('1');

    // Open cart and verify product is listed
    await openCart(page);
    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.getByText(productName, { exact: true })).toBeVisible();

    // Logout
    await openMenu(page);
    await clickLogout(page);
    await expect(page).toHaveURL(/saucedemo\.com\/?$/);
    await page.getByRole('button', { name: /login/i }).waitFor({ timeout: 5000 });
  });
});