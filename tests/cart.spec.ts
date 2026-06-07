import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { CartPage } from '../pages/CartPage';

test.describe('Grabo.bg - Cart and Checkout E2E Tests', () => {
    let homePage: HomePage;
    let cartPage: CartPage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        cartPage = new CartPage(page);
        await cartPage.navigateToCity('sofia');
        await homePage.handleInitialPopups();
    });

    test('should add first offer to cart and verify success page details', async ({ page }) => {
        await cartPage.selectFirstOffer();
        await cartPage.proceedToPurchase();
        await expect(page).toHaveURL(/.*\/cart\/added:ok.*/, { timeout: 7000 });
        await cartPage.successMessage.waitFor({ state: 'visible', timeout: 5000 });
        await expect(cartPage.successMessage).toBeVisible();
    });
});