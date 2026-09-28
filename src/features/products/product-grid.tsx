'use client';

import {use} from 'react';
import {useTranslations} from 'next-intl';
import {PackageOpen, SearchX} from 'lucide-react';
import {ResultOf} from '@/platform/vendure/graphql';
import {Link, usePathname} from '@/platform/i18n/navigation';
import {ProductCard} from './components/product-card';
import {Pagination} from './components/pagination';
import {cardFromSearchResult} from './product-card-data';
import {PRODUCT_GRID_CLASS} from './product-grid-layout';
import {SortDropdown} from '@/features/search/sort-dropdown';
import {SearchProductsQuery} from '@/features/search/graphql';

interface ProductGridProps {
    productDataPromise: Promise<{
        data: ResultOf<typeof SearchProductsQuery>;
        token?: string;
    }>;
    currentPage: number;
    take: number;
    /**
     * Current URL search params, as a string — threaded down to
     * SortDropdown/Pagination rather than read via useSearchParams() in
     * this component (see search-params-sync.tsx).
     */
    searchParamsString: string;
    /** Collection id → name (resolved at build time), used to label cards. */
    collectionNames?: Record<string, string>;
    /** Collection the listing is scoped to — not repeated as each card's label. */
    currentCollectionId?: string;
}

export function ProductGrid({productDataPromise, currentPage, take, searchParamsString, collectionNames, currentCollectionId}: ProductGridProps) {
    const t = useTranslations('Product');
    const pathname = usePathname();
    const result = use(productDataPromise);

    const searchResult = result.data.search;
    const totalPages = Math.ceil(searchResult.totalItems / take);
    const params = new URLSearchParams(searchParamsString);
    const term = params.get('q')?.trim() ?? '';
    const isFiltered = !!term || params.has('facets') || params.has('inStock');

    if (!searchResult.items.length) {
        return (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
                {isFiltered ? <SearchX className="size-10 text-muted-foreground" /> : <PackageOpen className="size-10 text-muted-foreground" />}
                <h2 className="mt-4 text-lg font-bold">
                    {term ? t('noResultsFor', {term}) : isFiltered ? t('noProductsMatch') : t('noProductsAvailable')}
                </h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    {isFiltered ? t('noResultsHint') : t('noProductsAvailableHint')}
                </p>
                {isFiltered && (
                    <Link href={pathname} className="mt-6 inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-semibold transition-colors hover:bg-muted">
                        {t('clearSearchAndFilters')}
                    </Link>
                )}
            </div>
        );
    }

    const labelFor = (collectionIds: string[]) =>
        collectionIds
            .filter((id) => id !== currentCollectionId)
            .map((id) => collectionNames?.[id])
            .find(Boolean);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground" aria-live="polite">
                    {term
                        ? t('resultCountFor', {count: searchResult.totalItems, term})
                        : t('productCount', {count: searchResult.totalItems})}
                </p>
                <SortDropdown searchParamsString={searchParamsString}/>
            </div>

            <ul className={PRODUCT_GRID_CLASS}>
                {searchResult.items.map((item) => {
                    const product = cardFromSearchResult(item);
                    return (
                        <li key={product.productId}>
                            <ProductCard product={product} category={labelFor(product.collectionIds)} />
                        </li>
                    );
                })}
            </ul>

            {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} searchParamsString={searchParamsString}/>
            )}
        </div>
    );
}
