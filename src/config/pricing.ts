/**
 * Client-supplied original prices (MRP), display-only — the struck-through
 * price and "% OFF" beside the real Vendure price (2026-09-30).
 *
 * The selling / discounted price is ALWAYS the Vendure variant price; these
 * values are never sent to Vendure or used for cart, checkout or orders.
 *
 * Keyed by the variant SKU exactly as Vendure reports it (trimmed). A
 * `ProductVariant.customFields.mrp` value in Vendure takes precedence once
 * the backend adds that field (docs/commerce.md "MRP custom field"), after
 * which entries here can be deleted. An MRP at or below the live Vendure
 * price is ignored, so a later price change can never produce a false
 * discount. Products not listed keep the default reference price.
 */
export const ORIGINAL_PRICES = {
    /** Currency the amounts below are in; ignored for variants priced in any other currency. */
    currencyCode: 'INR',
    /** SKU → original price in whole rupees (tax-inclusive, like `priceWithTax`). */
    bySku: {
        'MLX-FM-STD-1HP': 18_000, // 1 HP Atta Chakki (Stoneless Flour Mill – Standard Model)
        'MILLNEX 1.5 HP ATTA CHAKKI': 21_000, // 1.5 HP Atta Chakki
        'MLX-FM-REG-2HP': 25_000, // 2 HP Atta Chakki (Regular Model)
        'MLX-FM-2IN1-2HP': 25_000, // 2 HP Atta Chakki (2 in 1)
        'stoneless-flour-mill-3-hp-regular-model': 37_000, // 3 HP Atta Chakki (Regular Model)
    } as Record<string, number>,
};
