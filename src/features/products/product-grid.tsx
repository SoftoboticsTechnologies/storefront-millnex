'use client';

import {use, type ReactNode} from 'react';
import {useTranslations} from 'next-intl';
import {ResultOf} from '@/platform/vendure/graphql';
import {cn} from '@/lib/utils';
import {ProductCard} from './components/product-card';
import {Pagination, type PaginationLabels} from './components/pagination';
import {cardFromSearchResult} from './product-card-data';
import {PRODUCT_GRID_CLASS} from './product-grid-layout';
import {SearchProductsQuery} from '@/features/search/graphql';

interface ProductGridProps {
    productDataPromise: Promise<{
        data: ResultOf<typeof SearchProductsQuery>;
        token?: string;
    }>;
    currentPage: number;
    take: number;
    /**
     * Current URL search params, as a string — threaded down to Pagination
     * rather than read via useSearchParams() in this component (see
     * search-params-sync.tsx).
     */
    searchParamsString: string;
    /** Collection id → name (resolved at build time), used to label cards. */
    collectionNames?: Record<string, string>;
    /** Collection the listing is scoped to — not repeated as each card's label. */
    currentCollectionId?: string;
    /** A newer result is loading (filters/sort/page changed) — dim the current one. */
    pending?: boolean;
    /** Shown instead of the grid when the result is empty (owned by the listing). */
    emptyState?: ReactNode;
    paginationLabels: PaginationLabels;
}

/**
 * Listing grid + pagination. The toolbar (count, sort, mobile filters) and
 * the empty state belong to the listing that renders this (see
 * search/catalog-results.tsx).
 */
export function ProductGrid({productDataPromise, currentPage, take, searchParamsString, collectionNames, currentCollectionId, pending, emptyState, paginationLabels}: ProductGridProps) {
    const t = useTranslations('Product');
    const result = use(productDataPromise);

    const searchResult = result.data.search;
    const totalPages = Math.ceil(searchResult.totalItems / take);

    if (!searchResult.items.length) {
        return emptyState ?? <p className="py-16 text-center text-sm text-muted-foreground">{t('noProductsFound')}</p>;
    }

    const labelFor = (collectionIds: string[]) =>
        collectionIds
            .filter((id) => id !== currentCollectionId)
            .map((id) => collectionNames?.[id])
            .find(Boolean);

    return (
        <div className={cn('space-y-10 transition-opacity duration-200', pending && 'pointer-events-none opacity-55')} aria-busy={pending || undefined}>
            <ul className={PRODUCT_GRID_CLASS}>
                {searchResult.items.map((item, index) => {
                    const product = cardFromSearchResult(item);
                    return (
                        <li key={product.productId}>
                            <ProductCard product={product} category={labelFor(product.collectionIds)} preload={index < 2} />
                        </li>
                    );
                })}
            </ul>

            {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} searchParamsString={searchParamsString} labels={paginationLabels}/>
            )}
        </div>
    );
}
