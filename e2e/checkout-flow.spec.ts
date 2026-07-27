import { test } from '../src/fixtures/homePageFixture';

test.describe('Checkout Flow', () => {

  test('should add the cheapest Aloe and Almond moisturizers to the cart and complete checkout',
    { tag: ['@regression'] },
    async ({ homePage }) => {
      const productsPage = await homePage.buyMoisturizers();
      await productsPage.assertLoaded('Moisturizers');

      const products = await productsPage.addCheapestProducts(['Aloe', 'Almond']);

      const cartPage = await productsPage.goToCart();
      await cartPage.assertLoaded();
      await cartPage.assertItemInCart(products);

      const confirmationPage = await cartPage.payWithCard();
      await confirmationPage.assertPaymentSuccess();
  });

  test('should add the cheapest SPF-50 and SPF-30 sunscreens to the cart and complete checkout',
    { tag: ['@regression'] },
    async ({ homePage }) => {
      const productsPage = await homePage.buySunscreens();
      await productsPage.assertLoaded('Sunscreens');

      const products = await productsPage.addCheapestProducts(['SPF-50', 'SPF-30']);

      const cartPage = await productsPage.goToCart();
      await cartPage.assertLoaded();
      await cartPage.assertItemInCart(products);

      const confirmationPage = await cartPage.payWithCard();
      await confirmationPage.assertPaymentSuccess();
  });

});
