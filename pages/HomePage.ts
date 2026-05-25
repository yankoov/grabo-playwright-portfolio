import { Page, Locator } from '@playwright/test';

/**
 * HomePage class representing the core homepage elements and navigation on Grabo.bg.
 * Implements the Page Object Model (POM) architectural pattern.
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

        // Global/Initial Pop-up Locators
        this.cookieButton = page.getByRole('button', { name: 'Получаване на съгласие' });
        this.locationCloseBtn = page.locator('text="Не, благодаря"').or(page.locator('.fancybox-close'));

        // Header Elements
        this.logo = page.locator('.nhdr_logo');
        this.searchIcon = page.locator('.nhdr_search_icon');
        this.searchInput = page.locator('#searchhdr_input');
        
        // Suggestion Dropdown Elements
        this.spaCategoryLink = page.locator('.searchhdr_relax');
    }

    /**
     * Navigates to the base website homepage
     */
    async navigate() {
        await this.page.goto('https://grabo.bg/', { waitUntil: 'domcontentloaded' });
    }

    /**
     * Gracefully handles dynamic initial popups (GDPR and Regional Selection)
     */
    async handleInitialPopups() {
        // Handle GDPR banner
        try {
            await this.cookieButton.waitFor({ state: 'visible', timeout: 3000 });
            await this.cookieButton.click();
        } catch (e) {
            console.log('GDPR banner did not appear, moving on.');
        }

        // Handle Location selector
        try {
            await this.locationCloseBtn.waitFor({ state: 'visible', timeout: 2000 });
            await this.locationCloseBtn.click();
        } catch (e) {
            console.log('Location pop-up did not appear, moving on.');
        }
    }

    /**
     * Executes the search workflow for a specific term and selects the relax category
     * @param query - The text to type into the search bar (e.g., 'СПА')
     */
    async searchForSpa(query: string) {
        await this.searchIcon.waitFor({ state: 'visible', timeout: 3000 });
        await this.searchIcon.click();
        
        await this.searchInput.waitFor({ state: 'visible', timeout: 3000 });
        await this.searchInput.fill(query);
        
        await this.spaCategoryLink.waitFor({ state: 'visible', timeout: 3000 });
        await this.spaCategoryLink.click();
    }
}