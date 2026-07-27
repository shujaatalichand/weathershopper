import { Page, Locator, FrameLocator, expect } from '@playwright/test';
import { ConfirmationPage } from './ConfirmationPage';
import { loadTestData } from '../../utils/testData';

type CardDetails = {
  email?: string;
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
  zip?: string;
};

export class CartPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly total: Locator;
  readonly body: Locator;
  readonly payButton: Locator;
  readonly stripeFrame: FrameLocator;
  readonly paymentFailedText: Locator;
  readonly emailInput: Locator;
  readonly cardNumberInput: Locator;
  readonly expiryInput: Locator;
  readonly cvcInput: Locator;
  readonly zipInput: Locator;
  readonly stripeSubmitButton: Locator;
  private readonly maxPaymentAttempts = 3;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Checkout' });
    this.total = page.locator('#total');
    this.body = page.locator('body');
    this.payButton = page.getByRole('button', { name: 'Pay with Card' });
    this.stripeFrame = page.frameLocator('iframe[name="stripe_checkout_app"]');
    this.paymentFailedText = page.getByText('PAYMENT FAILED');
    this.emailInput = this.stripeFrame.locator('#email');
    this.cardNumberInput = this.stripeFrame.locator('#card_number');
    this.expiryInput = this.stripeFrame.locator('#cc-exp');
    this.cvcInput = this.stripeFrame.locator('#cc-csc');
    this.zipInput = this.stripeFrame.locator('#billing-zip');
    this.stripeSubmitButton = this.stripeFrame.getByRole('button', { name: /Pay/ });
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

  async payWithCard(details: CardDetails = {}): Promise<ConfirmationPage> {
    const defaultCard: Required<CardDetails> = loadTestData('card.json');
    const {
      email = defaultCard.email,
      cardNumber = defaultCard.cardNumber,
      expiry = defaultCard.expiry,
      cvc = defaultCard.cvc,
      zip = defaultCard.zip,
    } = details;

    for (let attempt = 1; attempt <= this.maxPaymentAttempts; attempt++) {
      await this.payButton.click();
      await this.emailInput.fill(email);
      await this.cardNumberInput.fill(cardNumber);
      await this.expiryInput.fill(expiry);
      await this.cvcInput.fill(cvc);
      await this.zipInput.evaluate((el: HTMLInputElement, value: string) => {
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, zip);

      await Promise.all([
        this.page.waitForURL('**/confirmation'),
        this.stripeSubmitButton.click(),
      ]);

      const paymentFailed = await this.paymentFailedText.isVisible();
      if (!paymentFailed) {
        break;
      }

      if (attempt < this.maxPaymentAttempts) {
        await this.page.goBack({ waitUntil: 'load' });
      }
    }

    return new ConfirmationPage(this.page);
  }
}
