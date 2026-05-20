import { test, expect } from '@playwright/test';

test.describe('Grabo.bg - Homepage Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Отваряме сайта с леката стратегия
        await page.goto('https://grabo.bg/', { waitUntil: 'commit' });

        // Хващаме бутона за бисквитки
        const cookieButton = page.getByRole('button', { name: 'Получаване на съгласие' });
        
        // Изчакваме до 5 секунди банерът да се появи (ако се появи изобщо)
        try {
            await cookieButton.waitFor({ state: 'visible', timeout: 5000 });
            await cookieButton.click();
        } catch (e) {
            console.log('Банерът за бисквитки не се появи или вече е затворен.');
        }

        // КЛЮЧЪТ: Изчакваме мрежата да се успокои (да няма активни заявки за над 500ms)
        // Това дава време на логото и структурата да се заредят напълно в GitHub
        await page.waitForLoadState('networkidle');
    });

    test('should load homepage and verify main elements', async ({ page }) => {
        // Проверяваме заглавието
        await expect(page).toHaveTitle(/Grabo.bg/);

        // Вече изчакахме 'networkidle', така че логото трябва да е тук
        const logo = page.getByRole('img', { name: 'Grabo.bg' });
        await expect(logo).toBeVisible();
    });
});