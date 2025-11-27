const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const { BASE_URL, CREDENTIALS } = require('../../utils/constants');
const { takeScreenshot } = require('../../utils/helpers');

test('Login using Page Object and helpers', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto(BASE_URL);
  await loginPage.login(CREDENTIALS.username, CREDENTIALS.password);

  const title = loginPage.getProductsTitleLocator();
  await expect(title).toHaveText('Products');

  await takeScreenshot(page, 'saucedemo_products_pom');
});
