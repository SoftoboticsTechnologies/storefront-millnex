'use client';

import {useCallback, useState} from 'react';
import {useTranslations} from 'next-intl';
import {SearchParamsSync} from '@/features/search/search-params-sync';

/**
 * The search page's headline text ("Results for “term”"). Reads `?q=` via the
 * invisible SearchParamsSync (not useSearchParams() here), so the exported
 * HTML still carries the generic heading instead of a client-only bailout.
 */
export function SearchTerm() {
    const t = useTranslations('Search');
    const [term, setTerm] = useState('');
    const handleChange = useCallback((value: string) => {
        setTerm(new URLSearchParams(value).get('q')?.trim() ?? '');
    }, []);

    return (
        <>
            <SearchParamsSync onChange={handleChange} />
            {term ? t('headingFor', {query: term}) : t('heading')}
        </>
    );
}
