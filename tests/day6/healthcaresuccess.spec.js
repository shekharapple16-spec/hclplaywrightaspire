const { test, expect } = require('@playwright/test');
const fs = require('fs');

test('Healthcare Success Screenshot Comparison', async ({ page }) => {
  await page.goto('https://healthcaresuccess.com');
  await page.waitForTimeout(2000);
  const screenshot = await page.screenshot({ fullPage: true });
  // Read the existing baseline image
  let baseline;
  try {
    baseline = fs.readFileSync('tests/day6/healthcaresuccess.png');
  } catch (e) {
    // If the baseline doesn't exist, save the current screenshot as the new baseline
    fs.writeFileSync('tests/day6/healthcaresuccess.png', screenshot);
    expect(true).toBe(true); // Succeed on the first run
    return;
  }
  // Compare the screenshots
  expect(screenshot).toEqual(baseline);
});
