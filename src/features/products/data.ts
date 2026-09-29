import {query} from '@/platform/vendure/api';
import {SearchProductsQuery} from '@/features/search/graphql';
import {getActiveCurrencyCode} from '@/features/currency/currency-server';
import {readFragment} from '@/platform/vendure/graphql';
import {ProductCardFragment, GetProductDetailQuery, GetNewestProductsQuery} from './graphql';
import {cardFromProduct, cardFromSearchResult, type ProductCardData} from './product-card-data';

// Page size used while enumerating the full catalog at build time.
const PRODUCT_SLUG_PAGE_SIZE = 100;

/**
 * Slugs for every product in the catalog, used to prerender product detail
 * pages at build time. Static export has no on-demand fallback for a slug
 * that wasn't prerendered, so this must enumerate the full catalog (paginated)
 * rather than a "popular" subset. Not used for any pricing/stock display.
 */
export function getPopularProductSlugs(locale: string): Promise<string[]> {
    // Build-time memo (see collections/data.ts#getTopCollections): read by
    // generateStaticParams, the homepage and the sitemap.
    if (process.env.NODE_ENV !== 'production') return fetchProductSlugs(locale);
    let pending = productSlugsByLocale.get(locale);
    if (!pending) {
        pending = fetchProductSlugs(locale);
        pending.catch(() => productSlugsByLocale.delete(locale));
        productSlugsByLocale.set(locale, pending);
    }
    return pending;
}

const productSlugsByLocale = new Map<string, Promise<string[]>>();

async function fetchProductSlugs(locale: string): Promise<string[]> {
    const slugs: string[] = [];
    let skip = 0;
    let fetched = 0;

    for (;;) {
        const result = await query(SearchProductsQuery, {
            input: {
                take: PRODUCT_SLUG_PAGE_SIZE,
                skip,
                groupByProduct: true,
                sort: {name: 'ASC'},
            },
        }, {languageCode: locale});

        const items = result.data.search.items;
        fetched += items.length;
        // A product missing a translation for this locale can come back with
        // an empty slug — filter it out rather than prerendering a bogus
        // `/product//` route (or, for getProductVariantParams below, querying
        // the detail API with an empty slug, which it rejects outright).
        slugs.push(...items.map((item) => readFragment(ProductCardFragment, item).slug).filter(Boolean));

        if (items.length < PRODUCT_SLUG_PAGE_SIZE || fetched >= result.data.search.totalItems) {
            break;
        }
        skip += PRODUCT_SLUG_PAGE_SIZE;
    }

    return slugs;
}

/**
 * `{slug, variant}` pairs for every non-default variant of every product in
 * the catalog, used by generateStaticParams to prerender one static page per
 * variant (in addition to the slug's own default-variant page) — each with
 * that variant's real price/stock baked into the HTML. `variant` is the
 * variant's SKU, sufficient to identify it regardless of how many option
 * groups the product has. The first variant (`product.variants[0]`, matching
 * the default selection in product-info.tsx) is deliberately excluded here:
 * it's served at the slug's own bare URL rather than a `/[sku]` sub-path.
 */
export async function getProductVariantParams(locale: string): Promise<Array<{slug: string; variant: string}>> {
    const slugs = await getPopularProductSlugs(locale);
    const params: Array<{slug: string; variant: string}> = [];

    await Promise.all(slugs.map(async (slug) => {
        const result = await query(GetProductDetailQuery, {slug}, {languageCode: locale});
        const variants = result.data.product?.variants ?? [];
        variants.slice(1).forEach((variant) => {
            params.push({slug, variant: variant.sku});
        });
    }));

    return params;
}

export interface CatalogFacet {
    id: string;
    name: string;
    values: Array<{id: string; name: string; count: number}>;
}

export interface CatalogListing {
    totalItems: number;
    products: ProductCardData[];
    /** Vendure facet values present in this listing, grouped by facet (e.g. "Type"). */
    facets: CatalogFacet[];
}

function groupFacetValues(
    facetValues: Array<{count: number; facetValue: {id: string; name: string; facet: {id: string; name: string}}}>,
): CatalogFacet[] {
    const facets = new Map<string, CatalogFacet>();
    for (const {count, facetValue} of facetValues) {
        const {facet} = facetValue;
        let group = facets.get(facet.id);
        if (!group) {
            group = {id: facet.id, name: facet.name.trim(), values: []};
            facets.set(facet.id, group);
        }
        // Vendure admin data sometimes carries a trailing comma ("Vegetable Cutter,").
        group.values.push({id: facetValue.id, name: facetValue.name.trim().replace(/,\s*$/, ''), count});
    }
    return [...facets.values()];
}

/**
 * Build-time product listing (channel default currency) for homepage rails
 * and related-product sections — real Vendure search results, never a
 * fixture. Prices are superseded client-side when the viewer's currency
 * differs (see product-price-client.tsx).
 */
export async function getCatalogListing(
    locale: string,
    {take, collectionSlug, inStockOnly}: {take: number; collectionSlug?: string; inStockOnly?: boolean},
): Promise<CatalogListing> {
    const currencyCode = await getActiveCurrencyCode();
    const result = await query(SearchProductsQuery, {
        input: {
            take,
            skip: 0,
            groupByProduct: true,
            sort: {name: 'ASC'},
            ...(collectionSlug && {collectionSlug}),
            ...(inStockOnly && {inStock: true}),
        },
    }, {languageCode: locale, currencyCode});

    return {
        totalItems: result.data.search.totalItems,
        products: result.data.search.items.map(cardFromSearchResult),
        facets: groupFacetValues(result.data.search.facetValues),
    };
}

/**
 * Most recently created products (Vendure `createdAt DESC`), for "New
 * arrivals". Restricted to products that also appear in the search index:
 * product pages are prerendered from the index (getPopularProductSlugs), so
 * linking to an unindexed product would 404 on the static host.
 */
export async function getNewestProducts(locale: string, take: number): Promise<ProductCardData[]> {
    const currencyCode = await getActiveCurrencyCode();
    const [result, indexedSlugs] = await Promise.all([
        query(GetNewestProductsQuery, {take: take * 3}, {languageCode: locale, currencyCode}),
        getPopularProductSlugs(locale),
    ]);
    const prerendered = new Set(indexedSlugs);

    return result.data.products.items
        .filter((product) => product.slug && prerendered.has(product.slug))
        .slice(0, take)
        .map(cardFromProduct);
}

/** `{value: slug, label: name}` for every indexed product — e.g. an enquiry form's product picker. */
export async function getProductOptions(locale: string): Promise<Array<{value: string; label: string}>> {
    const options: Array<{value: string; label: string}> = [];
    let skip = 0;

    for (;;) {
        const result = await query(SearchProductsQuery, {
            input: {take: PRODUCT_SLUG_PAGE_SIZE, skip, groupByProduct: true, sort: {name: 'ASC'}},
        }, {languageCode: locale});
        const items = result.data.search.items.map((item) => readFragment(ProductCardFragment, item));
        options.push(...items.filter((item) => item.slug).map((item) => ({value: item.slug, label: item.productName})));
        if (items.length < PRODUCT_SLUG_PAGE_SIZE || options.length >= result.data.search.totalItems) break;
        skip += PRODUCT_SLUG_PAGE_SIZE;
    }

    return options;
}

export interface ProductSpecSheet {
    productId: string;
    slug: string;
    name: string;
    imageUrl: string | null;
    /** Distinct variant SKUs, whitespace-trimmed. */
    skus: string[];
    /** Variant names when the product has more than one variant. */
    variantNames: string[];
    /** priceWithTax range across variants, in minor units, in the build currency. */
    price: {min: number; max: number; currencyCode: string} | null;
    inStock: boolean;
    /** Vendure facet values grouped by facet — the only structured specs the schema has. */
    specs: Array<{facet: string; values: string[]}>;
}

/**
 * Build-time detail for a set of products (comparison table, spotlight):
 * everything is read from `GetProductDetailQuery` — nothing derived beyond
 * grouping facet values by facet. Prices are in the channel's default
 * currency, like every other build-time price; callers render them through
 * the live `ProductCardPrice` so a different viewer currency still wins.
 */
export async function getProductSpecSheets(locale: string, slugs: string[]): Promise<ProductSpecSheet[]> {
    const currencyCode = await getActiveCurrencyCode();
    const results = await Promise.all(slugs.map((slug) => query(GetProductDetailQuery, {slug}, {languageCode: locale, currencyCode})));

    return results.flatMap(({data}) => {
        const product = data.product;
        if (!product) return [];
        const prices = product.variants.map((variant) => variant.priceWithTax);
        const specs = new Map<string, {facet: string; values: string[]}>();
        for (const value of product.facetValues ?? []) {
            const group = specs.get(value.facet.id) ?? {facet: value.facet.name.trim(), values: []};
            group.values.push(value.name.trim().replace(/,\s*$/, ''));
            specs.set(value.facet.id, group);
        }
        return [{
            productId: product.id,
            slug: product.slug,
            name: product.name.trim(),
            imageUrl: product.assets[0]?.preview ?? null,
            skus: [...new Set(product.variants.map((variant) => variant.sku.trim()).filter(Boolean))],
            variantNames: product.variants.length > 1 ? product.variants.map((variant) => variant.name.trim()) : [],
            price: prices.length > 0 ? {min: Math.min(...prices), max: Math.max(...prices), currencyCode} : null,
            inStock: product.variants.some((variant) => variant.stockLevel !== 'OUT_OF_STOCK'),
            specs: [...specs.values()],
        }];
    });
}
