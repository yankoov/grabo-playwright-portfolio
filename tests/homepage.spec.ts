import { test, expect } from '@playwright/test';

test.describe('Grabo.bg - Homepage Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Стандартно отваряне на сайта
        await page.goto('https://grabo.bg/');

        // Бързо затваряне на банера, ако се появи локално
        const cookieButton = page.getByRole('button', { name: 'Получаване на съгласие' });
        if (await cookieButton.isVisible()) {
            await cookieButton.click();
        }
    });

    test('should load homepage and verify main elements', async ({ page }) => {
        // Проверка на заглавието
        await expect(page).toHaveTitle(/Grabo.bg/);

        // Проверка на логото
        const logo = page.getByRole('img', { name: 'Grabo.bg' });
        await expect(logo).toBeVisible();
    });
});