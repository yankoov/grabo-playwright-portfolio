import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { RegisterPage } from '../pages/RegisterPage';

test.describe('Grabo.bg - Registration Validation Tests', () => {
    let homePage: HomePage;
    let registerPage: RegisterPage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        registerPage = new RegisterPage(page);
        await homePage.navigate();
        await homePage.handleInitialPopups();
        await registerPage.openRegisterForm();
    });

    test('should redirect and show errors when trying to register with empty fields', async ({ page }) => {
        await registerPage.fillRegistrationForm('', '', '');
        await page.waitForURL('**/user/signup', { timeout: 5000 });
        await expect(registerPage.mainFullName).toBeVisible({ timeout: 5000 });
    });
});