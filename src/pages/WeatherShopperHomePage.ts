import { Page, Locator, expect } from '@playwright/test';
import { ProductsPage } from './ProductsPage';

export class WeatherShopperHomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly temperature: Locator;
  readonly buyMoisturizersButton: Locator;
  readonly buySunscreensButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Current temperature' });
    this.temperature = page.locator('#temperature');
    this.buyMoisturizersButton = page.getByRole('button', { name: 'Buy moisturizers' });
    this.buySunscreensButton = page.getByRole('button', { name: 'Buy sunscreens' });
  }

  async goto() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  async getTemperatureValue(): Promise<number> {
    await this.temperature.waitFor({ state: 'visible' });
    const text = await this.temperature.innerText();
    return parseInt(text, 10);
  }

  async assertLoaded() {
    await expect(this.page).toHaveTitle('Current Temperature');
    await expect(this.heading).toBeVisible();
    await expect(this.buyMoisturizersButton).toBeVisible();
    await expect(this.buySunscreensButton).toBeVisible();
  }

  async assertTemperatureIsValid() {
    const temperature = await this.getTemperatureValue();
    expect(temperature).toBeGreaterThan(0);
  }

  async buyMoisturizers(): Promise<ProductsPage> {
    await this.buyMoisturizersButton.click();
    return new ProductsPage(this.page);
  }

  async buySunscreens(): Promise<ProductsPage> {
    await this.buySunscreensButton.click();
    return new ProductsPage(this.page);
  }

  async shopForWeatherAppropriateProduct(): Promise<ProductsPage> {
    const temperature = await this.getTemperatureValue();
    const productsPage = temperature < 19
      ? await this.buyMoisturizers()
      : await this.buySunscreens();

    await productsPage.assertLoadedForTemperature(temperature);
    return productsPage;
  }
}
