import type {TadaDocumentNode} from 'gql.tada';
import {parse} from 'graphql';
import {query} from '@/platform/vendure/api';
import {ORIGINAL_PRICES} from '@/config/pricing';

/**
 * Build-time MRP (original price) catalog, from, in order of precedence:
 * 1. the Vendure `ProductVariant.customFields.mrp` custom field (Int, minor
 *    units — paise — tax-inclusive, same unit as `priceWithTax`; see
 *    docs/commerce.md "MRP custom field"), once the backend adds it;
 * 2. client-supplied original prices by SKU (`config/pricing.ts`).
 *
 * The MRP is display-only: it's shown struck through beside the real
 * Vendure price with its "% OFF". Cart, checkout, payment and orders never
 * read it.
 *
 * Queried with hand-written documents rather than gql.tada's `graphql()`
 * because the custom field isn't in the generated schema until the backend
 * adds it — and an unknown field makes Vendure reject the whole query. So
 * the query with `customFields.mrp` is tried first and, if Vendure rejects
 * it, the same query without it; any other failure degrades to "no MRPs"
 * instead of breaking product/listing queries.
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
                sku: string;
                priceWithTax: number;
                currencyCode: string;
                customFields?: {mrp?: number | null} | null;
            }>;
        }>;
    };
}

type MrpQuery = TadaDocumentNode<MrpQueryResult, {skip: number; take: number}>;

const PAGE_SIZE = 100;

const variantQuery = (withCustomField: boolean) => parse(`
    query GetVariantMrp($skip: Int!, $take: Int!) {
        products(options: {skip: $skip, take: $take}) {
            totalItems
            items {
                slug
                variants {
                    id
                    sku
                    priceWithTax
                    currencyCode
                    ${withCustomField ? 'customFields { mrp }' : ''}
                }
            }
        }
    }
`) as unknown as MrpQuery;

const EMPTY: MrpCatalog = {currencyCode: null, variants: {}, products: {}};

let catalogPromise: Promise<MrpCatalog> | null = null;

/** Memoized for the build: every page shares one fetch. */
export function getMrpCatalog(): Promise<MrpCatalog> {
    catalogPromise ??= loadMrpCatalog();
    return catalogPromise;
}

function positive(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

async function fetchAll(document: MrpQuery): Promise<MrpQueryResult['products']['items']> {
    const items: MrpQueryResult['products']['items'] = [];
    for (let skip = 0; ; skip += PAGE_SIZE) {
        const {data} = await query(document, {skip, take: PAGE_SIZE});
        items.push(...data.products.items);
        if (skip + PAGE_SIZE >= data.products.totalItems) return items;
    }
}

async function loadMrpCatalog(): Promise<MrpCatalog> {
    let products: MrpQueryResult['products']['items'];
    try {
        products = await fetchAll(variantQuery(true));
    } catch {
        // Expected until the backend adds the field ("Cannot query field \"mrp\"…").
        try {
            products = await fetchAll(variantQuery(false));
        } catch (error) {
            console.info(`[mrp] No MRP data — using the default reference price. (${error instanceof Error ? error.message : error})`);
            return EMPTY;
        }
    }

    const catalog: MrpCatalog = {currencyCode: null, variants: {}, products: {}};
    for (const product of products) {
        let cheapest: {price: number; mrp: number | null} | null = null;
        for (const variant of product.variants) {
            const configured = variant.currencyCode === ORIGINAL_PRICES.currencyCode
                ? positive(ORIGINAL_PRICES.bySku[variant.sku.trim()])
                : null;
            const mrp = positive(variant.customFields?.mrp) ?? (configured !== null ? configured * 100 : null);
            if (mrp !== null) {
                catalog.variants[variant.id] = mrp;
                catalog.currencyCode ??= variant.currencyCode;
            }
            if (!cheapest || variant.priceWithTax < cheapest.price) {
                cheapest = {price: variant.priceWithTax, mrp};
            }
        }
        if (cheapest?.mrp) catalog.products[product.slug] = cheapest.mrp;
    }
    return catalog;
}
