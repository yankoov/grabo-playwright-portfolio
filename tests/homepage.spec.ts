import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Grabo.bg - Homepage Smoke Tests', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        await homePage.navigate();
        await homePage.handleInitialPopups();
    });

    test('should load homepage and verify main elements', async ({ page }) => {
        await expect(page).toHaveTitle(/Grabo.bg/);

        // Logo is an empty <a> with a CSS background-image — toHaveAttribute is cross-browser safe here
        await expect(homePage.logo).toHaveAttribute('href', /grabo\.bg\/sofia/);
    });

    test('should search for offers using the search bar', async ({ page }) => {
        await homePage.searchForSpa('СПА');
        await expect(page).toHaveURL(/.*masaji-i-relaks.*/);
    });
});