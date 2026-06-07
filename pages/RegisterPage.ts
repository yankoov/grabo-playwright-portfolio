import { Page, Locator } from '@playwright/test';

// Grabo.bg serves two different registration flows depending on User-Agent:
// - New header (Chromium): inline dropdown micro-form (form[name="hdrrf"])
// - Legacy header (Firefox/WebKit in CI): navigates to standalone /user/signup page
export class RegisterPage {
    readonly page: Page;
    readonly registerHeaderButton: Locator;

    // New header (Chromium)
    readonly headerFullName: Locator;
    readonly headerEmail: Locator;
    readonly headerPassword: Locator;
    readonly headerConfirmPassword: Locator;
    readonly headerSubmitButton: Locator;

    // Legacy header — standalone /user/signup page
    readonly mainFullName: Locator;
    readonly mainEmail: Locator;
    readonly mainPassword: Locator;
    readonly mainConfirmPassword: Locator;
    readonly mainSubmitButton: Locator;

    constructor(page: Page) {
        this.page = page;

        this.registerHeaderButton = page.getByRole('link', { name: 'Регистрация', exact: true });

        const headerForm = page.locator('form[name="hdrrf"]');
        const signupDropdown = page.locator('#droplogin_signup');
        const signinDropdown = page.locator('#droplogin_signin');

        this.headerFullName = headerForm.locator('input[name="fullname"]');
        this.headerEmail = headerForm.locator('input[name="email"]');
        this.headerPassword = headerForm.locator('input[name="password"]');
        this.headerConfirmPassword = headerForm.locator('input[name="password2"]');
        this.headerSubmitButton = headerForm.locator('a.accountbtn b');

        this.mainFullName = page.getByRole('row', { name: 'Име и фамилия:' }).getByRole('textbox');

        // Multiple duplicate inputs exist in DOM on standalone page — filter all header/dropdown containers
        this.mainEmail = page.locator('input[name="email"]')
            .filter({ hasNot: headerForm })
            .filter({ hasNot: signupDropdown })
            .filter({ hasNot: signinDropdown })
            .filter({ hasNot: page.locator('#yd_input') });

        this.mainPassword = page.locator('input[name="password"]')
            .filter({ hasNot: headerForm })
            .filter({ hasNot: signupDropdown })
            .filter({ hasNot: signinDropdown });

        this.mainConfirmPassword = page.locator('input[name="password2"]')
            .filter({ hasNot: headerForm })
            .filter({ hasNot: signupDropdown })
            .filter({ hasNot: signinDropdown });

        this.mainSubmitButton = page.locator('a.accountbtn b, input[type="submit"]')
            .filter({ hasNot: headerForm })
            .filter({ hasNot: signupDropdown })
            .first();
    }

    async openRegisterForm() {
        await this.registerHeaderButton.waitFor({ state: 'visible', timeout: 5000 });
        // force: true bypasses any overlay that may intercept the click
        await this.registerHeaderButton.click({ force: true });

        // Race the two possible outcomes — dropdown form or URL navigation
        await Promise.race([
            this.headerFullName.waitFor({ state: 'visible', timeout: 5000 }),
            this.page.waitForURL('**/user/signup', { timeout: 5000 }),
        ]);
    }

    async fillRegistrationForm(name: string = '', email: string = '', pass: string = '') {
        if (await this.headerFullName.isVisible()) {
            await this.headerFullName.fill(name);
            await this.headerEmail.fill(email);
            await this.headerPassword.fill(pass);
            await this.headerConfirmPassword.fill(pass);
            await this.headerSubmitButton.click();
        } else {
            await this.mainFullName.fill(name);
            await this.mainEmail.fill(email);
            await this.mainPassword.fill(pass);
            await this.mainConfirmPassword.fill(pass);
            await this.mainSubmitButton.click();
        }
    }
}