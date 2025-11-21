const { test, expect } = require('@playwright/test');

test('Heroku Invalid Login Validation using filter()', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/login');

  await page.fill('#username', 'tomsmith');
  await page.fill('#password', 'test123');
  await page.click('button[type="submit"]');

 await expect(page.getByText('Your password is invalid!')).toBeVisible();


});