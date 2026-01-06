import { test, expect } from '@playwright/test';

test('SauceDemo Positive Login Scenario', async ({ page }) => {
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

  // Act – click Login button
  const loginBtn = page.getByRole('button', { name: 'Login' });
  await loginBtn.waitFor({ state: 'visible', timeout: 10000 });
  await loginBtn.click();

  // Wait for navigation to inventory page
  await page.waitForLoadState('networkidle');

  // Assert – URL contains inventory page
  await expect(page).toHaveURL(/\/inventory\.html$/);

  // Assert – Products header is visible
  const productsHeader = page.locator('.header_secondary_container .title');
  await productsHeader.waitFor({ state: 'visible', timeout: 10000 });
  await expect(productsHeader).toContainText('Products');

  // Assert – Shopping cart icon is visible
  const cartIcon = page.locator('.shopping_cart_link');
  await cartIcon.waitFor({ state: 'visible', timeout: 10000 });
  await expect(cartIcon).toBeTruthy();
});

test('SauceDemo Logout After Successful Login', async ({ page }) => {
  // Arrange – perform login (reuse steps from previous test)
  await page.goto('https://www.saucedemo.com/');
  await page.waitForLoadState('networkidle');

  const usernameInput = page.getByPlaceholder('Username');
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.fill('standard_user');

  const passwordInput = page.getByPlaceholder('Password');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill('secret_sauce');

  const loginBtn = page.getByRole('button', { name: 'Login' });
  await loginBtn.waitFor({ state: 'visible', timeout: 10000 });
  await loginBtn.click();

  await page.waitForLoadState('networkidle');

  // Act – open side menu (hamburger)
  const menuBtn = page.locator('#react-burger-menu-btn');
  await menuBtn.waitFor({ state: 'visible', timeout: 10000 });
  await menuBtn.click();

  // Act – click Logout option
  const logoutLink = page.locator('#logout_sidebar_link');
  await logoutLink.waitFor({ state: 'visible', timeout: 10000 });
  await logoutLink.click();

  // Wait for navigation back to login page
  await page.waitForLoadState('networkidle');

  // Assert – URL is login page
  await expect(page).toHaveURL('https://www.saucedemo.com/');

  // Assert – Username field is visible
  const usernameField = page.getByPlaceholder('Username');
  await usernameField.waitFor({ state: 'visible', timeout: 10000 });
  await expect(usernameField).toBeTruthy();

  // Assert – Password field is visible
  const passwordField = page.getByPlaceholder('Password');
  await passwordField.waitFor({ state: 'visible', timeout: 10000 });
  await expect(passwordField).toBeTruthy();
});