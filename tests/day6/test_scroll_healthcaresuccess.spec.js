const { test, expect } = require('@playwright/test');

test('Validate vertical scrolling on healthcaresuccess.com', async ({ page }) => {
  // Navigate to the page
  await page.goto('https://healthcaresuccess.com');

  // Scroll to the bottom of the page using JavaScript
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  // Wait for the text to be visible
  await page.waitForSelector('text=© 2025 Healthcare Success, LLC', { timeout: 5000 });

  // Verify that the bottom-most content is visible
  const bottomText = await page.$('text=© 2025 Healthcare Success, LLC');
  expect(bottomText).toBeTruthy();

  // Capture a screenshot after scrolling to confirm visual rendering
  await page.screenshot({ path: 'healthcaresuccess_scrolled.png' });
});