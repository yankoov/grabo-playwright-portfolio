import { test, expect } from '@playwright/test';

test.describe('Grabo.bg - Homepage Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Navigate to the homepage and wait for the DOM structure
        await page.goto('https://grabo.bg/', { waitUntil: 'domcontentloaded' });

        // 1. Handle the GDPR cookie consent banner (Force wait via try-catch)
        try {
            const cookieButton = page.getByRole('button', { name: 'Получаване на съгласие' })
                
            
            // We strictly wait up to 4 seconds for it to attach and become visible
            await cookieButton.waitFor({ state: 'visible', timeout: 4000 });
            await cookieButton.click();
        } catch (e) {
            console.log('GDPR banner did not appear, moving on.');
        }

        // 2. Handle the Location Pop-up (Force wait via try-catch)
        try {
            const locationCloseBtn = page.locator('text="Не, благодаря"').or(page.locator('.fancybox-close'));
            
            await locationCloseBtn.waitFor({ state: 'visible', timeout: 3000 });
            await locationCloseBtn.click();
        } catch (e) {
            console.log('Location pop-up did not appear, moving on.');
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
        
        // Wait for the icon to be fully ready before clicking
        await searchIcon.waitFor({ state: 'visible', timeout: 4000 });
        await searchIcon.click();

        // 2. Interact with the revealed search input field
        const searchInput = page.locator('#searchhdr_input');
        await expect(searchInput).toBeVisible();
        await searchInput.fill('СПА');

        // 3. Select the target category from the dynamic live search suggestions dropdown
        const spaCategoryLink = page.locator('.searchhdr_relax');
        await expect(spaCategoryLink).toBeVisible();
        await spaCategoryLink.click();

        // 4. Verify successful redirection to the targeted SEO-friendly category URL
        await expect(page).toHaveURL(/.*masaji-i-relaks.*/);
    });

});