import { Page, Locator } from '@playwright/test';

/**
 * RegisterPage class encapsulating all registration-related elements and actions on Grabo.bg.
 * Implements the Page Object Model (POM) architectural pattern.
 *
 * Cross-browser compatibility note:
 * Grabo.bg serves two different registration experiences depending on the browser's User-Agent:
 *   - Header dropdown micro-form (new header / Chromium): clicking "Регистрация" reveals a
 *     compact inline form (form[name="hdrrf"]) without leaving the current page
 *   - Standalone registration page (legacy header / Firefox & WebKit in CI): clicking
 *     "Регистрация" navigates directly to /user/signup and renders a full-page table form
 * The openRegisterForm() and fillRegistrationForm() methods detect the active context
 * and handle both cases transparently.
 */
export class RegisterPage {
    readonly page: Page;
    readonly registerHeaderButton: Locator;

    // --- Header Dropdown Micro-Form Locators (new header / Chromium) ---
    readonly headerFullName: Locator;
    readonly headerEmail: Locator;
    readonly headerPassword: Locator;
    readonly headerConfirmPassword: Locator;
    readonly headerSubmitButton: Locator;

    // --- Standalone Registration Page Locators (legacy header / Firefox & WebKit in CI) ---
    readonly mainFullName: Locator;
    readonly mainEmail: Locator;
    readonly mainPassword: Locator;
    readonly mainConfirmPassword: Locator;
    readonly mainSubmitButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Semantic role locator for the registration nav link — stable across both header layouts
        this.registerHeaderButton = page.getByRole('link', { name: 'Регистрация', exact: true });

        // Parent container references used as negative filters to prevent element collisions
        const headerForm = page.locator('form[name="hdrrf"]');
        const dropDownMenu = page.locator('#droplogin_signup');

        // --- Header dropdown form locators ---
        // Scoped directly to the form container to guarantee strict isolation
        this.headerFullName = headerForm.locator('input[name="fullname"]');
        this.headerEmail = headerForm.locator('input[name="email"]');
        this.headerPassword = headerForm.locator('input[name="password"]');
        this.headerConfirmPassword = headerForm.locator('input[name="password2"]');
        this.headerSubmitButton = headerForm.locator('a.accountbtn b');

        // --- Standalone registration page locators ---
        // Semantic row-based locator for the full name field — resilient to DOM structure changes
        this.mainFullName = page.getByRole('row', { name: 'Име и фамилия:' }).getByRole('textbox');

        // Filtered locators exclude the header form, dropdown menu, and newsletter subscription
        // inputs (#yd_input) to prevent Strict Mode Violations from duplicate name attributes
        this.mainEmail = page.locator('input[name="email"]')
            .filter({ hasNot: headerForm })
            .filter({ hasNot: dropDownMenu })
            .filter({ hasNot: page.locator('#yd_input') });

        this.mainPassword = page.locator('input[name="password"]')
            .filter({ hasNot: headerForm })
            .filter({ hasNot: dropDownMenu });

        this.mainConfirmPassword = page.locator('input[name="password2"]')
            .filter({ hasNot: headerForm })
            .filter({ hasNot: dropDownMenu });

        // Targets the primary submit button on the standalone page.
        // .first() picks the visible one when both selector variants are present simultaneously.
        this.mainSubmitButton = page.locator('a.accountbtn b, input[type="submit"]')
            .filter({ hasNot: headerForm })
            .filter({ hasNot: dropDownMenu })
            .first();
    }

    /**
     * Clicks the "Регистрация" navigation link and waits for the registration UI to become ready.
     * Handles two possible outcomes:
     *   1. The header dropdown micro-form slides into view (new header / Chromium)
     *   2. The browser navigates to the standalone /user/signup page (legacy header / Firefox & WebKit)
     * force: true is applied to prevent transparent modal overlays from intercepting the click.
     */
    async openRegisterForm() {
        await this.registerHeaderButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.registerHeaderButton.click({ force: true });

        // Race between the two possible outcomes — whichever resolves first wins.
        // Promise.race() avoids unnecessary timeout delays in either layout.
        await Promise.race([
            this.headerFullName.waitFor({ state: 'visible', timeout: 5000 }),
            this.page.waitForURL('**/user/signup', { timeout: 5000 }),
        ]);
    }

    /**
     * Fills in the registration form fields and submits.
     * Automatically detects whether the active context is the header dropdown micro-form
     * or the standalone full-page form, and uses the appropriate set of locators.
     *
     * @param name  - Full name to enter (defaults to empty string for validation tests)
     * @param email - Email address to enter
     * @param pass  - Password to enter (also used for the confirm password field)
     */
    async fillRegistrationForm(name: string = '', email: string = '', pass: string = '') {
        if (await this.headerFullName.isVisible()) {
            // Header dropdown context is active (new header / Chromium)
            await this.headerFullName.fill(name);
            await this.headerEmail.fill(email);
            await this.headerPassword.fill(pass);
            await this.headerConfirmPassword.fill(pass);
            await this.headerSubmitButton.click();
        } else {
            // Standalone page context is active (legacy header / Firefox & WebKit in CI)
            await this.mainFullName.fill(name);
            await this.mainEmail.fill(email);
            await this.mainPassword.fill(pass);
            await this.mainConfirmPassword.fill(pass);
            await this.mainSubmitButton.click();
        }
    }
}