import { Page, Locator } from '@playwright/test';

/**
 * LoginPage class representing the authentication components and actions on Grabo.bg.
 * Implements the Page Object Model (POM) architectural pattern.
 */
export class LoginPage {
    readonly page: Page;
    readonly loginHeaderButton: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginSubmitButton: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        
        // Main header link that triggers the login dropdown modal
        this.loginHeaderButton = page.locator('.nhdr_user_nav a[href*="signin"]')
            .or(page.locator('text="Вход"'))
            .first();
        
        // Form input fields located inside the sign-in modal container
        this.emailInput = page.locator('#droplogin_signin input[name="email"]');
        this.passwordInput = page.locator('#droplogin_signin input[name="password"]');
        
        // The green submission button inside the dropdown form
        this.loginSubmitButton = page.locator('#droplogin_signin a.accountbtn');
        
        // Fix: Targets the exact standalone text on the redirect page that the debugger pointed out
        this.errorMessage = page.getByText('Въвели сте грешен e-mail');
    }

    /**
     * Clicks the header button to reveal the dynamic login dropdown form
     */
    async openLoginForm() {
        await this.loginHeaderButton.click();
        await this.emailInput.waitFor({ state: 'visible', timeout: 3000 });
    }

    /**
     * Fills out the authentication credentials and submits the login form
     */
    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginSubmitButton.click();
    }
}