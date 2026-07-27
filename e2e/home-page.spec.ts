import { test } from '../src/fixtures/homePageFixture';

test.describe('Home Page', () => {

  test('should load successfully',
    { tag: ['@smoke'] },
    async ({ homePage }) => {
      await homePage.assertLoaded();
      await homePage.assertTemperatureIsValid();
  });

  test('should shop for moisturizers when it is cold and sunscreens when it is hot, and complete checkout',
    { tag: ['@smoke'] },
    async ({ homePage }) => {
      const productsPage = await homePage.shopForWeatherAppropriateProduct();

      const products = await productsPage.addCheapestProductsForCategory();

      const cartPage = await productsPage.goToCart();
      await cartPage.assertLoaded();
      await cartPage.assertItemInCart(products);

      const confirmationPage = await cartPage.payWithCard();
      await confirmationPage.assertPaymentSuccess();
  });

});
