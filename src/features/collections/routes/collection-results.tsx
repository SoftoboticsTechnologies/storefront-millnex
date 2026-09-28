'use client';

import {CatalogResults, type CatalogResultsProps} from '@/features/search/catalog-results';

/**
 * Collection (category) product listing — the shared catalog listing scoped
 * to `collectionSlug`, seeded with the build-time default listing so the
 * statically-exported HTML has real product content (see catalog-results.tsx).
 */
export function CollectionResults(props: CatalogResultsProps & {collectionSlug: string}) {
    return <CatalogResults {...props} />;
}
