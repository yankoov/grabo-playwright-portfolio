import { Page, Locator } from '@playwright/test';

export class RegisterPage {
    readonly page: Page;
    readonly registerHeaderButton: Locator;
    
    // Locators strictly for the Header Dropdown Form (hdrrf)
    readonly headerFullName: Locator;
    readonly headerEmail: Locator;
    readonly headerPassword: Locator;
    readonly headerConfirmPassword: Locator;
    readonly headerSubmitButton: Locator;

    // Locators strictly for the Standalone Big Registration Page
    readonly mainFullName: Locator;
    readonly mainEmail: Locator;
    readonly mainPassword: Locator;
    readonly mainConfirmPassword: Locator;
    readonly mainSubmitButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Triggers the main registration dropdown menu from the header
        this.registerHeaderButton = page.locator('.navitem[href*="signup"]').or(page.locator('text="Регистрация"')).first();

        // Group 1: Strict scoping inside form[name="hdrrf"] to prevent hitting hidden layout elements
        this.headerFullName = page.locator('form[name="hdrrf"] input[name="fullname"]');
        this.headerEmail = page.locator('form[name="hdrrf"] input[name="email"]');
        this.headerPassword = page.locator('form[name="hdrrf"] input[name="password"]');
        this.headerConfirmPassword = page.locator('form[name="hdrrf"] input[name="password2"]');
        this.headerSubmitButton = page.locator('form[name="hdrrf"] a.accountbtn b');

        // Group 2: Scoping for the standalone page, explicitly excluding the header elements using proper CSS :not()
        this.mainFullName = page.locator('input[name="fullname"]:not(form[name="hdrrf"] input)');
        this.mainEmail = page.locator('input[name="email"]:not(form[name="hdrrf"] input):not(#yd_input)');
        this.mainPassword = page.locator('input[name="password"]:not(form[name="hdrrf"] input)');
        this.mainConfirmPassword = page.locator('input[name="password2"]:not(form[name="hdrrf"] input)');
        this.mainSubmitButton = page.locator('a.accountbtn b:not(form[name="hdrrf"] *), input[type="submit"]:not(form[name="hdrrf"] *)').first();
    }

    /**
     * Toggles the navigation header link to display the initial dropdown registration form
     */
    async openRegisterForm() {
        await this.registerHeaderButton.click();
        await this.headerFullName.waitFor({ state: 'visible', timeout: 3000 });
    }

    /**
     * Smart method that automatically detects whether the test is currently interacting 
     * with the header micro-form or the fallback standalone full page form.
     */
    async fillRegistrationForm(name: string, email: string, pass: string) {
        if (await this.headerFullName.isVisible()) {
            // Dropdown context active
            await this.headerFullName.fill(name);
            await this.headerEmail.fill(email);
            await this.headerPassword.fill(pass);
            await this.headerConfirmPassword.fill(pass);
            await this.headerSubmitButton.click();
        } else {
            // Standalone page context active
            await this.mainFullName.fill(name);
            await this.mainEmail.fill(email);
            await this.mainPassword.fill(pass);
            await this.mainConfirmPassword.fill(pass);
            await this.mainSubmitButton.click();
        }
    }
}