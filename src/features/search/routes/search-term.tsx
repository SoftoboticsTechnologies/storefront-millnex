'use client';

import {useSearchParams} from 'next/navigation';
import {useTranslations} from 'next-intl';

export function SearchTerm() {
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get('q') ?? '';
    const t = useTranslations('Search');

    return (
        <div className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {searchTerm ? t('resultsFor', {query: searchTerm}) : t('title')}
            </h1>
        </div>
    )
}

export function SearchTermSkeleton() {
    return (
        <div className="mb-6">
            <div className="h-9 w-64 rounded bg-muted animate-pulse" />
        </div>
    )
}
