const { test, expect } = require('@playwright/test');

test('The-Internet Large - scroll and verify bottom content', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/large');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  const shot = await page.screenshot({ fullPage: true });
  expect(shot).toMatchSnapshot('the-internet-large.png');
});
