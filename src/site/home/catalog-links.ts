import type {CatalogFacet} from '@/features/products/data';
import type {CatalogMatch} from '@/site/content/home';

export interface CatalogCategory {
    name: string;
    slug: string;
    /** Live product count in the collection (build time). */
    productCount: number;
}

export interface ResolvedCatalogLink {
    href: string;
    /** Product count when the link is a single collection. */
    count?: number;
}

/**
 * Resolves a marketing card's `CatalogMatch` against the real Vendure catalog
 * (collections and facet values fetched at build), so cards never point at a
 * hardcoded id: collection → facet filters → search → /shop. Facet values
 * that merely repeat a collection's name are ignored (Vendure data often
 * mirrors collections as facet values).
 */
export function resolveCatalogLink(match: CatalogMatch, categories: CatalogCategory[], facets: CatalogFacet[]): ResolvedCatalogLink {
    const category = match.collection && categories.find((entry) => match.collection!.test(entry.name));
    if (category) return {href: `/collection/${category.slug}`, count: category.productCount};

    if (match.facetValues) {
        const categoryNames = new Set(categories.map((entry) => entry.name.toLowerCase()));
        // One facet only: values within a facet are OR'd, but separate facets
        // are AND'd (search-helpers.ts), which could match nothing.
        const best = facets
            .map((facet) => ({
                facet,
                values: facet.values.filter((value) => match.facetValues!.test(value.name) && !categoryNames.has(value.name.toLowerCase())),
            }))
            .sort((a, b) => b.values.length - a.values.length)[0];
        if (best && best.values.length > 0) {
            const query = best.values.map((value) => `facets=${encodeURIComponent(`${best.facet.id}:${value.id}`)}`).join('&');
            return {href: `/shop?${query}`};
        }
    }

    if (match.search) return {href: `/search?q=${encodeURIComponent(match.search)}`};
    return {href: '/shop'};
}
