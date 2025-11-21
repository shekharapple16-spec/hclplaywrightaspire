const { test, expect } = require('@playwright/test');

test('Dropdown Validation - Single & Multi Select', async ({ page }) => {
  await page.goto('https://www.testautomationcentral.com/demo/dropdown.html');

  // Single-select
  const singleSelect = page.locator('.form-select').first();
  await singleSelect.selectOption({ label: 'Option 2' });
  await expect(singleSelect).toHaveValue('option2');

  // Multi-select
  await page.locator('.tabs button').nth(2).click();
  const multiSelect = page.locator('.form-multiselect').first();
  await multiSelect.selectOption(['Option 1', 'Option 2', 'Option 3']);
  const selectedValues = await multiSelect.evaluate(el => Array.from(el.selectedOptions).map(o => o.value));
  expect(selectedValues).toEqual(['option1', 'option2', 'option3'])});
