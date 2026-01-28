import { test, expect } from '#fixtures';
import LoginPage from '../../pages/LoginPage.js';
import { BASE_URL, CREDENTIALS } from '../../utils/constants.js';
import { takeScreenshot } from '../../utils/helpers.js';

test('Login using Page Object and helpers', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto(BASE_URL);
  await loginPage.login(CREDENTIALS.username, CREDENTIALS.password);

  const title = loginPage.getProductsTitleLocator();
  await expect(title).toHaveText('Products');

  await takeScreenshot(page, 'saucedemo_products_pom');
});
