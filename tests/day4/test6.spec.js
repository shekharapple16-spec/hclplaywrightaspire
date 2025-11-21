const { test, expect } = require('@playwright/test');

test('Dropdown Validation on QAPLAYGROUND', async ({ page }) => {
  await page.goto('https://www.qaplayground.com/practice/select');

  // await page.waitForSelector('div[role="presentation"]', { state: 'visible' });

  await page.locator('button[dir="ltr"]').nth(2).click()

  await page.getByText('India', { exact: true }).click()

  const selectedText = await page.locator('button[dir="ltr"] span').nth(2).innerText();
  expect(selectedText).toBe('India');

});