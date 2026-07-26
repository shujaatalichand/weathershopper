import { Page, Locator, expect } from '@playwright/test';
import { CartPage } from './CartPage';

type Product = {
  name: string;
  price: number;
  addButton: Locator;
};

export class ProductsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly productCards: Locator;
  readonly cartButton: Locator;
  readonly nameSelector: string;
  readonly priceSelector: string;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 2 });
    this.productCards = page.locator('.text-center.col-4');
    this.cartButton = page.locator('button[onclick="goToCart()"]');
    this.nameSelector = 'p.font-weight-bold';
    this.priceSelector = 'p';
  }

  async assertLoaded(category: 'Moisturizers' | 'Sunscreens') {
    await expect(this.heading).toHaveText(category);
  }

  async assertLoadedForTemperature(temperature: number) {
    const category = temperature < 19 ? 'Moisturizers' : 'Sunscreens';
    await this.assertLoaded(category);
  }

  async getProducts(): Promise<Product[]> {
    const count = await this.productCards.count();
    const products: Product[] = [];

    for (let i = 0; i < count; i++) {
      const card = this.productCards.nth(i);
      const name = await card.locator(this.nameSelector).innerText();
      const priceText = await card.locator(this.priceSelector).nth(1).innerText();
      products.push({
        name,
        price: parseInt(priceText.replace(/\D/g, ''), 10),
        addButton: card.getByRole('button', { name: 'Add' }),
      });
    }

    return products;
  }

  async addCheapestProductContaining(keyword: string): Promise<Product> {
    const products = await this.getProducts();
    const matches = products.filter((product) => product.name.toLowerCase().includes(keyword.toLowerCase()));
    const cheapest = matches.reduce((min, product) => (product.price < min.price ? product : min));
    await this.page.waitForFunction(() => typeof (window as any).addToCart === 'function');
    await cheapest.addButton.click();
    return cheapest;
  }

  async goToCart(): Promise<CartPage> {
    await Promise.all([
      this.page.waitForURL('**/cart'),
      this.cartButton.click(),
    ]);
    return new CartPage(this.page);
  }
}
