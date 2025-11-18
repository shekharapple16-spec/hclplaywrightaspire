//3.Herokuapp Login Page Validation
//
//
//
//Navigate to the login page
//
//https://the-internet.herokuapp.com/login
//
//Username=tomsmith
//
//Password=SuperSecretPassword!
//
//Fill in the username and password using (locator())
//
//Click the login button using (locator())

// @ts-check
const { test, expect } = require('@playwright/test');
test('Herokuapp Login using locator', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/login');
  await page.locator('#username').fill('tomsmith');
  await page.locator('#password').fill('SuperSecretPassword!');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#flash')).toContainText('You logged into a secure area!');
});
