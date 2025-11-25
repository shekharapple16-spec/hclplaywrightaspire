const { test, expect } = require('@playwright/test');

test('Multi-Select Listbox Validation on TestAutomationCentral', async ({ page }) => {
  await page.goto('https://testautomationcentral.com/demo/multi_select_dropdown.html');
  const fruitsButton = page.locator('#dropdown-toggle');
  await fruitsButton.click();

  const itemsToSelect = ['Banana','Cherry','Fig'];
  for (const item of itemsToSelect) {
    await page.locator('li', { hasText: item }).click();
  }
  await expect(page.locator('#selected-items')).toContainText(itemsToSelect.join(', '));
});