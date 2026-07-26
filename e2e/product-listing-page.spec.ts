import { test } from '../src/fixtures/homePageFixture';

test.describe('Product Listing Page', () => {

  test('should add the cheapest Aloe and Almond moisturizers to the cart',
    { tag: ['@regression'] },
    async ({ homePage }) => {
      const productsPage = await homePage.buyMoisturizers();
      await productsPage.assertLoaded('Moisturizers');

      const aloeProduct = await productsPage.addCheapestProductContaining('Aloe');
      const almondProduct = await productsPage.addCheapestProductContaining('Almond');

      const cartPage = await productsPage.goToCart();
      await cartPage.assertLoaded();
      await cartPage.assertItemInCart(aloeProduct.name, aloeProduct.price);
      await cartPage.assertItemInCart(almondProduct.name, almondProduct.price);
  });

  test('should add the cheapest SPF-50 and SPF-30 sunscreens to the cart',
    { tag: ['@regression'] },
    async ({ homePage }) => {
      const productsPage = await homePage.buySunscreens();
      await productsPage.assertLoaded('Sunscreens');

      const spf50Product = await productsPage.addCheapestProductContaining('SPF-50');
      const spf30Product = await productsPage.addCheapestProductContaining('SPF-30');

      const cartPage = await productsPage.goToCart();
      await cartPage.assertLoaded();
      await cartPage.assertItemInCart(spf50Product.name, spf50Product.price);
      await cartPage.assertItemInCart(spf30Product.name, spf30Product.price);
  });

});
