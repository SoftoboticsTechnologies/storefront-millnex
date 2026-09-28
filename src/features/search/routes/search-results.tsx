'use client';

import {CatalogResults, type CatalogResultsProps} from '@/features/search/catalog-results';

/**
 * Search (`/search?q=`) and Shop-all (`/shop`) listing. `/search` passes no
 * `initialProducts` (its content depends entirely on the query string and the
 * route is noindex); `/shop` passes the build-time default listing for SEO.
 */
export function SearchResults(props: Omit<CatalogResultsProps, 'collectionSlug' | 'collectionId'>) {
    return <CatalogResults {...props} />;
}
