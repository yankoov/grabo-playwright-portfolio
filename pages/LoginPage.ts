import { Page, Locator } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly loginHeaderButton: Locator;
    readonly loginForm: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        
        // The main header link that reveals the login form (takes the first match to avoid strict mode issues)
        this.loginHeaderButton = page.getByRole('link', { name: 'Вход', exact: true }).first();
        
        // The form container itself
        this.loginForm = page.locator('form[name="hdrlf"]');
        
        // Targets the inputs precisely inside the form by their 'name' attribute
        this.emailInput = this.loginForm.locator('input[name="email"]');
        this.passwordInput = this.loginForm.locator('input[name="password"]');
        
        // The submit button inside the form
        this.submitButton = this.loginForm.getByRole('link', { name: 'Вход', exact: true });
        
        // Direct text locator discovered via Playwright Inspector debugging
        this.errorMessage = page.getByText('Въвели сте грешен e-mail', { exact: false });
    }

    async openLoginModal() {
        // Wait for the header button and click it to toggle the login form visibility
        await this.loginHeaderButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.loginHeaderButton.click();
        
        // Ensure the form is fully expanded and visible before interacting
        await this.loginForm.waitFor({ state: 'visible', timeout: 3000 });
    }

    async login(email: string, password: string) {
        // Wait for inputs, fill them and submit the form
        await this.emailInput.waitFor({ state: 'visible', timeout: 3000 });
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }
}