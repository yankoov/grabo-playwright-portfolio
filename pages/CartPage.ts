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
        
        // Base container for any featured offer card on Grabo list pages
        this.firstOfferCard = page.locator('div.rdsgn_tdeal').first();
        
        // The main purchase button inside the individual offer page
        this.mainBuyButton = page.locator('#nvp_buybtn');
        
        // Targets the first available option link inside Grabo's dynamic variant selection container (#poptions)
        this.firstVariantOption = page.locator('#poptions .pricepack a').first();
        
        // The green success banner visible in image_eee600.png after adding a product
        this.successMessage = page.locator('.alert-success, .cart-success, body').getByText(/добавен/i);
        
        // The shopping cart counter badge in the header showing '1' item
        this.cartHeaderBadge = page.locator('a.basket_ico, .basket_num, [class*="basket"]').getByText('1');
    }

    /**
     * Navigates directly to a specific city landing page to bypass slow UI dropdowns.
     */
    async navigateToCity(city: string) {
        // Using absolute URL to prevent base URL misconfigurations in Playwright
        await this.page.goto(`https://grabo.bg/${city}`);
    }

    /**
     * Selects and opens the first available offer on the listing page by clicking its title.
     */
    async selectFirstOffer() {
        const offerTitleLink = this.firstOfferCard.locator('a.tdeal_title');
        await offerTitleLink.waitFor({ state: 'visible', timeout: 5000 });
        await offerTitleLink.click();
    }

    /**
     * Clicks the main purchase button and intelligently handles whether the offer 
     * has dynamic options (variants) or redirects straight to the checkout.
     */
    async proceedToPurchase() {
        const currentUrl = this.page.url();

        await this.mainBuyButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.mainBuyButton.click();
        
        // Dynamic wait to allow either a redirect or the options container to render
        await this.page.waitForTimeout(1000);

        // If the URL is unchanged, it means Grabo requires a variant selection
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