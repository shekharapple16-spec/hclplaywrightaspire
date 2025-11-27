const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;
    this.selectors = {
      username: '#user-name',
      password: '#password',
      loginButton: '#login-button',
      productsTitle: '.title'
    };
  }

  async login(username, password) {
    await this.page.fill(this.selectors.username, username);
    await this.page.fill(this.selectors.password, password);
    await this.page.click(this.selectors.loginButton);
  }

  getProductsTitleLocator() {
    return this.page.locator(this.selectors.productsTitle);
  }
}

module.exports = LoginPage;
