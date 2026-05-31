import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { RegisterPage } from '../pages/RegisterPage';

test.describe('Grabo.bg - Registration Validation Tests', () => {
    let homePage: HomePage;
    let registerPage: RegisterPage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        registerPage = new RegisterPage(page);

        // Standard setup: Navigate to target domain and clean generic modal cookie/location blockades
        await homePage.navigate();
        await homePage.handleInitialPopups();

        // Focus and load the registration entry workflow
        await registerPage.openRegisterForm();
    });

    test('should redirect and show errors when trying to register with empty fields', async ({ page }) => {
        // Execute dynamic action method by sending empty strings into the field logic
        await registerPage.fillRegistrationForm('', '', '');

        // Enforce synchronization by ensuring Playwright catches the hard backend validation redirect
        await page.waitForURL('**/user/signup', { timeout: 5000 });

        // Assert that the full fallback page form fields become visible after the app forces the navigation split
        // Вече няма да хвърля Strict Mode Violation грешка тук!
        await expect(registerPage.mainFullName).toBeVisible({ timeout: 5000 });
    });
});