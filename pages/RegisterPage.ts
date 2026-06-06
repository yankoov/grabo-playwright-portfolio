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

        // Use the built-in getByRole locator for maximum stability when identifying the navigation link
        this.registerHeaderButton = page.getByRole('link', { name: 'Регистрация', exact: true });

        // Define the parent container of the header dropdown form
        const headerForm = page.locator('form[name="hdrrf"]');
        // Define the hidden dropdown container to isolate it from fallback page searches
        const dropDownMenu = page.locator('#droplogin_signup');
        
        // Group 1: Strictly isolated elements inside the header dropdown micro-form
        this.headerFullName = headerForm.locator('input[name="fullname"]');
        this.headerEmail = headerForm.locator('input[name="email"]');
        this.headerPassword = headerForm.locator('input[name="password"]');
        this.headerConfirmPassword = headerForm.locator('input[name="password2"]');
        this.headerSubmitButton = headerForm.locator('a.accountbtn b');

        // Group 2: Isolated elements for the standalone full registration page
        // Use a user-facing semantic role locator for the name input to maximize test robustness
        this.mainFullName = page.getByRole('row', { name: 'Име и фамилия:' }).getByRole('textbox');
        
        // Filter input elements to exclude header form, dropdown menu, and newsletter popups
        this.mainEmail = page.locator('input[name="email"]')
            .filter({ hasNot: headerForm })
            .filter({ hasNot: dropDownMenu })
            .filter({ hasNot: page.locator('#yd_input') }); // Prevents subscription inputs intercepting the test
            
        this.mainPassword = page.locator('input[name="password"]')
            .filter({ hasNot: headerForm })
            .filter({ hasNot: dropDownMenu });
            
        this.mainConfirmPassword = page.locator('input[name="password2"]')
            .filter({ hasNot: headerForm })
            .filter({ hasNot: dropDownMenu });
            
        // Select the primary action button on the standalone page, prioritizing visible buttons
        this.mainSubmitButton = page.locator('a.accountbtn b, input[type="submit"]')
            .filter({ hasNot: headerForm })
            .filter({ hasNot: dropDownMenu })
            .first();
    }

    /**
     * Toggles the navigation header link to display the initial dropdown registration form
     */
    async openRegisterForm() {
        // Ensure the registration button is attached and visible in the viewport
        await this.registerHeaderButton.waitFor({ state: 'visible', timeout: 5000 });
        
        // Apply force click to prevent potential transparent modal overlays from blocking the action
        await this.registerHeaderButton.click({ force: true });
        
        // Wait for the dropdown macro-form transition to complete and display fields
        await this.headerFullName.waitFor({ state: 'visible', timeout: 5000 });
    }

    /**
     * Smart method that automatically detects whether the test is currently interacting 
     * with the header micro-form or the fallback standalone full page form.
     */
    async fillRegistrationForm(name: string = '', email: string = '', pass: string = '') {
        // Dynamically check if the header dropdown context is active
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