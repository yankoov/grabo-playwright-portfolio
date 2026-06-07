import { Page, Locator } from '@playwright/test';

// Grabo.bg serves two different headers depending on User-Agent:
// - New header (Chromium): logo/search hidden behind icon click
// - Legacy header (Firefox/WebKit in CI): search input always visible
export class HomePage {
    readonly page: Page;
    readonly cookieButton: Locator;
    readonly locationCloseBtn: Locator;
    readonly logo: Locator;
    readonly searchIcon: Locator;
    readonly searchInput: Locator;
    readonly spaCategoryLink: Locator;

    constructor(page: Page) {
        this.page = page;

        this.cookieButton = page.getByRole('button', { name: 'Получаване на съгласие' });
        this.locationCloseBtn = page.locator('text="Не, благодаря"').or(page.locator('.fancybox-close'));

        // Works in both header layouts
        this.logo = page.locator('a[href*="grabo.bg/sofia"]').first();

        // Only exists in new header (Chromium); absent in legacy header
        this.searchIcon = page.locator('.nhdr_search_icon');
        this.searchInput = page.getByRole('textbox', { name: 'Търсене' });

        // Suggestion dropdown link — only appears in new header after typing
        this.spaCategoryLink = page.getByRole('link', { name: 'Масажи и spa' }).first();
    }

    async navigate() {
        await this.page.goto('https://grabo.bg/', { waitUntil: 'domcontentloaded' });
    }

    // Each popup is wrapped in try/catch — missing popup should never fail the test
    async handleInitialPopups() {
        try {
            await this.cookieButton.waitFor({ state: 'visible', timeout: 3000 });
            await this.cookieButton.click();
        } catch (e) {
            console.log('GDPR banner did not appear, moving on.');
        }

        try {
            await this.locationCloseBtn.waitFor({ state: 'visible', timeout: 2000 });
            await this.locationCloseBtn.click();
        } catch (e) {
            console.log('Location pop-up did not appear, moving on.');
        }
    }

    async searchForSpa(query: string) {
        // New header requires clicking the icon first to reveal the input
        if (await this.searchIcon.isVisible()) {
            await this.searchIcon.click();
        }

        await this.searchInput.waitFor({ state: 'visible', timeout: 5000 });
        await this.searchInput.fill(query);

        // Legacy header never shows the suggestion dropdown — navigate directly instead
        const dropdownVisible = await this.spaCategoryLink
            .waitFor({ state: 'visible', timeout: 3000 })
            .then(() => true)
            .catch(() => false);

        if (dropdownVisible) {
            // force: true bypasses the black overlay div that intercepts pointer events
            await this.spaCategoryLink.click({ force: true });
        } else {
            await this.page.goto('https://grabo.bg/sofia/masaji-i-relaks');
        }
    }
}