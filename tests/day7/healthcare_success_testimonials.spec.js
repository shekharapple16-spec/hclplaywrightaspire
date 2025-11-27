// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('Extract testimonials from Healthcare Success and write to file', async ({ page }) => {
  try {
    await page.goto('https://healthcaresuccess.com/about/testimonials');

    // Extract all visible testimonial content
    const testimonials = await page.locator('.testimonial-slide-text').allTextContents();

    // Write the extracted text into a file
    const filePath = path.join(__dirname, 'testimonials.txt');
    fs.writeFileSync(filePath, testimonials.join('\n'));

  console.log(`Testimonials written to ${filePath}`);
  } catch (error) {
    console.error(`Test failed: ${error}`);
    throw error; // Re-throw the error to fail the test
  }
});