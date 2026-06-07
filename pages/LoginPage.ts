import { Page, Locator } from '@playwright/test';

// Grabo.bg serves two different login flows depending on User-Agent:
// - New header (Chromium): inline dropdown form (form[name="hdrlf"])
// - Legacy header (Firefox/WebKit in CI): navigates to standalone /user/signin page
export class LoginPage {
    readonly page: Page;
    readonly loginHeaderButton: Locator;

    // New header (Chromium)
    readonly loginForm: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;

    // Legacy header — standalone /user/signin page
    readonly standaloneEmailInput: Locator;
    readonly standalonePasswordInput: Locator;
    readonly standaloneSubmitButton: Locator;

    readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        // .first() avoids Strict Mode Violation — link text appears twice when dropdown is open
        this.loginHeaderButton = page.getByRole('link', { name: 'Вход', exact: true }).first();

        this.loginForm = page.locator('form[name="hdrlf"]');
        this.emailInput = this.loginForm.locator('input[name="email"]');
        this.passwordInput = this.loginForm.locator('input[name="password"]');
        this.submitButton = this.loginForm.getByRole('link', { name: 'Вход', exact: true });

        this.standaloneEmailInput = page.getByRole('row', { name: 'E-mail:' }).getByRole('textbox');
        this.standalonePasswordInput = page.getByRole('row', { name: 'Парола:' }).getByRole('textbox');
        this.standaloneSubmitButton = page.getByRole('row', { name: /Вход/ }).getByRole('link', { name: 'Вход' });

        // .or() covers slight wording differences between the two layouts
        this.errorMessage = page.getByText('Въвели сте грешен e-mail', { exact: false })
            .or(page.getByText('Грешен e-mail', { exact: false }));
    }

    async openLoginModal() {
        await this.loginHeaderButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.loginHeaderButton.click();

        // Race the two possible outcomes — dropdown form or URL navigation
        await Promise.race([
            this.loginForm.waitFor({ state: 'visible', timeout: 5000 }),
            this.page.waitForURL('**/user/signin', { timeout: 5000 }),
        ]);
    }

    async login(email: string, password: string) {
        const isStandalonePage = this.page.url().includes('/user/signin');

        if (isStandalonePage) {
            await this.standaloneEmailInput.fill(email);
            await this.standalonePasswordInput.fill(password);
            await this.standaloneSubmitButton.click();
        } else {
            await this.emailInput.waitFor({ state: 'visible', timeout: 3000 });
            await this.emailInput.fill(email);
            await this.passwordInput.fill(password);
            await this.submitButton.click();
        }
    }
}