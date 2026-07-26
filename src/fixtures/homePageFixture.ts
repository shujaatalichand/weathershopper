import { test as base } from '@playwright/test';
import { suite } from 'allure-js-commons';
import { WeatherShopperHomePage } from '../pages/WeatherShopperHomePage';

type Fixtures = {
  homePage: WeatherShopperHomePage;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await suite('Home Page');
    const homePage = new WeatherShopperHomePage(page);
    await homePage.goto();
    await use(homePage);
  },
});

export { expect } from '@playwright/test';
