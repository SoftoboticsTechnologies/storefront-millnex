'use client';

import {Suspense, useCallback, useEffect, useState} from 'react';
import {useLocale} from 'next-intl';
import {query} from '@/platform/vendure/client-api';
import {getActiveCurrencyCode} from '@/features/currency/currency-client';
import {ResultOf} from '@/platform/vendure/graphql';
import {FacetFilters, type FilterCategory} from '@/features/search/facet-filters';
import {ProductGridSkeleton} from '@/features/products/product-grid-skeleton';
import {ProductGrid} from '@/features/products/product-grid';
import {SearchParamsSync} from '@/features/search/search-params-sync';
import {ResultsErrorBoundary} from '@/features/search/results-error-boundary';
import {buildSearchInput, getCurrentPage} from '@/features/search/search-helpers';
import {SearchProductsQuery} from '@/features/search/graphql';

type SearchProductsResult = {
    data: ResultOf<typeof SearchProductsQuery>;
    token?: string;
};

// Next's useSearchParams() only exposes a ReadonlyURLSearchParams; convert it
// into the { [key: string]: string | string[] | undefined } shape buildSearchInput
// expects (multiple entries — e.g. repeated `facets=` — become an array).
// Shared by the shop, search and collection listings so facet OR/AND
// semantics (search-helpers.ts) can't diverge between them.
function toSearchParamsRecord(searchParams: URLSearchParams): {[key: string]: string | string[] | undefined} {
    const record: {[key: string]: string | string[] | undefined} = {};
    for (const key of new Set(searchParams.keys())) {
        const values = searchParams.getAll(key);
        record[key] = values.length > 1 ? values : values[0];
    }
    return record;
}

function fetchCatalog(searchParamsString: string, locale: string, collectionSlug?: string): Promise<SearchProductsResult> {
    const record = toSearchParamsRecord(new URLSearchParams(searchParamsString));

    return getActiveCurrencyCode().then((currencyCode) =>
        query(SearchProductsQuery, {
            input: buildSearchInput({searchParams: record, collectionSlug}),
        }, {languageCode: locale, currencyCode})
    );
}

function ResultsSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[16rem_1fr]">
            <aside>
                <div className="h-11 animate-pulse rounded-xl bg-muted lg:h-72" />
            </aside>
            <ProductGridSkeleton />
        </div>
    );
}

export interface CatalogResultsProps {
    /** Scope the listing to one Vendure collection (category pages). */
    collectionSlug?: string;
    /** Id of that collection — cards don't repeat it as their label. */
    collectionId?: string;
    /**
     * Default (unfiltered, page 1) listing already fetched at build time —
     * used as the initial result so the statically-exported HTML has real
     * product content for SEO/crawlers. Superseded by the live fetch, which
     * also covers any filter/sort/page/term the URL specifies. Omit for
     * routes whose content depends on the query string (search), which then
     * render a skeleton until the live fetch resolves.
     */
    initialProducts?: ResultOf<typeof SearchProductsQuery>;
    /** Collection id → name (build time), used to label product cards. */
    collectionNames?: Record<string, string>;
    /** Categories offered as a filter (unscoped listings only — see FacetFilters). */
    categories?: FilterCategory[];
}

export function CatalogResults({collectionSlug, collectionId, initialProducts, collectionNames, categories}: CatalogResultsProps) {
    const locale = useLocale();
    // Defaults to '' (no filters/sort/page) so the first render — including
    // the statically-exported HTML — matches the build-time `initialProducts`
    // default listing. SearchParamsSync reports the real value post-hydration
    // without this component calling useSearchParams() itself (see
    // search-params-sync.tsx for why that matters under static export).
    const [searchParamsString, setSearchParamsString] = useState('');
    const [resultPromise, setResultPromise] = useState<Promise<SearchProductsResult> | null>(
        () => (initialProducts ? Promise.resolve({data: initialProducts}) : null)
    );
    const [hasSyncedParams, setHasSyncedParams] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (!hasSyncedParams) return;
        setResultPromise(fetchCatalog(searchParamsString, locale, collectionSlug));
    }, [collectionSlug, searchParamsString, locale, hasSyncedParams, attempt]);

    const handleParamsChange = useCallback((value: string) => {
        setSearchParamsString(value);
        setHasSyncedParams(true);
    }, []);

    const page = getCurrentPage(toSearchParamsRecord(new URLSearchParams(searchParamsString)));

    return (
        <>
            <SearchParamsSync onChange={handleParamsChange} />
            {!resultPromise ? (
                <ResultsSkeleton />
            ) : (
                <ResultsErrorBoundary key={attempt} onRetry={() => setAttempt((n) => n + 1)}>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr] lg:gap-8">
                        {/* Filters: sidebar on desktop, sheet trigger on mobile */}
                        <aside className="lg:sticky lg:top-24 lg:self-start">
                            <Suspense fallback={<div className="h-11 animate-pulse rounded-xl bg-muted lg:h-72"/>}>
                                <FacetFilters productDataPromise={resultPromise} searchParamsString={searchParamsString} categories={collectionSlug ? undefined : categories}/>
                            </Suspense>
                        </aside>

                        <div className="min-w-0">
                            <Suspense fallback={<ProductGridSkeleton/>}>
                                <ProductGrid
                                    productDataPromise={resultPromise}
                                    currentPage={page}
                                    take={12}
                                    searchParamsString={searchParamsString}
                                    collectionNames={collectionNames}
                                    currentCollectionId={collectionId}
                                />
                            </Suspense>
                        </div>
                    </div>
                </ResultsErrorBoundary>
            )}
        </>
    );
}
