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

        // Използваме вградения getByRole локатор за максимална стабилност при намиране на бутона
        this.registerHeaderButton = page.getByRole('link', { name: 'Регистрация', exact: true });

        // Дефинираме родителския контейнер на хедър формата
        const headerForm = page.locator('form[name="hdrrf"]');
        // Дефинираме и скрития контейнер на падащото меню от лога за грешка, за да го изолираме
        const dropDownMenu = page.locator('#droplogin_signup');
        
        // Group 1: Строго изолирани елементи вътре в хедър формата
        this.headerFullName = headerForm.locator('input[name="fullname"]');
        this.headerEmail = headerForm.locator('input[name="email"]');
        this.headerPassword = headerForm.locator('input[name="password"]');
        this.headerConfirmPassword = headerForm.locator('input[name="password2"]');
        this.headerSubmitButton = headerForm.locator('a.accountbtn b');

        // Group 2: Изолирани елементи за голямата самостоятелна страница.
        // За името използваме силно специфичния user-facing локатор, препоръчан от Playwright грешката ви
        this.mainFullName = page.getByRole('row', { name: 'Име и фамилия:' }).getByRole('textbox');
        
        // За останалите полета прилагаме двойно филтриране (да не са в хедъра и да не са в падащото меню)
        this.mainEmail = page.locator('input[name="email"]')
            .filter({ hasNot: headerForm })
            .filter({ hasNot: dropDownMenu })
            .filter({ hasNot: page.locator('#yd_input') }); // Предпазва от абонаментни инпути, ако изскочат
            
        this.mainPassword = page.locator('input[name="password"]')
            .filter({ hasNot: headerForm })
            .filter({ hasNot: dropDownMenu });
            
        this.mainConfirmPassword = page.locator('input[name="password2"]')
            .filter({ hasNot: headerForm })
            .filter({ hasNot: dropDownMenu });
            
        // За бутона на голямата страница взимаме първия съвпадащ извън хедър структурите
        this.mainSubmitButton = page.locator('a.accountbtn b, input[type="submit"]')
            .filter({ hasNot: headerForm })
            .filter({ hasNot: dropDownMenu })
            .first();
    }

    /**
     * Toggles the navigation header link to display the initial dropdown registration form
     */
    async openRegisterForm() {
        // Уверяваме се, че бутонът е зареден и видим на екрана
        await this.registerHeaderButton.waitFor({ state: 'visible', timeout: 5000 });
        
        // Използваме force: true в случай, че някой полупрозрачен попъп/overlay блокира клика за милисекунди
        await this.registerHeaderButton.click({ force: true });
        
        // Изчакваме формата в хедъра да се отвори успешно
        await this.headerFullName.waitFor({ state: 'visible', timeout: 5000 });
    }

    /**
     * Smart method that automatically detects whether the test is currently interacting 
     * with the header micro-form or the fallback standalone full page form.
     */
    async fillRegistrationForm(name: string = '', email: string = '', pass: string = '') {
        // Динамична проверка дали в момента си взаимодействаме с падащото меню в хедъра
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