'use client';

import {useTranslations} from 'next-intl';
import {PackageOpen, RotateCcw, SearchX} from 'lucide-react';
import {Link, usePathname} from '@/platform/i18n/navigation';
import {QuoteButton} from '@/features/enquiry/quote-dialog';

const FILTER_KEYS = ['facets', 'category', 'inStock'];

/**
 * No-results / empty-catalogue state for the shop, collection and search
 * listings: says honestly why nothing is shown, offers to clear the
 * filters/search, and hands off to the quote form instead of a dead end.
 */
export function ListingEmptyState({searchParamsString}: {searchParamsString: string}) {
    const t = useTranslations('Listing');
    const pathname = usePathname();
    const params = new URLSearchParams(searchParamsString);
    const term = params.get('q')?.trim() ?? '';
    const hasFilters = FILTER_KEYS.some((key) => params.has(key));
    const isFiltered = !!term || hasFilters;

    // Clearing filters keeps the search term; with only a term, clear it.
    const clearParams = new URLSearchParams(searchParamsString);
    for (const key of [...FILTER_KEYS, 'page']) clearParams.delete(key);
    const clearHref = hasFilters && clearParams.toString() ? `${pathname}?${clearParams.toString()}` : pathname;

    const Icon = isFiltered ? SearchX : PackageOpen;

    return (
        <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-card px-6 py-14 text-center sm:px-10 sm:py-20">
            <span className="frame-ticks mx-auto flex size-16 items-center justify-center rounded-xl bg-stage text-steel">
                <Icon aria-hidden="true" className="size-7" />
            </span>
            <h2 className="mx-auto mt-6 max-w-md text-balance font-display-wide text-xl font-bold sm:text-2xl">
                {term && !hasFilters ? t('emptyTitleTerm', {term}) : isFiltered ? t('emptyTitleFiltered') : t('emptyTitleCatalog')}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                {isFiltered ? t('emptyHintFiltered') : t('emptyHintCatalog')}
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                {isFiltered && (
                    <Link
                        href={clearHref}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-foreground/15 bg-card px-5 text-sm font-semibold transition-colors hover:border-foreground/40"
                    >
                        <RotateCcw aria-hidden="true" className="size-4" />
                        {hasFilters ? t('clearFilters') : t('clearSearchAndFilters')}
                    </Link>
                )}
                <QuoteButton className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 [&_svg]:size-4" />
            </div>
        </div>
    );
}
