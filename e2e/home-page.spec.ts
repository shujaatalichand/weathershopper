import { test } from '../src/fixtures/pagesFixture';

test.describe('Home Page', () => {

  test('should load successfully',
    { tag: ['@smoke', '@regression'] },
    async ({ homePage }) => {
      await homePage.assertLoaded();
      await homePage.assertTemperatureIsValid();
  });

  test('should shop for moisturizers when it is cold and sunscreens when it is hot, and complete checkout',
    { tag: ['@smoke', '@regression'] },
    async ({ homePage, productsPage, cartPage, confirmationPage }) => {
      const temperature = await homePage.shopForWeatherAppropriateProduct();
      await productsPage.assertLoadedForTemperature(temperature);

      const products = await productsPage.addCheapestProductsForCategory();

      await productsPage.goToCart();
      await cartPage.assertLoaded();
      await cartPage.assertItemInCart(products);

      await cartPage.payWithCard();
      await confirmationPage.assertPaymentSuccess();
  });

});
