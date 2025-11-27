// @ts-check
const { test, expect } = require('@playwright/test');

test('Interact with embedded frame on Leafground', async ({ page }) => {
  await page.goto('https://leafground.com/frame.xhtml');

  // Switch to the frame
  const frame = page.frameLocator('iframe[src*=\'default.xhtml\']');

  // Wait for the button to be visible and click it
  await frame.locator('button#Click').waitFor({state: 'visible'});
  await frame.locator('button#Click').click();

  // Verify that the button click changes the text
  await expect(frame.locator('button#Click')).toHaveText('Hurray! You Clicked Me.');
});