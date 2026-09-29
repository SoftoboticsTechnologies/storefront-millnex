import {readFragment, type FragmentOf, type ResultOf} from '@/platform/vendure/graphql';
import {ProductCardFragment, GetNewestProductsQuery} from './graphql';

/**
 * Presentation model for a product card, normalized from whichever Vendure
 * shape a listing came from (`SearchResult` for grids/search/collections,
 * `Product` for the createdAt-sorted "New arrivals" rail). Every field is
 * copied from the Vendure response — nothing here is derived or invented
 * beyond stripping HTML from the description for the card excerpt.
 */
export interface ProductCardData {
    productId: string;
    slug: string;
    name: string;
    /** Plain-text description excerpt (HTML stripped). Empty when Vendure has none. */
    summary: string;
    imageUrl: string | null;
    /** Vendure SKU (the first variant's, for Product-shaped sources), whitespace-trimmed. */
    sku: string;
    /** priceWithTax range across variants, in minor units. */
    price: {min: number; max: number; currencyCode: string} | null;
    /** `false` only when Vendure reports every variant out of stock. */
    inStock: boolean;
    collectionIds: string[];
}

type NewestProduct = ResultOf<typeof GetNewestProductsQuery>['products']['items'][number];

export function stripHtml(html: string | null | undefined): string {
    if (!html) return '';
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&rsquo;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

export function cardFromSearchResult(item: FragmentOf<typeof ProductCardFragment>): ProductCardData {
    const product = readFragment(ProductCardFragment, item);
    const price = product.priceWithTax;
    return {
        productId: product.productId,
        slug: product.slug,
        name: product.productName,
        summary: stripHtml(product.description),
        imageUrl: product.productAsset?.preview ?? null,
        sku: product.sku.trim(),
        price: price.__typename === 'PriceRange'
            ? {min: price.min, max: price.max, currencyCode: product.currencyCode}
            : price.__typename === 'SinglePrice'
                ? {min: price.value, max: price.value, currencyCode: product.currencyCode}
                : null,
        inStock: product.inStock,
        collectionIds: [...new Set(product.collectionIds)],
    };
}

export function cardFromProduct(product: NewestProduct): ProductCardData {
    const prices = product.variants.map((variant) => variant.priceWithTax);
    const currencyCode = product.variants[0]?.currencyCode;
    return {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        summary: stripHtml(product.description),
        imageUrl: product.featuredAsset?.preview ?? null,
        sku: product.variants[0]?.sku.trim() ?? '',
        price: prices.length > 0 && currencyCode
            ? {min: Math.min(...prices), max: Math.max(...prices), currencyCode}
            : null,
        inStock: product.variants.some((variant) => variant.stockLevel !== 'OUT_OF_STOCK'),
        collectionIds: product.collections.map((collection) => collection.id),
    };
}
