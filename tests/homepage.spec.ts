import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Grabo.bg - Homepage Smoke Tests', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);

        // Navigate to the homepage and dismiss any blocking popups before each test
        await homePage.navigate();
        await homePage.handleInitialPopups();
    });

    test('should load homepage and verify main elements', async ({ page }) => {
        // Verify the page title loads correctly across all browsers
        await expect(page).toHaveTitle(/Grabo.bg/);

        // Verify the logo link exists and points to the correct URL.
        // The logo is rendered as a CSS background-image on an empty <a> tag — it has no
        // text content and no physical dimensions, so toBeVisible() is not appropriate here.
        // toHaveAttribute() confirms the element is present and correctly configured
        // without requiring rendered dimensions, making this assertion cross-browser safe.
        await expect(homePage.logo).toHaveAttribute('href', /grabo\.bg\/sofia/);
    });

    test('should search for offers using the search bar', async ({ page }) => {
        // Execute the encapsulated search workflow for SPA/relax deals
        await homePage.searchForSpa('СПА');

        // Assert successful redirection to the targeted SEO-friendly category URL
        await expect(page).toHaveURL(/.*masaji-i-relaks.*/);
    });
});