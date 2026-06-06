import { Page, Locator } from '@playwright/test';

/**
 * LoginPage class encapsulating all login-related elements and actions on Grabo.bg.
 * Implements the Page Object Model (POM) architectural pattern.
 *
 * Cross-browser compatibility note:
 * Grabo.bg serves two different login experiences depending on the browser's User-Agent:
 *   - Header dropdown form (new header / Chromium): clicking "Вход" in the nav reveals an inline form
 *   - Standalone login page (legacy header / Firefox & WebKit in CI): clicking "Вход" navigates
 *     to /user/signin and renders a full-page login form inside a table layout
 * The openLoginModal() and login() methods detect the active context and handle both cases.
 */
export class LoginPage {
    readonly page: Page;
    readonly loginHeaderButton: Locator;

    // --- Header Dropdown Form Locators (new header / Chromium) ---
    readonly loginForm: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;

    // --- Standalone Page Form Locators (legacy header / Firefox & WebKit in CI) ---
    readonly standaloneEmailInput: Locator;
    readonly standalonePasswordInput: Locator;
    readonly standaloneSubmitButton: Locator;

    // --- Shared ---
    readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        // The "Вход" navigation link present in both header layouts.
        // .first() avoids a Strict Mode Violation since the same link text may appear
        // multiple times (e.g. inside the open dropdown as well).
        this.loginHeaderButton = page.getByRole('link', { name: 'Вход', exact: true }).first();

        // Header dropdown form — only present and visible in the new header (Chromium)
        this.loginForm = page.locator('form[name="hdrlf"]');
        this.emailInput = this.loginForm.locator('input[name="email"]');
        this.passwordInput = this.loginForm.locator('input[name="password"]');
        this.submitButton = this.loginForm.getByRole('link', { name: 'Вход', exact: true });

        // Standalone login page form — rendered inside a table on /user/signin
        // Identified via accessible row labels to avoid fragile index-based selectors
        this.standaloneEmailInput = page.getByRole('row', { name: 'E-mail:' }).getByRole('textbox');
        this.standalonePasswordInput = page.getByRole('row', { name: 'Парола:' }).getByRole('textbox');
        this.standaloneSubmitButton = page.getByRole('row', { name: /Вход/ }).getByRole('link', { name: 'Вход' });

        // Error message text appears in both contexts after a failed login attempt.
        // The .or() union covers slight wording differences between the two layouts.
        this.errorMessage = page.getByText('Въвели сте грешен e-mail', { exact: false })
            .or(page.getByText('Грешен e-mail', { exact: false }));
    }

    /**
     * Clicks the "Вход" navigation link and waits for the login UI to become ready.
     * Handles two possible outcomes:
     *   1. The header dropdown form slides into view (new header / Chromium)
     *   2. The browser navigates to the standalone /user/signin page (legacy header / Firefox & WebKit)
     */
    async openLoginModal() {
        await this.loginHeaderButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.loginHeaderButton.click();

        // Race between the two possible outcomes — whichever resolves first wins.
        // Promise.race() is used instead of a sequential wait to avoid unnecessary timeouts.
        await Promise.race([
            this.loginForm.waitFor({ state: 'visible', timeout: 5000 }),
            this.page.waitForURL('**/user/signin', { timeout: 5000 }),
        ]);
    }

    /**
     * Fills in the credentials and submits the login form.
     * Automatically detects whether the active context is the header dropdown
     * or the standalone page and uses the appropriate locators.
     *
     * @param email    - The email address to enter
     * @param password - The password to enter
     */
    async login(email: string, password: string) {
        const isStandalonePage = this.page.url().includes('/user/signin');

        if (isStandalonePage) {
            // Standalone page context — inputs are in a table, always visible
            await this.standaloneEmailInput.fill(email);
            await this.standalonePasswordInput.fill(password);
            await this.standaloneSubmitButton.click();
        } else {
            // Header dropdown context — inputs are inside the inline form
            await this.emailInput.waitFor({ state: 'visible', timeout: 3000 });
            await this.emailInput.fill(email);
            await this.passwordInput.fill(password);
            await this.submitButton.click();
        }
    }
}