import { test, expect } from '@playwright/test';

test('login, add product to cart and logout', async ({ page }) => {
  // 1. Navigate to login page
  await page.goto('https://www.saucedemo.com/', { timeout: 2000 });
  await expect(page).toHaveURL(/saucedemo\.com/);

  // 2. Perform login
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  // 3. Verify inventory page is displayed
  await expect(page.getByText('Products')).toBeVisible();

  // 4. Add first product to cart
  await page.getByRole('button', { name: 'Add to cart' }).first().click();

  // 5. Verify cart badge shows 1 item
  await expect(page.getByText('1')).toBeVisible();

  // 6. Open cart and verify product is listed
  await page.getByRole('link', { name: /cart/i }).click();
  await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();

  // 7. Open side menu and logout
  await page.getByRole('button', { name: /menu/i }).click();
  await page.getByRole('link', { name: 'Logout' }).click();

  // 8. Verify user is back on login page
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});