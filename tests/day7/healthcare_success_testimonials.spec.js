// @ts-check
import { test, expect } from '#fixtures';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Extract testimonials from Healthcare Success and write to file', async ({ page }) => {
  try {
    await page.goto('https://healthcaresuccess.com/about/testimonials');

    // Ensure testimonial elements are loaded
    await page.waitForSelector('.testimonial-slide-text', { state: 'visible' });

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