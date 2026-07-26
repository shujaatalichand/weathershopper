import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly total: Locator;
  readonly body: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Checkout' });
    this.total = page.locator('#total');
    this.body = page.locator('body');
  }

  async assertLoaded() {
    await expect(this.page).toHaveTitle('Cart Items');
    await expect(this.heading).toBeVisible();
  }

  async assertContainsItem(name: string) {
    await expect(this.body).toContainText(name);
  }

  async assertItemInCart(products: { name: string; price: number }[]) {
    for (const product of products) {
      await expect(this.body).toContainText(product.name);
      await expect(this.body).toContainText(String(product.price));
    }
  }
}
