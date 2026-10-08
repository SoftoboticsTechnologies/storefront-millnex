import { focusSearchScope } from '@/config/catalog-focus';

export const DEFAULT_SORT = 'featured';

export interface SearchInputParams {
    term?: string;
    collectionSlug?: string;
    /** Category filter (`?category=<slug>`, repeatable) — Vendure matches products in any of them. */
    collectionSlugs?: string[];
    take: number;
    skip: number;
    groupByProduct: boolean;
    /** Omitted for the default "featured" order (Vendure's own ranking — relevance when there's a term). */
    sort?: { name?: 'ASC' | 'DESC'; price?: 'ASC' | 'DESC' };
    facetValueFilters?: Array<{ or: string[] }>;
    inStock?: boolean;
}

interface BuildSearchInputOptions {
    searchParams: { [key: string]: string | string[] | undefined };
    collectionSlug?: string;
    /** List every product, ignoring the catalog focus (the `/shop` all-products page). */
    allProducts?: boolean;
}

export function buildSearchInput({ searchParams, collectionSlug, allProducts }: BuildSearchInputOptions): SearchInputParams {
    const page = Number(searchParams.page) || 1;
    const take = 12;
    const skip = (page - 1) * take;
    const sort = (searchParams.sort as string) || DEFAULT_SORT;
    const searchTerm = searchParams.q as string;

    // Extract facet entries from search params, encoded as "<facetId>:<facetValueId>"
    const facetEntries = searchParams.facets
        ? Array.isArray(searchParams.facets)
            ? searchParams.facets
            : [searchParams.facets]
        : [];

    // Group facet value IDs by their facet, so values within the same facet
    // are OR'd together (e.g. brand: Apple OR Samsung) while different facets
    // are AND'd together (e.g. category: Equipment AND brand: Apple OR Samsung)
    const facetValueIdsByFacet = new Map<string, string[]>();
    for (const entry of facetEntries) {
        const [facetId, facetValueId] = entry.split(':');
        if (!facetId || !facetValueId) continue;
        const existing = facetValueIdsByFacet.get(facetId);
        if (existing) {
            existing.push(facetValueId);
        } else {
            facetValueIdsByFacet.set(facetId, [facetValueId]);
        }
    }

    const categorySlugs = (Array.isArray(searchParams.category) ? searchParams.category : [searchParams.category])
        .filter((slug): slug is string => !!slug);

    // Map sort parameter to Vendure SearchResultSortParameter. "featured"
    // sends no sort, leaving the order to Vendure (relevance for a term).
    const sortMapping: Record<string, { name?: 'ASC' | 'DESC'; price?: 'ASC' | 'DESC' } | null> = {
        'featured': null,
        'name-asc': { name: 'ASC' },
        'name-desc': { name: 'DESC' },
        'price-asc': { price: 'ASC' },
        'price-desc': { price: 'DESC' },
    };

    return {
        ...(searchTerm && { term: searchTerm }),
        ...(collectionSlug && { collectionSlug }),
        take,
        skip,
        groupByProduct: true,
        ...(sortMapping[sort] && { sort: sortMapping[sort] }),
        // A collection page is already scoped to one collection, so the
        // category filter only applies to unscoped listings (shop, search).
        // Without a category filter those listings are scoped to the catalog
        // focus (config/catalog-focus.ts — Atta Chakki only), if one is set,
        // except the `/shop` all-products page.
        ...(!collectionSlug && (categorySlugs.length > 0 ? { collectionSlugs: categorySlugs } : !allProducts && focusSearchScope())),
        ...(facetValueIdsByFacet.size > 0 && {
            facetValueFilters: Array.from(facetValueIdsByFacet.values()).map(ids => ({ or: ids }))
        }),
        // Availability filter (`?inStock=1`) — Vendure's own SearchInput.inStock,
        // independent of (and AND'd with) the facet groups above.
        ...(searchParams.inStock === '1' && { inStock: true })
    };
}

export function getCurrentPage(searchParams: { [key: string]: string | string[] | undefined }): number {
    return Number(searchParams.page) || 1;
}
