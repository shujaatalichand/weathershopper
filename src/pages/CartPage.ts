import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly total: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Checkout' });
    this.total = page.locator('#total');
  }

  async assertLoaded() {
    await expect(this.page).toHaveTitle('Cart Items');
    await expect(this.heading).toBeVisible();
  }

  async assertContainsItem(name: string) {
    await expect(this.page.getByRole('cell', { name, exact: true })).toBeVisible();
  }
}
