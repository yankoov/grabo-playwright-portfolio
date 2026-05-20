import { test, expect } from '@playwright/test';

test.describe('Grabo.bg - Homepage Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Отваряме сайта (с леката стратегия за изчакване)
        await page.goto('https://grabo.bg/', { waitUntil: 'commit' });

        // Хващаме бутона за съгласие по неговия текст
        const cookieButton = page.getByRole('button', { name: 'Получаване на съгласие' });
        
        // Ако банерът се появи, кликваме го, за да се махне от екрана
        if (await cookieButton.isVisible()) {
            await cookieButton.click();
        }
    });

    test('should load homepage and verify main elements', async ({ page }) => {
        // Уверяваме се, че заглавието е вярно
        await expect(page).toHaveTitle(/Grabo.bg/);

        // Проверяваме дали главното лого е видимо
        const logo = page.getByRole('img', { name: 'Grabo.bg' });
        await expect(logo).toBeVisible();
    });
});