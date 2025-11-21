const { test, expect } = require('@playwright/test');

test('Radio Button Validation', async ({ page }) => {
  await page.goto('https://demoqa.com/radio-button');

  await page.locator('label[for="yesRadio"]').click();
  await expect(page.locator('.text-success')).toHaveText('Yes')
});
