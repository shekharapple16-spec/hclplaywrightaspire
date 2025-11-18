//
//
//
//7.Check box validation
//
//7 a. Checkbox Validation on LeafGround
//
//URL: https://leafground.com/checkbox.xhtml
//
//
//
//Steps:
//
//Navigate to the URL.
//
//Enable the Basic Checkbox.
//
//Select all five checkboxes under "Choose your favorite language(s)".


// @ts-check
const { test, expect } = require('@playwright/test');

test('Checkbox Validation on LeafGround', async ({ page }) => {
  await page.goto('https://leafground.com/checkbox.xhtml');
  await page.locator('div.ui-selectbooleancheckbox div.ui-chkbox-box').nth(0).click(); // Basic Checkbox

  const divs = page.locator('div.card h5+div>div>table>tbody>tr>td>div')

  const count = await divs.count()


for (let i = 0; i < count; i++) {
    await divs.nth(i).click();
}





});
