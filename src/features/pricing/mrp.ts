import type {TadaDocumentNode} from 'gql.tada';
import {parse} from 'graphql';
import {query} from '@/platform/vendure/api';

/**
 * Build-time MRP catalog from the Vendure `ProductVariant.customFields.mrp`
 * custom field (Int, minor units — paise — tax-inclusive, same unit as
 * `priceWithTax`; see docs/commerce.md "MRP custom field").
 *
 * The MRP is display-only: it's shown struck through beside the real
 * Vendure price with a "Save ₹X" line. Cart, checkout, payment and orders
 * never read it.
 *
 * The field is queried in its own document, written by hand rather than via
 * gql.tada's `graphql()`, because it isn't in the generated schema until the
 * backend adds it — and an unknown field makes Vendure reject the whole
 * query. Keeping it separate means a missing field (or any error) degrades
 * to "no MRPs" instead of breaking product/listing queries; once the field
 * exists and the schema is regenerated, nothing here needs to change.
 */
export interface MrpCatalog {
    /** Currency the MRPs are valid for (the channel default at build). Null when there are none. */
    currencyCode: string | null;
    /** Variant id → MRP (minor units). */
    variants: Record<string, number>;
    /** Product slug → MRP of the product's cheapest variant, when that variant has one (cards show the lowest price). */
    products: Record<string, number>;
}

interface MrpQueryResult {
    products: {
        totalItems: number;
        items: Array<{
            slug: string;
            variants: Array<{
                id: string;
                priceWithTax: number;
                currencyCode: string;
                customFields?: {mrp?: number | null} | null;
            }>;
        }>;
    };
}

const PAGE_SIZE = 100;

const GetVariantMrpQuery = parse(`
    query GetVariantMrp($skip: Int!, $take: Int!) {
        products(options: {skip: $skip, take: $take}) {
            totalItems
            items {
                slug
                variants {
                    id
                    priceWithTax
                    currencyCode
                    customFields {
                        mrp
                    }
                }
            }
        }
    }
`) as unknown as TadaDocumentNode<MrpQueryResult, {skip: number; take: number}>;

const EMPTY: MrpCatalog = {currencyCode: null, variants: {}, products: {}};

let catalogPromise: Promise<MrpCatalog> | null = null;

/** Memoized for the build: every page shares one fetch. */
export function getMrpCatalog(): Promise<MrpCatalog> {
    catalogPromise ??= loadMrpCatalog();
    return catalogPromise;
}

async function loadMrpCatalog(): Promise<MrpCatalog> {
    const catalog: MrpCatalog = {currencyCode: null, variants: {}, products: {}};
    try {
        for (let skip = 0; ; skip += PAGE_SIZE) {
            const {data} = await query(GetVariantMrpQuery, {skip, take: PAGE_SIZE});
            for (const product of data.products.items) {
                let cheapest: {price: number; mrp: number | null} | null = null;
                for (const variant of product.variants) {
                    const mrp = variant.customFields?.mrp;
                    const valid = typeof mrp === 'number' && Number.isFinite(mrp) && mrp > 0 ? mrp : null;
                    if (valid !== null) {
                        catalog.variants[variant.id] = valid;
                        catalog.currencyCode ??= variant.currencyCode;
                    }
                    if (!cheapest || variant.priceWithTax < cheapest.price) {
                        cheapest = {price: variant.priceWithTax, mrp: valid};
                    }
                }
                if (cheapest?.mrp) catalog.products[product.slug] = cheapest.mrp;
            }
            if (skip + PAGE_SIZE >= data.products.totalItems) break;
        }
        return catalog;
    } catch (error) {
        // Expected until the backend adds the field ("Cannot query field \"mrp\"…").
        console.info(`[mrp] No Vendure MRP data — using the default reference price. (${error instanceof Error ? error.message : error})`);
        return EMPTY;
    }
}
