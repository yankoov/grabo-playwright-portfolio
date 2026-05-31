import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

test.describe('Grabo.bg - Authentication Tests', () => {
    let homePage: HomePage;
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        loginPage = new LoginPage(page);

        // Standard setup managed via centralized HomePage components (fixes copy-paste and empty catches)
        await homePage.navigate();
        await homePage.handleInitialPopups();

        // Trigger the login interface entrypoint
        await loginPage.openLoginForm();
    });

    test('should show error with invalid credentials (Negative Test)', async ({ page }) => {
        // Step 1: Input invalid credentials to trigger the redirect
        await loginPage.login('test_user_hq@grabo.bg', 'WrongPassword123!');

        // Step 2: Explicitly wait for the page redirection to complete successfully
        await page.waitForURL('**/user/signin', { timeout: 5000 });

        // Step 3: Assert that the error message specified by the debugger is visible on the new page
        await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('should login successfully with valid credentials (Positive Test)', async ({ page }) => {
        // Step 1: Input correct user testing credentials extracted securely from environment space
        await loginPage.login(
            process.env.GRABO_TEST_EMAIL!,
            process.env.GRABO_TEST_PASSWORD!
        );

        // Step 2: Assert successful login by verifying that the "Signout" / "Изход" action link is attached to the DOM
        const logoutLink = page.locator('a[href*="signout"]').first();
        await expect(logoutLink).toBeAttached({ timeout: 7000 });
    });
});