import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Grabo.bg - Homepage Smoke Tests', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        
        // Step 1: Navigate and clear obstacles seamlessly via POM methods
        await homePage.navigate();
        await homePage.handleInitialPopups();
    });

    test('should load homepage and verify main elements', async ({ page }) => {
        // Verify corporate branding title
        await expect(page).toHaveTitle(/Grabo.bg/);

        // Verify core identity logo component visibility
        await expect(homePage.logo).toBeVisible();
    });

    test('should search for offers using the search bar', async ({ page }) => {
        // Step 1: Execute encapsulated business logic for searching SPA deals
        await homePage.searchForSpa('СПА');

        // Step 2: Assert successful redirection to the targeted SEO-friendly category URL
        await expect(page).toHaveURL(/.*masaji-i-relaks.*/);
    });
});