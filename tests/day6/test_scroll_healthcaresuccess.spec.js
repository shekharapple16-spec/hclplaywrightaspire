const { test, expect } = require('@playwright/test');

test('HealthCareSuccess - scroll to bottom and snapshot', async ({ page }) => {
  await page.goto('https://healthcaresuccess.com');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  const shot = await page.screenshot({ fullPage: true });
  expect(shot).toMatchSnapshot('healthcaresuccess.png');
});
