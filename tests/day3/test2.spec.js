//2. OrangeHRM Login Validation
//
//https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
//
//User name:Admin
//
//password:admin123
//
//
//Scenario Description:
//
//Navigate to the OrangeHRM login page
//
//Enter valid credentials(getByPlaceholder())
//
//Click the login button(getByRole())
// @ts-check
import { test, expect } from '#fixtures';
test('OrangeHRM Login Validation', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/dashboard/);
});