import { test, expect } from '#fixtures';

test('DatePicker - select a future date', async ({ page }) => {
  await page.goto('https://demo.automationtesting.in/Datepicker.html');
  const future = new Date();
  future.setDate(future.getDate() + 30);
  const day = String(future.getDate()).padStart(2, '0');
  const month = String(future.getMonth() + 1).padStart(2, '0');
  const year = future.getFullYear();
  const value = `${month}/${day}/${year}`;
  // Use Playwright's fill to set the date and trigger events
  await page.fill('input[id*="date"]', value);
  await page.waitForTimeout(500);
  // Retrieve the value from the same input
  const current = await page.inputValue('input[id*="date"]');
  expect(current).toContain(String(year));
});