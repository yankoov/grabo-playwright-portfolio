import { Page, Locator } from '@playwright/test';

export class CartPage {
    readonly page: Page;
    readonly firstOfferCard: Locator;
    readonly mainBuyButton: Locator;
    readonly firstVariantOption: Locator;
    readonly successMessage: Locator;
    readonly cartHeaderBadge: Locator;

    constructor(page: Page) {
        this.page = page;

        this.firstOfferCard = page.locator('div.rdsgn_tdeal').first();
        this.mainBuyButton = page.locator('#nvp_buybtn');
        this.firstVariantOption = page.locator('#poptions .pricepack a').first();
        this.successMessage = page.locator('.alert-success, .cart-success, body').getByText(/добавен/i);
        this.cartHeaderBadge = page.locator('a.basket_ico, .basket_num, [class*="basket"]').getByText('1');
    }

    // waitUntil: 'commit' prevents timeouts from heavy background scripts in CI
    async navigateToCity(city: string) {
        await this.page.goto(`https://grabo.bg/${city}`, { waitUntil: 'commit' });
    }

    async selectFirstOffer() {
        const offerTitleLink = this.firstOfferCard.locator('a.tdeal_title');
        await offerTitleLink.waitFor({ state: 'visible', timeout: 5000 });
        await offerTitleLink.click();
    }

    async proceedToPurchase() {
        const currentUrl = this.page.url();

        await this.mainBuyButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.mainBuyButton.click();

        await this.page.waitForTimeout(1000);

        // URL unchanged means the offer requires variant selection before checkout
        if (this.page.url() === currentUrl) {
            console.log('Offer requires variant selection. Checking for options...');
            if (await this.firstVariantOption.isVisible()) {
                await this.firstVariantOption.click();
            }
        } else {
            console.log('Offer has no options. Redirected straight to checkout page.');
        }
    }
}