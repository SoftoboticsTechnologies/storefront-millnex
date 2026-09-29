'use client';

import {ChevronLeft, ChevronRight} from 'lucide-react';
import {usePathname, Link} from '@/platform/i18n/navigation';
import {cn} from '@/lib/utils';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    /**
     * Current URL search params, as a string — passed down rather than read
     * via next/navigation's useSearchParams() here, which would de-opt this
     * component (and its whole Suspense boundary) to client-side-only
     * rendering under static export. See search-params-sync.tsx.
     */
    searchParamsString: string;
    /** Localized by the listing that renders this (it owns the strings). */
    labels: PaginationLabels;
}

export interface PaginationLabels {
    nav: string;
    previous: string;
    next: string;
    page: (page: number) => string;
    pageOf: (page: number, total: number) => string;
}

const CELL = 'inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-semibold tabular-nums transition-colors';

export function Pagination({currentPage, totalPages, searchParamsString, labels}: PaginationProps) {
    const pathname = usePathname();

    const createPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParamsString);
        params.set('page', page.toString());
        return `${pathname}?${params.toString()}`;
    };

    const getPageNumbers = () => {
        const delta = 1;
        const range: number[] = [];
        const rangeWithDots: Array<number | '...'> = [];

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        let prev = 0;
        for (const i of range) {
            if (prev && i - prev > 1) rangeWithDots.push('...');
            rangeWithDots.push(i);
            prev = i;
        }
        return rangeWithDots;
    };

    const hasPrev = currentPage > 1;
    const hasNext = currentPage < totalPages;
    const edge = cn(CELL, 'gap-1.5 border border-foreground/15 bg-card');

    return (
        <nav aria-label={labels.nav} className="flex flex-col items-center gap-3 border-t border-border pt-8">
            <div className="flex items-center gap-1.5 sm:gap-2">
                {hasPrev ? (
                    <Link href={createPageUrl(currentPage - 1)} rel="prev" className={cn(edge, 'hover:border-foreground/40')}>
                        <ChevronLeft aria-hidden="true" className="size-4" />
                        <span>{labels.previous}</span>
                    </Link>
                ) : (
                    <span aria-disabled="true" className={cn(edge, 'pointer-events-none opacity-40')}>
                        <ChevronLeft aria-hidden="true" className="size-4" />
                        <span>{labels.previous}</span>
                    </span>
                )}

                <ol className="hidden items-center gap-1 sm:flex">
                    {getPageNumbers().map((page, index) =>
                        page === '...' ? (
                            <li key={`dots-${index}`} aria-hidden="true" className="px-1.5 text-sm text-steel">…</li>
                        ) : (
                            <li key={page}>
                                {page === currentPage ? (
                                    <span aria-current="page" className={cn(CELL, 'bg-logo-blue text-white')}>
                                        <span className="sr-only">{labels.page(page)}</span>
                                        <span aria-hidden="true">{page}</span>
                                    </span>
                                ) : (
                                    <Link href={createPageUrl(page)} aria-label={labels.page(page)} className={cn(CELL, 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                                        {page}
                                    </Link>
                                )}
                            </li>
                        ),
                    )}
                </ol>

                {hasNext ? (
                    <Link href={createPageUrl(currentPage + 1)} rel="next" className={cn(edge, 'hover:border-foreground/40')}>
                        <span>{labels.next}</span>
                        <ChevronRight aria-hidden="true" className="size-4" />
                    </Link>
                ) : (
                    <span aria-disabled="true" className={cn(edge, 'pointer-events-none opacity-40')}>
                        <span>{labels.next}</span>
                        <ChevronRight aria-hidden="true" className="size-4" />
                    </span>
                )}
            </div>
            <p className="spec-label text-steel">{labels.pageOf(currentPage, totalPages)}</p>
        </nav>
    );
}
