//5. Automate Test login(https://practicetestautomation.com/practice-test-login/) to simulate a user entering text into the Sign up form using Playwright’s fill() method.
//
//Test Steps
//
//Browser context is initialized.
//
//Launch the browser and navigate to https://practicetestautomation.com/practice-test-login/ with credentials
//
// Username: student
//
//Password: Password123
//
// to verify that the sign-up form on a demo login page correctly accepts user input. This includes entering a username, email, and password into the respective fields. The automation script uses Playwright to launch a browser, navigate to the demo site, and fill in the form fields using the fill() method.
//
//Steps:
//
//Launch browser and navigate to the demo login page.
//
//Locate the sign-up form fields using selectors (e.g., input[name="username"], input[name="email"], input[name="password"]).
//
//Use fill() to enter sample data into each field.
//
//Optionally, submit the form and verify success or error messages.


// @ts-check
const { test, expect } = require('@playwright/test');
test('Practice Test Automation Login & Fill Form', async ({ page }) => {
  await page.goto('https://practicetestautomation.com/practice-test-login/');
  await page.fill('input[name="username"]', 'student');
  await page.fill('input[name="password"]', 'Password123');
  await page.click('button[id="submit"]');
  await expect(page.locator('.post-title')).toContainText('Logged In Successfully');
});