import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

test.describe('Grabo.bg - Authentication Tests', () => {
    let homePage: HomePage;
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        loginPage = new LoginPage(page);
        
        // Navigate and clear blocking popups before running any login steps
        await homePage.navigate();
        await homePage.handleInitialPopups();
    });

    test('should show error with invalid credentials (Negative Test)', async () => {
        await loginPage.openLoginModal();
        await loginPage.login('invalid_email@test.com', 'wrongpassword123');

        // Verify that the validation error text becomes visible on the screen
        await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
    });
});