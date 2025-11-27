const { test, expect } = require('@playwright/test');

test.describe('Alerts - Leafground', () => {
  test('Handle simple alert, confirm, prompt and sweet alert', async ({ page }) => {
    // 1. Navigate to the page
    await page.goto('https://leafground.com/alert.xhtml');

    // 2. Simple Alert - attach handler then click
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('alert');
      await dialog.accept();
    });
    await page.locator('button[name="j_idt88:j_idt91"]').click();
    await expect(page.getByText('You have successfully clicked an alert')).toBeVisible();

    // 3. Confirmation Alert - dismiss then accept
    // 3. Confirmation Alert - dismiss then accept
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.dismiss();
    });
    await page.locator('button[name="j_idt88:j_idt93"]').click();
    await expect(page.getByText('User Clicked : Cancel')).toBeVisible();

    page.once('dialog', async dialog => {
      await dialog.accept();
    });
    await page.locator('button[name="j_idt88:j_idt93"]').click();
    await expect(page.getByText('User Clicked : OK')).toBeVisible();

    // 4. Prompt Alert - enter text and accept
    // 4. Prompt Alert - enter text and accept
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('prompt');
      await dialog.accept('PlaywrightUser');
    });
    await page.locator('button[name="j_idt88:j_idt104"]').click();
    await expect(page.getByText('User entered name as: PlaywrightUser')).toBeVisible();

    // 5. Sweet Alert (DOM modal) - open and close
    await page.locator('button[name="j_idt88:j_idt95"]').click();

    // Click Close inside modal (found during live run)
    await page.getByRole('button', { name: 'Close' }).click();

  });
});