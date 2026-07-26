import { test } from '../src/fixtures/homePageFixture';

test.describe.only('Home Page', () => {

  test('should load successfully',
    { tag: ['@smoke'] },
    async ({ homePage }) => {
      await homePage.assertLoaded();
      await homePage.assertTemperatureIsValid();
  });

  test('should shop for moisturizers when it is cold and sunscreens when it is hot',
    { tag: ['@smoke'] },
    async ({ homePage }) => {
      await homePage.shopForWeatherAppropriateProduct();
  });

});
