import { test, expect } from '@playwright/test';

test.describe('Grabo.bg - Homepage Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Преди всеки тест, отваряме началната страница на Grabo
        await page.goto('https://grabo.bg/');
    });

    test('should load homepage and verify main elements', async ({ page }) => {
        // 1. Проверяваме дали заглавието на таба съдържа името на сайта
        await expect(page).toHaveTitle(/Grabo.bg/);

        // 2. Проверяваме дали главното лого е видимо на екрана
        const logo = page.getByRole('img', { name: 'Grabo.bg' });
        await expect(logo).toBeVisible();

        // 3. Проверяваме дали страницата се е заредила успешно
        await expect(page.locator('body')).toBeVisible();
    });
});