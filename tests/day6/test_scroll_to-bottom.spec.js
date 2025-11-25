const { test, expect } = require('@playwright/test');

test('Validate vertical scroll and bottom content visibility', async ({ page }) => {

  // Navigate
  await page.goto('https://the-internet.herokuapp.com/large');

  // Scroll to the bottom
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  // Wait for scroll to settle
  await page.waitForTimeout(1000);

  // Verify bottom-most content (e.g., last row element)
  const lastCell = page.locator('#large-table tbody tr:last-child');

  await expect(lastCell).toBeVisible();

  // Capture screenshot
  await page.screenshot({ path: 'scrolled-bottom.png', fullPage: true });

});
