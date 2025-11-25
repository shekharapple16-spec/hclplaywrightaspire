const { test, expect } = require('@playwright/test');

test('Multi-Select Listbox Validation on TestAutomationCentral', async ({ page }) => {
  await page.goto('https://testautomationcentral.com/demo/multi_select_dropdown.html');
  const fruitsListbox = page.locator('#fruits');
  if (await fruitsListbox.count() === 0) {
    throw new Error('Multi-select listbox (#fruits) not found on page');
  }
  await fruitsListbox.selectOption([
    { label: 'Apple' },
    { label: 'Banana' },
    { label: 'Grapes' }
  ]);
  const selectedValues = await fruitsListbox.evaluate(el => Array.from(el.selectedOptions).map(o => o.label));
  expect(selectedValues).toEqual(['Apple', 'Banana', 'Grapes']);
});
