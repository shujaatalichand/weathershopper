import { test as base } from '@playwright/test';
import { suite } from 'allure-js-commons';
import { WeatherShopperHomePage } from '../pages/WeatherShopperHomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';

type Fixtures = {
  homePage: WeatherShopperHomePage;
  productsPage: ProductsPage;
  cartPage: CartPage;
  confirmationPage: ConfirmationPage;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await suite('Home Page');
    const homePage = new WeatherShopperHomePage(page);
    await homePage.goto();
    await use(homePage);
  },

  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  confirmationPage: async ({ page }, use) => {
    await use(new ConfirmationPage(page));
  },
});

export { expect } from '@playwright/test';
