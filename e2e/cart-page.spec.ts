import { test } from '../src/fixtures/homePageFixture';

test.describe('Cart Page', () => {

  test('should show the correct title and the added items',
    { tag: ['@regression'] },
    async ({ homePage }) => {
      const productsPage = await homePage.buyMoisturizers();
      await productsPage.assertLoaded('Moisturizers');

      const products = await productsPage.addCheapestProducts(['Aloe', 'Almond']);
      await productsPage.assertCartCount(products.length);

      const cartPage = await productsPage.goToCart();
      await cartPage.assertLoaded();
      await cartPage.assertItemInCart(products);
  });

});
