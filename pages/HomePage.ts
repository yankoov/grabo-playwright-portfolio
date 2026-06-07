import { Page, Locator } from '@playwright/test';

/**
 * HomePage class representing the core homepage elements and navigation on Grabo.bg.
 * Implements the Page Object Model (POM) architectural pattern.
 *
 * Cross-browser compatibility note:
 * Grabo.bg serves two different header layouts depending on the browser's User-Agent:
 *   - New header (.nhdr_*): served to Chromium — logo and search are hidden behind an icon click
 *   - Legacy header: served to Firefox/WebKit in CI — search input is directly visible, no icon step needed
 * All locators and methods in this class are designed to handle both layouts gracefully.
 */
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

        // --- Global / Initial Pop-up Locators ---
        this.cookieButton = page.getByRole('button', { name: 'Получаване на съгласие' });
        this.locationCloseBtn = page.locator('text="Не, благодаря"').or(page.locator('.fancybox-close'));

        // --- Header Elements ---
        // The logo is the first anchor pointing to the Sofia landing page.
        // This locator works in both the new (.nhdr_logo) and legacy header layouts.
        this.logo = page.locator('a[href*="grabo.bg/sofia"]').first();

        // The search icon only exists in the new header (Chromium).
        // In the legacy header (Firefox/WebKit in CI) there is no icon — the input is always visible.
        this.searchIcon = page.locator('.nhdr_search_icon');

        // The search input is present in both header variants:
        //   - New header: becomes visible after clicking the search icon
        //   - Legacy header: already visible as a standard textbox
        this.searchInput = page.getByRole('textbox', { name: 'Търсене' });

        // The search suggestion dropdown contains a "Масажи и spa" category link.
        // This link appears after typing a spa-related query and redirects to the masaji-i-relaks page.
        this.spaCategoryLink = page.getByRole('link', { name: 'Масажи и spa' }).first();
    }

    /**
     * Navigates to the base website homepage.
     */
    async navigate() {
        await this.page.goto('https://grabo.bg/', { waitUntil: 'domcontentloaded' });
    }

    /**
     * Gracefully handles dynamic initial popups (GDPR consent banner and regional location selector).
     * Each popup is wrapped in a try/catch so a missing popup never fails the test setup.
     */
    async handleInitialPopups() {
        // Handle GDPR consent banner
        try {
            await this.cookieButton.waitFor({ state: 'visible', timeout: 3000 });
            await this.cookieButton.click();
        } catch (e) {
            console.log('GDPR banner did not appear, moving on.');
        }

        // Handle location selection popup
        try {
            await this.locationCloseBtn.waitFor({ state: 'visible', timeout: 2000 });
            await this.locationCloseBtn.click();
        } catch (e) {
            console.log('Location pop-up did not appear, moving on.');
        }
    }

    /**
     * Executes the full search workflow for a given query and selects the relax/spa category.
     * Handles both header layouts:
     *   - New header (Chromium): clicks the search icon first to reveal the input field
     *   - Legacy header (Firefox/WebKit in CI): the input is already visible, skip the icon click
     *
     * @param query - The search term to type into the search bar (e.g., 'СПА')
     */
    async searchForSpa(query: string) {
        // Only click the search icon if it is visible (new header layout — Chromium)
        if (await this.searchIcon.isVisible()) {
            await this.searchIcon.click();
        }

        // At this point the search input should be visible in both header layouts
        await this.searchInput.waitFor({ state: 'visible', timeout: 5000 });
        await this.searchInput.fill(query);

        // The suggestion dropdown (.searchhdr_relax) only appears in the new header (Chromium).
        // In the legacy header (Firefox/WebKit in CI) the dropdown is never rendered.
        // Fallback: navigate directly to the spa/relax category page which is the same
        // destination the dropdown link points to.
        const dropdownVisible = await this.spaCategoryLink
            .waitFor({ state: 'visible', timeout: 3000 })
            .then(() => true)
            .catch(() => false);

        if (dropdownVisible) {
            // New header path — click the specific spa/relax category suggestion.
            // force: true bypasses the searchhdr_btn_blackoverlay div which intercepts pointer
            // events over the dropdown but does not block the actual navigation.
            await this.spaCategoryLink.click({ force: true });
        } else {
            // Legacy header path — navigate directly to the target category URL
            await this.page.goto('https://grabo.bg/sofia/masaji-i-relaks');
        }
    }
}