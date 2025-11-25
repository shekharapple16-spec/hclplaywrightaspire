// const { test, expect } = require('@playwright/test');

// test('Leafground Alerts - handle alert, confirm, prompt and sweet modal', async ({ page }) => {
//   await page.goto('https://leafground.com/alert.xhtml');
//   page.once('dialog', async dialog => { await dialog.accept(); });
//   await page.click('text=Show');
//   page.once('dialog', async dialog => { await dialog.dismiss(); });
//   await page.click('text=Confirm');
//   page.once('dialog', async dialog => { await dialog.accept('Playwright'); });
//   await page.click('text=Prompt');
//   const modal = page.locator('div[role="dialog"], .ui-dialog, .swal-overlay');
//   if (await modal.count() > 0) {
//     await expect(modal.first()).toBeVisible();
//   }
// });
