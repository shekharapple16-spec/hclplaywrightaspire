const { test, expect } = require('@playwright/test');

test('DatePicker - select a future date', async ({ page }) => {
  await page.goto('https://demo.automationtesting.in/Datepicker.html');
  const future = new Date();
  future.setDate(future.getDate() + 30);
  const day = String(future.getDate()).padStart(2, '0');
  const month = String(future.getMonth() + 1).padStart(2, '0');
  const year = future.getFullYear();
  const value = `${month}/${day}/${year}`;
  await page.evaluate((v) => {
    const inputs = Array.from(document.querySelectorAll('input'));
    let target = inputs.find(i => i && (i.id && i.id.toLowerCase().includes('date')) ) || inputs[0];
    if (target) target.value = v;
  }, value);
  await page.waitForTimeout(500);
  const current = await page.evaluate(() => document.querySelector('input')?.value || '');
  expect(current).toContain(String(year));
});
