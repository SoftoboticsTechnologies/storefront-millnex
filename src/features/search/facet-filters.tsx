'use client';

import {use, useMemo, useState, type ReactNode} from 'react';
import {useTranslations} from 'next-intl';
import {ChevronDown, SlidersHorizontal, X} from 'lucide-react';
import {usePathname, useRouter} from '@/platform/i18n/navigation';
import {ResultOf} from '@/platform/vendure/graphql';
import {cn} from '@/lib/utils';
import {Checkbox} from '@/components/ui/checkbox';
import {Switch} from '@/components/ui/switch';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription} from '@/components/ui/sheet';
import {Collapsible, CollapsibleTrigger, CollapsibleContent} from '@/components/ui/collapsible';
import {SearchProductsQuery} from '@/features/search/graphql';

type SearchData = ResultOf<typeof SearchProductsQuery>;
type ProductDataPromise = Promise<{data: SearchData; token?: string}>;

export interface FilterCategory {
    name: string;
    slug: string;
}

/**
 * Every facet value seen in any result for this listing so far (value id →
 * names). Vendure's `facetValues` only lists values present in the *current*
 * result set, so without this a selected value that now matches nothing
 * would vanish from the sidebar (and its chip would have no label) — leaving
 * no way to untick it except "Clear all".
 */
export type FacetValueIndex = Record<string, {id: string; name: string; facetId: string; facetName: string}>;

export function indexFacetValues(prev: FacetValueIndex, facetValues: SearchData['search']['facetValues']): FacetValueIndex {
    let next: FacetValueIndex | null = null;
    for (const {facetValue} of facetValues) {
        if (prev[facetValue.id]) continue;
        next ??= {...prev};
        next[facetValue.id] = {
            id: facetValue.id,
            name: facetValue.name,
            facetId: facetValue.facet.id,
            facetName: facetValue.facet.name,
        };
    }
    return next ?? prev;
}

interface FacetGroup {
    id: string;
    name: string;
    values: Array<{id: string; name: string; count: number}>;
}

function buildFacetGroups(
    facetValues: SearchData['search']['facetValues'],
    selectedValueIds: string[],
    facetIndex: FacetValueIndex,
): FacetGroup[] {
    const groups = new Map<string, FacetGroup>();
    const group = (id: string, name: string) => {
        let existing = groups.get(id);
        if (!existing) {
            existing = {id, name, values: []};
            groups.set(id, existing);
        }
        return existing;
    };

    for (const item of facetValues) {
        group(item.facetValue.facet.id, item.facetValue.facet.name).values.push({
            id: item.facetValue.id,
            name: item.facetValue.name,
            count: item.count,
        });
    }
    // Keep selected values visible (with a 0 count) even when the current
    // result no longer contains them, so they can be unticked in place.
    for (const valueId of selectedValueIds) {
        const known = facetIndex[valueId];
        if (!known) continue;
        const target = group(known.facetId, known.facetName);
        if (!target.values.some((value) => value.id === valueId)) {
            target.values.push({id: known.id, name: known.name, count: 0});
        }
    }
    return Array.from(groups.values());
}

/**
 * URL-backed filter state and actions shared by the sidebar, the mobile
 * sheet and the active-filter chips. State is derived from the
 * `searchParamsString` prop (never next/navigation's useSearchParams() — see
 * search-params-sync.tsx); writes read the live `window.location.search` so a
 * filter clicked right after another lands on top of it instead of racing a
 * one-render-stale prop. URL encoding is unchanged: `facets=<facetId>:<valueId>`
 * (repeatable — OR within a facet, AND across facets, see search-helpers.ts),
 * `category=<slug>` (repeatable) and `inStock=1`; every change resets `page`.
 */
export function useCatalogFilters(searchParamsString: string) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useMemo(() => new URLSearchParams(searchParamsString), [searchParamsString]);

    const facetEntries = searchParams.getAll('facets');
    const selectedFacetValues = facetEntries.map((entry) => entry.split(':')[1]).filter(Boolean);
    const selectedCategories = searchParams.getAll('category');
    const inStockOnly = searchParams.get('inStock') === '1';

    const push = (mutate: (params: URLSearchParams) => void) => {
        const params = new URLSearchParams(window.location.search);
        mutate(params);
        params.delete('page');
        const qs = params.toString();
        // scroll: false — refining a listing shouldn't jump back above the band.
        router.push(qs ? `${pathname}?${qs}` : pathname, {scroll: false});
    };

    const toggleRepeatable = (key: string, value: string) => push((params) => {
        const current = params.getAll(key);
        params.delete(key);
        const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
        next.forEach((v) => params.append(key, v));
    });

    return {
        facetEntries,
        selectedFacetValues,
        selectedCategories,
        inStockOnly,
        activeFilterCount: selectedFacetValues.length + selectedCategories.length + (inStockOnly ? 1 : 0),
        toggleFacetValue: (facetId: string, facetValueId: string) => toggleRepeatable('facets', `${facetId}:${facetValueId}`),
        toggleCategory: (slug: string) => toggleRepeatable('category', slug),
        toggleInStock: () => push((params) => {
            if (params.get('inStock') === '1') params.delete('inStock');
            else params.set('inStock', '1');
        }),
        clearFilters: () => push((params) => {
            params.delete('facets');
            params.delete('category');
            params.delete('inStock');
        }),
    };
}

type CatalogFilters = ReturnType<typeof useCatalogFilters>;

interface FilterSourceProps {
    productDataPromise: ProductDataPromise;
    /**
     * Current URL search params, as a string — passed down rather than read
     * via next/navigation's useSearchParams() here, which would de-opt this
     * component (and its whole Suspense boundary) to client-side-only
     * rendering under static export. See search-params-sync.tsx.
     */
    searchParamsString: string;
    /**
     * Categories (Vendure collections) offered as a filter on unscoped
     * listings (shop, search). Omit on a collection page, which is already
     * scoped to one collection.
     */
    categories?: FilterCategory[];
    facetIndex: FacetValueIndex;
}

function useFilterModel({productDataPromise, searchParamsString, categories = [], facetIndex}: FilterSourceProps) {
    const searchResult = use(productDataPromise).data.search;
    const filters = useCatalogFilters(searchParamsString);
    const facetGroups = buildFacetGroups(searchResult.facetValues, filters.selectedFacetValues, facetIndex);
    // Nothing to narrow down: no facets, and the listing is empty without an
    // availability filter already applied.
    const hasNothingToFilter = facetGroups.length === 0 && categories.length === 0 && searchResult.totalItems === 0 && !filters.inStockOnly;
    return {filters, facetGroups, categories, totalItems: searchResult.totalItems, hasNothingToFilter};
}

function FilterSection({title, children, defaultOpen = true}: {title: string; children: ReactNode; defaultOpen?: boolean}) {
    return (
        <Collapsible defaultOpen={defaultOpen} className="py-4 first:pt-0 last:pb-0">
            <CollapsibleTrigger className="group/trigger flex w-full items-center justify-between gap-3 py-1 text-left outline-none focus-visible:text-brand">
                <span className="spec-label text-foreground">{title}</span>
                <ChevronDown aria-hidden="true" className="size-4 text-steel transition-transform duration-200 [[data-panel-open]_&]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="pt-3">{children}</div>
            </CollapsibleContent>
        </Collapsible>
    );
}

function OptionRow({id, label, count, checked, onToggle}: {id: string; label: string; count?: number; checked: boolean; onToggle: () => void}) {
    return (
        <div className={cn('flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/70', checked && 'bg-muted/60')}>
            <Checkbox id={id} checked={checked} onCheckedChange={onToggle} />
            <Label htmlFor={id} className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 text-sm font-normal leading-snug">
                <span className={cn('min-w-0', checked && 'font-semibold')}>{label}</span>
                {count !== undefined && <span className="spec-label shrink-0 text-steel">{count}</span>}
            </Label>
        </div>
    );
}

function FilterPanel({
    idPrefix,
    filters,
    facetGroups,
    categories,
}: {
    idPrefix: string;
    filters: CatalogFilters;
    facetGroups: FacetGroup[];
    categories: FilterCategory[];
}) {
    const t = useTranslations('Filters');

    return (
        <div className="divide-y divide-border">
            {categories.length > 0 && (
                <FilterSection title={t('categories')}>
                    <div className="-mx-2 space-y-0.5">
                        {categories.map((category) => (
                            <OptionRow
                                key={category.slug}
                                id={`${idPrefix}-category-${category.slug}`}
                                label={category.name}
                                checked={filters.selectedCategories.includes(category.slug)}
                                onToggle={() => filters.toggleCategory(category.slug)}
                            />
                        ))}
                    </div>
                </FilterSection>
            )}

            {facetGroups.map((facet) => (
                <FilterSection key={facet.id} title={facet.name}>
                    <div className="-mx-2 space-y-0.5">
                        {facet.values.map((value) => (
                            <OptionRow
                                key={value.id}
                                id={`${idPrefix}-facet-${value.id}`}
                                label={value.name}
                                checked={filters.selectedFacetValues.includes(value.id)}
                                onToggle={() => filters.toggleFacetValue(facet.id, value.id)}
                            />
                        ))}
                    </div>
                </FilterSection>
            ))}

            <FilterSection title={t('availability')}>
                <div className="flex items-center justify-between gap-4">
                    <Label htmlFor={`${idPrefix}-in-stock`} className="flex cursor-pointer flex-col items-start gap-0.5">
                        <span className="text-sm font-medium">{t('inStockOnly')}</span>
                        <span className="text-xs font-normal text-muted-foreground">{t('inStockHint')}</span>
                    </Label>
                    <Switch id={`${idPrefix}-in-stock`} checked={filters.inStockOnly} onCheckedChange={filters.toggleInStock} />
                </div>
            </FilterSection>
        </div>
    );
}

/** Desktop (lg+) sticky filter sidebar. */
export function FacetFilterSidebar(props: FilterSourceProps) {
    const t = useTranslations('Filters');
    const {filters, facetGroups, categories, hasNothingToFilter} = useFilterModel(props);

    if (hasNothingToFilter) return null;

    return (
        <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                    <SlidersHorizontal aria-hidden="true" className="size-4 text-steel" />
                    {t('title')}
                    {filters.activeFilterCount > 0 && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-brand-foreground">
                            {filters.activeFilterCount}
                        </span>
                    )}
                </h2>
                {filters.activeFilterCount > 0 && (
                    <button type="button" onClick={filters.clearFilters} className="text-xs font-semibold text-brand underline-offset-4 hover:underline">
                        {t('clearAll')}
                    </button>
                )}
            </div>
            <div className="px-5 py-5">
                <FilterPanel idPrefix="sidebar" filters={filters} facetGroups={facetGroups} categories={categories} />
            </div>
        </div>
    );
}

/**
 * Mobile/tablet (< lg) "Filters" toolbar button + left drawer. The drawer
 * stays open while filters apply — the listing refetches in a transition
 * (see catalog-results.tsx), so this component isn't unmounted meanwhile —
 * and its footer reports the live result count.
 */
export function FacetFilterSheet({className, pending, ...props}: FilterSourceProps & {className?: string; pending?: boolean}) {
    const t = useTranslations('Filters');
    const {filters, facetGroups, categories, hasNothingToFilter} = useFilterModel(props);
    const [open, setOpen] = useState(false);

    if (hasNothingToFilter) return null;

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
                render={
                    <Button variant="outline" className={cn('h-11 gap-2 rounded-lg border-foreground/15 bg-card px-4 font-semibold', className)}>
                        <SlidersHorizontal aria-hidden="true" className="size-4" />
                        {t('filtersButton')}
                        {filters.activeFilterCount > 0 && (
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-brand-foreground">
                                {filters.activeFilterCount}
                            </span>
                        )}
                    </Button>
                }
            />
            <SheetContent side="left" className="w-[88vw] gap-0 p-0 data-[side=left]:max-w-sm">
                <SheetHeader className="border-b border-border px-5 py-4 pr-14">
                    <SheetTitle className="text-lg font-semibold">{t('title')}</SheetTitle>
                    <SheetDescription className="text-xs">{t('refine')}</SheetDescription>
                </SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
                    <FilterPanel idPrefix="sheet" filters={filters} facetGroups={facetGroups} categories={categories} />
                </div>
                <div className="flex gap-2 border-t border-border bg-card px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 flex-1 rounded-lg font-semibold"
                        disabled={filters.activeFilterCount === 0}
                        onClick={filters.clearFilters}
                    >
                        {t('clearAll')}
                    </Button>
                    <Button
                        type="button"
                        className={cn('h-11 flex-[1.4] rounded-lg bg-logo-blue font-semibold text-white hover:bg-logo-blue-deep', pending && 'opacity-70')}
                        aria-live="polite"
                        onClick={() => setOpen(false)}
                    >
                        {t('viewResults')}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

/**
 * Removable chips for every active filter, plus "Clear all". Labels come
 * from the real category list and the facet-value index — never invented.
 */
export function ActiveFilterChips({searchParamsString, categories = [], facetIndex}: Omit<FilterSourceProps, 'productDataPromise'>) {
    const t = useTranslations('Filters');
    const filters = useCatalogFilters(searchParamsString);

    if (filters.activeFilterCount === 0) return null;

    const chips: Array<{key: string; label: string; onRemove: () => void}> = [];
    for (const slug of filters.selectedCategories) {
        const name = categories.find((category) => category.slug === slug)?.name ?? slug;
        chips.push({key: `category-${slug}`, label: name, onRemove: () => filters.toggleCategory(slug)});
    }
    for (const entry of filters.facetEntries) {
        const [facetId, valueId] = entry.split(':');
        const known = valueId ? facetIndex[valueId] : undefined;
        if (!facetId || !known) continue;
        chips.push({key: `facet-${entry}`, label: known.name, onRemove: () => filters.toggleFacetValue(facetId, valueId)});
    }
    if (filters.inStockOnly) {
        chips.push({key: 'in-stock', label: t('inStockChip'), onRemove: filters.toggleInStock});
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="spec-label mr-1 text-steel">{t('activeFilters')}</span>
            {chips.map((chip) => (
                <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onRemove}
                    aria-label={t('removeFilter', {label: chip.label})}
                    className="group/chip inline-flex h-8 max-w-full items-center gap-1.5 rounded-md border border-foreground/15 bg-card pl-3 pr-2 text-xs font-semibold transition-colors hover:border-foreground/40"
                >
                    <span className="truncate">{chip.label}</span>
                    <X aria-hidden="true" className="size-3.5 shrink-0 text-steel transition-colors group-hover/chip:text-brand" />
                </button>
            ))}
            <button type="button" onClick={filters.clearFilters} className="ml-1 text-xs font-semibold text-brand underline-offset-4 hover:underline">
                {t('clearAll')}
            </button>
        </div>
    );
}
