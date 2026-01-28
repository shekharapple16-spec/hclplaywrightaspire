//1.Use Case: Herokuapp Login Validation
//
//Scenario Description:
//
//Navigate to the login pag
//
//https://the-internet.herokuapp.com/login
//
//Username=tomsmith
//
//Password=SuperSecretPassword!
//
//Fill in the username and password using (id attribute)
//
//Click the login button using its ARIA role(getByRole())


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