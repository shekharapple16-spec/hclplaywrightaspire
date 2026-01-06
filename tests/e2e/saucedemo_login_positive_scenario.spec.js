import { test, expect } from '@playwright/test';

test('SauceDemo Positive Login Scenario', async ({ page }) => {
  // Setup - Navigate to the login page
  await page.goto('https://www.saucedemo.com/');

  // Actions - Fill in credentials and submit
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for navigation to inventory page
  await page.waitForURL('**/inventory.html');

  // Assertions - Verify URL contains inventory page
  expect(page.url()).toContain('inventory.html');

  // Assertions - Verify "Products" header is visible
  const headerText = await page.getByRole('heading', { name: 'Products' }).innerText();
  expect(headerText).toContain('Products');

  // Assertions - Verify shopping cart icon is present
  const cartClass = await page.getByRole('link', { name: 'shopping cart' }).getAttribute('class');
  expect(cartClass).toContain('shopping_cart_link');
});