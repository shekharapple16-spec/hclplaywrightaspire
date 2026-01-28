import { test, expect } from '#fixtures';

test('Validate vertical scrolling on healthcaresuccess.com', async ({ page }) => {
  // Navigate to the page
  await page.goto('https://healthcaresuccess.com');

  // Scroll to the bottom of the page using JavaScript
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  // Wait for the footer text to be visible (using regex for partial match)
  await page.waitForSelector('text=/Healthcare Success/', { timeout: 5000 });

  // Verify that the bottom-most content is visible
  const bottomText = await page.locator('text=/Healthcare Success/').first();
  await expect(bottomText).toBeVisible();

  // Capture a screenshot after scrolling to confirm visual rendering
  await page.screenshot({ path: 'healthcaresuccess_scrolled.png' });
});