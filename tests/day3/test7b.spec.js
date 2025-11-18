
//7b. Enable All Checkboxes on Expand Testing
//
//URL: https://practice.expandtesting.com/checkboxes
//
//
//
//Steps:
//
//Navigate to the URL.
//
//Enable all checkboxes on the page.



// @ts-check
const { test, expect } = require('@playwright/test');

test('Enable All Checkboxes on Expand Testing', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/checkboxes');
  const checkboxes = page.locator('input[type="checkbox"]');
  const count = await checkboxes.count();
  for (let i = 0; i < count; i++) {
    await checkboxes.nth(i).check();
  }
});