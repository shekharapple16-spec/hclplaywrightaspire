//4.Automate the action of navigating to https://playwright.dev and clicking the “API” link using
//
//Playwright’s getByRole() method to validate accessibility-based navigation.
//
//
//
//Test Steps:
//
//Playwright test environment is set up with TypeScript.
//
//Browser context is initialized.
//
//Launch the browser and navigate to https://playwright.dev.
//
//Use getByRole() to locate the API link.
//
//Click the link.
// @ts-check
const { test, expect } = require('@playwright/test');

test('Navigate to Playwright.dev and click API link', async ({ page }) => {
  await page.goto('https://playwright.dev');
  await page.getByRole('link', { name: 'API' }).click();
  await expect(page).toHaveURL(/api/);
});