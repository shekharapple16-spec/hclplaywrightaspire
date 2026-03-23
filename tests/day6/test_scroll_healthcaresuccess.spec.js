import { test, expect } from '#fixtures';

test('Validate vertical scrolling on healthcaresuccess.com', async ({ page }) => {
  // Navigate to the page
  await page.goto('https://healthcaresuccess.com');

  // Scroll to the bottom of the page using JavaScript
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  // Verify that the footer text is visible using the proper text selector API
  const bottomText = page.getByText(/Healthcare Success/).first();
  await expect(bottomText).toBeVisible();

  // Capture a screenshot after scrolling to confirm visual rendering
  await page.screenshot({ path: 'healthcaresuccess_scrolled.png' });
});