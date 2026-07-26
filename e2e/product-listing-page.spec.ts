import { test } from '../src/fixtures/homePageFixture';

test.describe('Product Listing Page', () => {

  test('should add the cheapest Aloe and Almond moisturizers to the cart',
    { tag: ['@regression'] },
    async ({ homePage }) => {
      const productsPage = await homePage.buyMoisturizers();
      await productsPage.assertLoaded('Moisturizers');

      await productsPage.addCheapestProductContaining('Aloe');
      await productsPage.addCheapestProductContaining('Almond');

      const cartPage = await productsPage.goToCart();
      await cartPage.assertLoaded();
  });

});
