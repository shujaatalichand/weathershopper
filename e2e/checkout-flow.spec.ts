import { test } from '../src/fixtures/pagesFixture';

test.describe('Checkout Flow', () => {

  test('should add the cheapest Aloe and Almond moisturizers to the cart and complete checkout',
    { tag: ['@regression'] },
    async ({ homePage, productsPage, cartPage, confirmationPage }) => {
      await homePage.buyMoisturizers();
      await productsPage.assertLoaded('Moisturizers');

      const products = await productsPage.addCheapestProducts(['Aloe', 'Almond']);

      await productsPage.goToCart();
      await cartPage.assertLoaded();
      await cartPage.assertItemInCart(products);

      await cartPage.payWithCard();
      await confirmationPage.assertPaymentSuccess();
  });

  test('should add the cheapest SPF-50 and SPF-30 sunscreens to the cart and complete checkout',
    { tag: ['@regression'] },
    async ({ homePage, productsPage, cartPage, confirmationPage }) => {
      await homePage.buySunscreens();
      await productsPage.assertLoaded('Sunscreens');

      const products = await productsPage.addCheapestProducts(['SPF-50', 'SPF-30']);

      await productsPage.goToCart();
      await cartPage.assertLoaded();
      await cartPage.assertItemInCart(products);

      await cartPage.payWithCard();
      await confirmationPage.assertPaymentSuccess();
  });

});
