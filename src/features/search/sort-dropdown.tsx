'use client';


import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {usePathname, useRouter} from '@/platform/i18n/navigation';
import {useTranslations} from 'next-intl';
import {ArrowDownUp} from 'lucide-react';
import {cn} from '@/lib/utils';
import {DEFAULT_SORT} from '@/features/search/search-helpers';

interface SortDropdownProps {
    /**
     * Current URL search params, as a string — passed down rather than read
     * via next/navigation's useSearchParams() here, which would de-opt this
     * component (and its whole Suspense boundary) to client-side-only
     * rendering under static export. See search-params-sync.tsx.
     */
    searchParamsString: string;
    className?: string;
}

/**
 * Sort options are exactly what Vendure's SearchResultSortParameter supports
 * (name, price) plus "Featured" (no sort sent). There is no "Newest" or
 * "Availability" sort in the Shop API — see docs/decisions.md.
 */
export function SortDropdown({searchParamsString, className}: SortDropdownProps) {
    const t = useTranslations('Sort');
    const tListing = useTranslations('Listing');
    const pathname = usePathname();
    const router = useRouter();

    const sortOptions = [
        {value: 'featured', label: t('featured')},
        {value: 'name-asc', label: t('nameAsc')},
        {value: 'name-desc', label: t('nameDesc')},
        {value: 'price-asc', label: t('priceAsc')},
        {value: 'price-desc', label: t('priceDesc')},
    ];

    const currentSort = new URLSearchParams(searchParamsString).get('sort') || DEFAULT_SORT;

    const handleSortChange = (value: string | null) => {
        if (!value) return;
        // Read the live URL rather than the searchParamsString prop, which
        // can lag one render behind a filter just applied (see facet-filters.tsx).
        const params = new URLSearchParams(window.location.search);
        params.set('sort', value);
        params.delete('page'); // Reset to page 1 when sort changes
        router.push(`${pathname}?${params.toString()}`, {scroll: false});
    };

    return (
        <Select value={currentSort} onValueChange={handleSortChange} items={sortOptions}>
            <SelectTrigger
                aria-label={t('placeholder')}
                className={cn('h-11! min-w-0 gap-2 rounded-lg border-foreground/15 bg-card px-3.5 text-sm font-semibold shadow-none hover:border-foreground/35 sm:w-60', className)}
            >
                <ArrowDownUp aria-hidden="true" className="size-4 text-steel" />
                <span className="spec-label hidden text-steel sm:inline">{tListing('sortLabel')}</span>
                <SelectValue placeholder={t('placeholder')} className="min-w-0 flex-1 truncate text-left"/>
            </SelectTrigger>
            <SelectContent>
                {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
