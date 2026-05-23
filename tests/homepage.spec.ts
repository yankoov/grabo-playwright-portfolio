import { test, expect } from '@playwright/test';

test.describe('Grabo.bg - Homepage Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Navigate to the homepage
        await page.goto('https://grabo.bg/');

        // 1. Handle the GDPR cookie consent banner if it appears (2-second limit to keep tests fast)
        const cookieButton = page.getByRole('button', { name: 'Получаване на съгласие' })
            .or(page.getByRole('button', { name: 'Получаване на съгласиве' }));
        
        if (await cookieButton.isVisible({ timeout: 2000 })) {
            await cookieButton.click();
        }

        // 2. Handle the Location Pop-up if it is visible
        const locationCloseBtn = page.locator('text="Не, благодаря"').or(page.locator('.fancybox-close'));
        if (await locationCloseBtn.isVisible({ timeout: 2000 })) {
            await locationCloseBtn.click();
        }
    });

    test('should load homepage and verify main elements', async ({ page }) => {
        await expect(page).toHaveTitle(/Grabo.bg/);

        // Verify that the main website logo is visible
        const logo = page.locator('.nhdr_logo');
        await expect(logo).toBeVisible();
    });

    test('should search for offers using the search bar', async ({ page }) => {
        // 1. Click on the search icon to expand/reveal the text input field
        const searchIcon = page.locator('.nhdr_search_icon, .nhdr_search_btn, [class*="search"] button, button[class*="search"]')
            .or(page.locator('header').getByRole('button').filter({ has: page.locator('[class*="search"], [class*="magnif"]') }));
        
        if (await searchIcon.isVisible({ timeout: 2000 })) {
            await searchIcon.click();
        }

        // 2. Interact with the revealed search input field
        const searchInput = page.locator('#searchhdr_input');
        await expect(searchInput).toBeVisible();
        await searchInput.fill('СПА');

        // 3. Select the target category from the dynamic live search suggestions dropdown
        // Using the unique class '.searchhdr_relax' to guarantee a single match and prevent debug mode errors
        const spaCategoryLink = page.locator('.searchhdr_relax');
        await expect(spaCategoryLink).toBeVisible();
        await spaCategoryLink.click();

        // 4. Verify successful redirection to the targeted SEO-friendly category URL
        await expect(page).toHaveURL(/.*masaji-i-relaks.*/);
    });

});