const { test, expect } = require('@playwright/test');
const path = require('path');

test('W3Schools File Upload Validation', async ({ page }) => {
  await page.goto('https://www.w3schools.com/howto/howto_html_file_upload_button.asp');
  const fileInput = page.locator('input[type="file"]');
  if (await fileInput.count() === 0) {
    throw new Error('File input element not found on page');
  }

  const sampleFile = path.resolve(__dirname, 'sample.txt');
  await fileInput.setInputFiles(sampleFile);

  const uploadedFileName = await fileInput.evaluate(el => el.files?.[0]?.name);
  expect(uploadedFileName).toBe('sample.txt');
});
