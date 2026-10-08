/**
 * Catalog focus (client direction 2026-10-08): the storefront presents
 * Millnex as an Atta Chakki brand, so visitors see only the products in the
 * Vendure collection(s) listed here — on search, suggestions,
 * homepage, mega menu, footer, compare, quote picker and sitemap. The one
 * exception is `/shop`, the all-products page, which lists everything.
 *
 * Nothing is deleted: every other product (pulverizer, gravy, fafda,
 * papad, vegetable cutter…) stays in Vendure, its product page is still
 * prerendered (old links, orders and the account history keep working),
 * and its collection page still builds. It is simply not listed or linked.
 *
 * To bring the full catalogue back, set `FOCUS_COLLECTION_SLUGS` to `[]`.
 * Slugs are Vendure collection slugs (the "Stoneless Flour Mill" collection
 * holds every atta chakki model); a slug that doesn't exist in the store is
 * ignored by `getShopCategories`, but would empty the shop listing, so keep
 * this in step with the Vendure admin.
 */
export const FOCUS_COLLECTION_SLUGS: readonly string[] = ['stoneless-flour-mill'];

export function hasCatalogFocus(): boolean {
    return FOCUS_COLLECTION_SLUGS.length > 0;
}

/** True when the collection is listed to visitors (always true without a focus). */
export function isFocusCollection(slug: string | undefined | null): boolean {
    if (!hasCatalogFocus()) return true;
    return !!slug && FOCUS_COLLECTION_SLUGS.includes(slug);
}

/**
 * Vendure `SearchInput` scope for an unscoped listing (no collection page):
 * `{collectionSlugs}` while a focus is set, else nothing.
 */
export function focusSearchScope(): {collectionSlugs?: string[]} {
    return hasCatalogFocus() ? {collectionSlugs: [...FOCUS_COLLECTION_SLUGS]} : {};
}

/**
 * Customer offers shown alongside the Atta Chakki (client direction
 * 2026-10-08). Policy values live here so copy never hardcodes them. They are
 * marketing statements only — checkout shipping charges always come from the
 * Vendure shipping methods, which must reflect this radius.
 */
export const CUSTOMER_OFFERS = {
    /** Free shipping radius in kilometres. */
    freeShippingKm: 200,
    /** Free home demonstration before purchase. */
    freeHomeDemo: true,
} as const;
