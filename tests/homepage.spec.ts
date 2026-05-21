import { test, expect } from '@playwright/test';

test.describe('Grabo.bg - Homepage Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Using 'commit' strategy to bypass Cloudflare network blocks in CI environments
        await page.goto('https://grabo.bg/', { waitUntil: 'commit' });

        // Handle the GDPR cookie consent banner if it appears
        const cookieButton = page.getByRole('button', { name: 'Получаване на съгласие' });
        if (await cookieButton.isVisible()) {
            await cookieButton.click();
        }
    });

    test('should load homepage and verify main elements', async ({ page }) => {
        await expect(page).toHaveTitle(/Grabo.bg/);

        const logo = page.getByRole('img', { name: 'Grabo.bg' });
        await expect(logo).toBeVisible();
    });
});