
//6. Validate Login Functionality with Element based Assertion
//
//
//
//Launch the browser and navigate to the login page using https://the-internet.herokuapp.com/login
//
//Locate the username and password fields using attribute-based selectors.
//
//Fill in valid credentials:
//
//Username: tomsmith
//
//Password: SuperSecretPassword!
//
//Click the Login button.

//Assert that the success message "You logged into a secure area!" is visible.

// @ts-check
const { test, expect } = require('@playwright/test');


test('Validate Login with Assertion', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/login');
  await page.fill('#username', 'tomsmith');
  await page.fill('#password', 'SuperSecretPassword!');
  await page.click('button[type="submit"]');
  await expect(page.locator('#flash')).toContainText('You logged into a secure area!');
});