import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Grabo.bg - Authentication Tests', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        await page.goto('https://grabo.bg/', { waitUntil: 'domcontentloaded' });

        // Handle optional GDPR compliance pop-up
        try {
            const cookieButton = page.getByRole('button', { name: 'Получаване на съгласие' });
            await cookieButton.waitFor({ state: 'visible', timeout: 3000 });
            await cookieButton.click();
        } catch (e) {}

        // Handle optional regional location selection pop-up
        try {
            const locationCloseBtn = page.locator('text="Не, благодаря"').or(page.locator('.fancybox-close'));
            await locationCloseBtn.waitFor({ state: 'visible', timeout: 2000 });
            await locationCloseBtn.click();
        } catch (e) {}

        loginPage = new LoginPage(page);
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
        // Step 1: Input correct user testing credentials
        await loginPage.login('graboqa@gmail.com', 'Grabo123?');

        // Step 2: Assert successful login by verifying that the "Signout" / "Изход" action link is attached to the DOM
        const logoutLink = page.locator('a[href*="signout"]').first();
        await expect(logoutLink).toBeAttached({ timeout: 7000 });
    });
});