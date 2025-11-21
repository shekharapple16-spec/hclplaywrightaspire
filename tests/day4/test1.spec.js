const { test, expect } = require('@playwright/test');

test('Heroku Login Validation using nth()', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/login');

  await page.locator('input').nth(0).fill('tomsmith'); // Username
  await page.locator('input').nth(1).fill('SuperSecretPassword!'); // Password
  await page.locator('button').nth(0).click(); // Login button

  await expect(page.locator('#flash')).toContainText('You logged into a secure area!');
});
