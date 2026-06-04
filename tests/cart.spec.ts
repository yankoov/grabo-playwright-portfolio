import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { CartPage } from '../pages/CartPage';

test.describe('Grabo.bg - Cart and Checkout E2E Tests', () => {
    let homePage: HomePage;
    let cartPage: CartPage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        cartPage = new CartPage(page);
        
        // Navigate directly to Sofia landing page and handle initial blockages
        await cartPage.navigateToCity('sofia');
        await homePage.handleInitialPopups();
    });

    test('should add first offer to cart and verify success page details', async ({ page }) => {
        // 1. Click on the first offer card title to open its detail page
        await cartPage.selectFirstOffer();
        
        // 2. Click the purchase button and handle dynamic option picking if present
        await cartPage.proceedToPurchase();
        
        // 3. Verify the URL matches Grabo's successful cart state
        await expect(page).toHaveURL(/.*\/cart\/added:ok.*/, { timeout: 7000 });
        
        // 4. Wait for the success element to attach to the DOM and check visibility
        await cartPage.successMessage.waitFor({ state: 'visible', timeout: 5000 });
        await expect(cartPage.successMessage).toBeVisible();
    });
});