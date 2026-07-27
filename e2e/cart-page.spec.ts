import { test } from '../src/fixtures/pagesFixture';

test.describe('Cart Page', () => {

  test('should show the correct title and the added items',
    { tag: ['@regression'] },
    async ({ homePage, productsPage, cartPage }) => {
      await homePage.buyMoisturizers();
      await productsPage.assertLoaded('Moisturizers');

      const products = await productsPage.addCheapestProducts(['Aloe', 'Almond']);
      await productsPage.assertCartCount(products.length);

      await productsPage.goToCart();
      await cartPage.assertLoaded();
      await cartPage.assertItemInCart(products);
  });

});
