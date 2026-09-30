/**
 * Display-only struck-through price beside the real Vendure price: the
 * product's Vendure MRP custom field when set (`resolveReferencePrice`),
 * otherwise a generated "original" reference price (Vendure price × 1.10)
 * — see docs/decisions.md, 2026-09-29.
 *
 * The Vendure price is always the selling price used for cart, checkout,
 * payment and orders — this value is presentation only and must never be
 * sent to Vendure, stored, or used in any calculation.
 *
 * Set `SHOW_REFERENCE_PRICE` to `false` to switch the ×1.10 strikethrough off
 * site-wide (real Vendure MRPs still show).
 */
export const SHOW_REFERENCE_PRICE = true;

/** Reference price = Vendure price × 1.10. */
const REFERENCE_PRICE_MARKUP_PERCENT = 10;

/**
 * Returns the reference price in the same minor units (paise/cents) Vendure
 * uses, rounded to a whole minor unit so it formats exactly like every other
 * price (₹8,499 → ₹9,348.90). Returns `null` for missing, zero, negative or
 * non-finite prices — no reference price is invented without a real one.
 */
export function calculateDisplayOriginalPrice(sellingPrice: number | null | undefined): number | null {
    if (!SHOW_REFERENCE_PRICE) return null;
    if (typeof sellingPrice !== 'number' || !Number.isFinite(sellingPrice) || sellingPrice <= 0) return null;
    // Integer arithmetic avoids float drift (e.g. 1000000 * 1.1 = 1100000.0000000002).
    return Math.round((sellingPrice * (100 + REFERENCE_PRICE_MARKUP_PERCENT)) / 100);
}

export interface ReferencePrice {
    /** Struck-through price (minor units). */
    original: number;
    /** `original − selling`, only for a real MRP; null for the ×1.10 fallback (no saving claim). */
    saving: number | null;
    /** `(original − selling) / original × 100`, rounded to 2 decimals; null for the ×1.10 fallback. */
    percentOff: number | null;
}

/**
 * Picks the struck-through price for a selling price: the product's real
 * Vendure MRP when it has one above the selling price (with the saving),
 * otherwise the ×1.10 display price (no saving line). Null when there's no
 * usable selling price.
 */
export function resolveReferencePrice(sellingPrice: number | null | undefined, mrp: number | null | undefined): ReferencePrice | null {
    if (typeof sellingPrice !== 'number' || !Number.isFinite(sellingPrice) || sellingPrice <= 0) return null;
    if (typeof mrp === 'number' && Number.isFinite(mrp) && mrp > sellingPrice) {
        return {original: mrp, saving: mrp - sellingPrice, percentOff: discountPercent(mrp, sellingPrice)};
    }
    const original = calculateDisplayOriginalPrice(sellingPrice);
    return original === null ? null : {original, saving: null, percentOff: null};
}

/** Discount percentage off the original price, rounded to 2 decimals (₹18,000 → ₹15,499 = 13.89). */
export function discountPercent(original: number, selling: number): number {
    return Math.round(((original - selling) / original) * 100 * 100) / 100;
}
