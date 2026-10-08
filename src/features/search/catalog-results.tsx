'use client';

import {Suspense, use, useCallback, useEffect, useState, useTransition} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {query} from '@/platform/vendure/client-api';
import {getActiveCurrencyCode} from '@/features/currency/currency-client';
import {ResultOf} from '@/platform/vendure/graphql';
import {
    ActiveFilterChips,
    FacetFilterSheet,
    FacetFilterSidebar,
    indexFacetValues,
    type FacetValueIndex,
    type FilterCategory,
} from '@/features/search/facet-filters';
import {SortDropdown} from '@/features/search/sort-dropdown';
import {FilterSidebarSkeleton, ListingToolbarSkeleton, SearchResultsSkeleton} from '@/features/search/search-results-skeleton';
import {LISTING_LAYOUT_CLASS} from '@/features/search/listing-layout';
import {ListingEmptyState} from '@/features/search/listing-empty-state';
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

function fetchCatalog(searchParamsString: string, locale: string, collectionSlug?: string, allProducts?: boolean): Promise<SearchProductsResult> {
    const record = toSearchParamsRecord(new URLSearchParams(searchParamsString));

    return getActiveCurrencyCode().then((currencyCode) =>
        query(SearchProductsQuery, {
            input: buildSearchInput({searchParams: record, collectionSlug, allProducts}),
        }, {languageCode: locale, currencyCode})
    );
}

const PAGE_SIZE = 12;

/**
 * Result count + sort, with the mobile "Filters" drawer trigger alongside
 * sort (both side-by-side on phones; the drawer trigger is hidden from lg,
 * where the sidebar takes over).
 */
function ListingToolbar({
    productDataPromise,
    searchParamsString,
    categories,
    facetIndex,
    pending,
}: {
    productDataPromise: Promise<SearchProductsResult>;
    searchParamsString: string;
    categories?: FilterCategory[];
    facetIndex: FacetValueIndex;
    pending: boolean;
}) {
    const t = useTranslations('Listing');
    // Suspends with the grid until the result is in, so the toolbar never
    // shows the "updating" note for a result that isn't rendered yet.
    use(productDataPromise);

    const count = (
        <p className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1 text-sm" aria-live="polite">
            {pending && <span className="spec-label animate-pulse text-brand">{t('updating')}</span>}
        </p>
    );

    return (
        <div className="space-y-3 border-b border-border pb-4">
            <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex min-w-0 flex-1 sm:flex-none lg:hidden">
                    <FacetFilterSheet
                        className="w-full"
                        productDataPromise={productDataPromise}
                        searchParamsString={searchParamsString}
                        categories={categories}
                        facetIndex={facetIndex}
                        pending={pending}
                    />
                </div>
                <div className="hidden min-w-0 sm:block">{count}</div>
                <div className="flex min-w-0 flex-1 sm:ml-auto sm:flex-none">
                    <SortDropdown className="w-full" searchParamsString={searchParamsString} />
                </div>
            </div>
            <div className="sm:hidden">{count}</div>
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
    /** Ignore the catalog focus and list every product (`/shop`). */
    allProducts?: boolean;
}

/**
 * A promise React's `use()` reads synchronously: React checks a thenable's
 * `status`/`value` before suspending. A plain `Promise.resolve()` would
 * still suspend once, and under static export a suspended boundary is
 * written out as its fallback — so the build-time listing would never reach
 * the exported HTML (no crawlable product cards).
 */
function fulfilled<T>(value: T): Promise<T> {
    return Object.assign(Promise.resolve(value), {status: 'fulfilled' as const, value});
}

export function CatalogResults({collectionSlug, collectionId, initialProducts, collectionNames, categories, allProducts}: CatalogResultsProps) {
    const locale = useLocale();
    const t = useTranslations('Listing');
    // Defaults to '' (no filters/sort/page) so the first render — including
    // the statically-exported HTML — matches the build-time `initialProducts`
    // default listing. SearchParamsSync reports the real value post-hydration
    // without this component calling useSearchParams() itself (see
    // search-params-sync.tsx for why that matters under static export).
    const [searchParamsString, setSearchParamsString] = useState('');
    const [resultPromise, setResultPromise] = useState<Promise<SearchProductsResult> | null>(
        () => (initialProducts ? fulfilled({data: initialProducts}) : null)
    );
    const [hasSyncedParams, setHasSyncedParams] = useState(false);
    const [attempt, setAttempt] = useState(0);
    // Refetches run in a transition so the current grid (and an open filter
    // drawer) stay on screen, dimmed, until the new result resolves — no
    // skeleton flash on every filter/sort change.
    const [isTransitionPending, startTransition] = useTransition();
    // URL params the displayed result was fetched for ('' = the build-time
    // default listing). Only dim/flag "updating" when the pending fetch is for
    // different params — not for the silent post-hydration refresh or a retry.
    const [resultParams, setResultParams] = useState<string | null>(initialProducts ? '' : null);
    const pending = isTransitionPending && resultParams !== searchParamsString;
    const [facetIndex, setFacetIndex] = useState<FacetValueIndex>(() => indexFacetValues({}, initialProducts?.search.facetValues ?? []));

    useEffect(() => {
        if (!hasSyncedParams) return;
        startTransition(() => {
            setResultPromise(fetchCatalog(searchParamsString, locale, collectionSlug, allProducts));
            setResultParams(searchParamsString);
        });
    }, [collectionSlug, allProducts, searchParamsString, locale, hasSyncedParams, attempt]);

    // Remember every facet value seen so far (labels for chips / selected values
    // that drop out of the current result — see FacetValueIndex).
    useEffect(() => {
        if (!resultPromise) return;
        let active = true;
        resultPromise.then(
            (result) => {
                if (active) setFacetIndex((prev) => indexFacetValues(prev, result.data.search.facetValues));
            },
            () => {},
        );
        return () => {
            active = false;
        };
    }, [resultPromise]);

    const handleParamsChange = useCallback((value: string) => {
        setSearchParamsString(value);
        setHasSyncedParams(true);
    }, []);

    const page = getCurrentPage(toSearchParamsRecord(new URLSearchParams(searchParamsString)));
    // A collection page is already scoped to one collection — no category filter there.
    const filterCategories = collectionSlug ? undefined : categories;
    const paginationLabels = {
        nav: t('pagination'),
        previous: t('previous'),
        next: t('next'),
        page: (n: number) => t('pageN', {page: n}),
        pageOf: (n: number, total: number) => t('pageOf', {page: n, total}),
    };

    return (
        <>
            <SearchParamsSync onChange={handleParamsChange} />
            {!resultPromise ? (
                <SearchResultsSkeleton />
            ) : (
                <ResultsErrorBoundary key={attempt} onRetry={() => setAttempt((n) => n + 1)}>
                    <div className={LISTING_LAYOUT_CLASS}>
                        {/* Desktop sticky sidebar; below lg the same filters open in a drawer from the toolbar. */}
                        <aside className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-width:thin]">
                            <Suspense fallback={<FilterSidebarSkeleton />}>
                                <FacetFilterSidebar productDataPromise={resultPromise} searchParamsString={searchParamsString} categories={filterCategories} facetIndex={facetIndex} />
                            </Suspense>
                        </aside>

                        <div className="min-w-0 space-y-5">
                            <Suspense fallback={<ListingToolbarSkeleton />}>
                                <ListingToolbar
                                    productDataPromise={resultPromise}
                                    searchParamsString={searchParamsString}
                                    categories={filterCategories}
                                    facetIndex={facetIndex}
                                    pending={pending}
                                />
                            </Suspense>
                            <ActiveFilterChips searchParamsString={searchParamsString} categories={filterCategories} facetIndex={facetIndex} />
                            <Suspense fallback={<ProductGridSkeleton/>}>
                                <ProductGrid
                                    productDataPromise={resultPromise}
                                    currentPage={page}
                                    take={PAGE_SIZE}
                                    searchParamsString={searchParamsString}
                                    collectionNames={collectionNames}
                                    currentCollectionId={collectionId}
                                    pending={pending}
                                    emptyState={<ListingEmptyState searchParamsString={searchParamsString} />}
                                    paginationLabels={paginationLabels}
                                />
                            </Suspense>
                        </div>
                    </div>
                </ResultsErrorBoundary>
            )}
        </>
    );
}
