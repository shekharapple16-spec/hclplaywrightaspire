// @ts-check
import { test, expect } from '#fixtures';

test('Herokuapp Login Validation', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/login');
  await page.waitForSelector('#username', { timeout: 10000 });
  await page.fill('#username', 'tomsmith');
  await page.fill('#password', 'SuperSecretPassword!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#flash')).toContainText('You logged into a secure area!');
});