// @ts-check
const { test, expect } = require('@playwright/test');

test('Navigate and validate nested frames content', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/nested_frames');

  // Switch to the top frame
  const topFrame = page.frameLocator('frame[name="frame-top"]');

  // Verify the left frame content
  const leftFrame = topFrame.frameLocator('frame[name="frame-left"]');
  await expect(leftFrame.locator('body')).toContainText('LEFT');

  // Verify the middle frame content
  const middleFrame = topFrame.frameLocator('frame[name="frame-middle"]');
  await expect(middleFrame.locator('body')).toContainText('MIDDLE');

  // Verify the right frame content
  const rightFrame = topFrame.frameLocator('frame[name="frame-right"]');
  await expect(rightFrame.locator('body')).toContainText('RIGHT');

  // Switch to the bottom frame
  const bottomFrame = page.frameLocator('frame[name="frame-bottom"]');
  await expect(bottomFrame.locator('body')).toContainText('BOTTOM');
});