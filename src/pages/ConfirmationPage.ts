import { Page, Locator, expect } from '@playwright/test';

export class ConfirmationPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly message: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('div.row.justify-content-center h2');
    this.message = page.locator('p.text-justify');
  }

  async assertPaymentSuccess() {
    await expect(this.page).toHaveTitle('Confirmation');
    await expect(this.heading).toHaveText('PAYMENT SUCCESS');
    await expect(this.message).toHaveText('Your payment was successful. You should receive a follow-up call from our sales team.');
  }
}
