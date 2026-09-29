'use client';

import {useDeferredValue, useEffect, useRef, useState, useTransition} from 'react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {ArrowRight, ArrowUpRight, Clock, ImageOff, Loader2, Search, X} from 'lucide-react';
import {Dialog, DialogContent, DialogDescription, DialogTitle} from '@/components/ui/dialog';
import {cn} from '@/lib/utils';
import {Link, useRouter} from '@/platform/i18n/navigation';
import {readFragment} from '@/platform/vendure/graphql';
import {ProductCardFragment} from '@/features/products/graphql';
import {getSearchSuggestions, type SearchSuggestion} from '@/features/search/suggest';
import {DiscountedPrice} from '@/features/products/discounted-price';

interface SearchCategory {
    name: string;
    slug: string;
}

interface SearchOverlayProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Real Vendure categories, offered before the shopper types. */
    categories?: SearchCategory[];
}

const RECENT_KEY = 'millnex:recent-searches';
const MAX_RECENT = 6;

function readRecent(): string[] {
    try {
        const value = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? '[]');
        return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string').slice(0, MAX_RECENT) : [];
    } catch {
        return [];
    }
}

function writeRecent(terms: string[]) {
    try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(terms.slice(0, MAX_RECENT)));
    } catch {
        // Storage unavailable (private mode, blocked) — recent searches are a convenience only.
    }
}

/**
 * Large predictive search overlay. Suggestions are live Vendure search
 * results (Vendure's search indexes product name, description, SKU and
 * facet values, so "category", "type" and SKU queries all work). Recent
 * searches live on this device only.
 */
export function SearchOverlay({open, onOpenChange, categories = []}: SearchOverlayProps) {
    const t = useTranslations('Navigation');
    const tProduct = useTranslations('Product');
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState('');
    const deferredValue = useDeferredValue(value);
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [searchedTerm, setSearchedTerm] = useState('');
    const [recent, setRecent] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (open) setRecent(readRecent());
        else {
            setValue('');
            setSuggestions([]);
            setSearchedTerm('');
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const term = deferredValue.trim();
        if (!term) {
            setSuggestions([]);
            setSearchedTerm('');
            return;
        }
        const handle = setTimeout(() => {
            startTransition(async () => {
                try {
                    const items = await getSearchSuggestions(term);
                    setSuggestions(items);
                } catch {
                    setSuggestions([]);
                }
                setSearchedTerm(term);
            });
        }, 200);
        return () => clearTimeout(handle);
    }, [deferredValue, open]);

    const remember = (term: string) => {
        const trimmed = term.trim();
        if (!trimmed) return;
        const next = [trimmed, ...recent.filter((entry) => entry.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT);
        setRecent(next);
        writeRecent(next);
    };

    const submitSearch = (term = value) => {
        const trimmed = term.trim();
        if (!trimmed) return;
        remember(trimmed);
        onOpenChange(false);
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    };

    const term = value.trim();
    const showResults = term.length > 0;
    const settled = searchedTerm === term && !isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                initialFocus={inputRef}
                className="top-4 max-h-[calc(100dvh-2rem)] w-[calc(100%-1.5rem)] max-w-3xl translate-y-0 grid-rows-[auto_minmax(0,1fr)] gap-0 sm:max-w-3xl overflow-hidden rounded-2xl p-0 sm:top-[8vh] sm:max-h-[84dvh]"
            >
                <DialogTitle className="sr-only">{t('search')}</DialogTitle>
                <DialogDescription className="sr-only">{t('searchHint')}</DialogDescription>
                <form
                    role="search"
                    onSubmit={(event) => {
                        event.preventDefault();
                        submitSearch();
                    }}
                    className="flex items-center gap-3 border-b border-border px-4 sm:px-6"
                >
                    {isPending ? <Loader2 aria-hidden="true" className="size-5 shrink-0 animate-spin text-steel" /> : <Search aria-hidden="true" className="size-5 shrink-0 text-steel" />}
                    <input
                        ref={inputRef}
                        type="search"
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        placeholder={t('searchProducts')}
                        aria-label={t('searchProducts')}
                        autoComplete="off"
                        className="h-16 min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-muted-foreground sm:h-[4.5rem] sm:text-lg [&::-webkit-search-cancel-button]:hidden"
                    />
                    <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline">Esc</kbd>
                    <button type="button" onClick={() => onOpenChange(false)} aria-label={t('closeSearch')} className="-mr-2 inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                        <X className="size-5" />
                    </button>
                </form>

                <div className="overflow-y-auto overscroll-contain p-4 sm:p-6">
                    {!showResults ? (
                        <div className="grid gap-8">
                            <p className="text-sm text-muted-foreground">{t('searchHint')}</p>
                            {recent.length > 0 && (
                                <section aria-labelledby="recent-searches">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h2 id="recent-searches" className="spec-label text-steel">{t('recentSearches')}</h2>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setRecent([]);
                                                writeRecent([]);
                                            }}
                                            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                                        >
                                            {t('clearRecent')}
                                        </button>
                                    </div>
                                    <ul className="flex flex-wrap gap-2">
                                        {recent.map((entry) => (
                                            <li key={entry}>
                                                <button
                                                    type="button"
                                                    onClick={() => submitSearch(entry)}
                                                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium transition-colors hover:border-foreground/30"
                                                >
                                                    <Clock aria-hidden="true" className="size-3.5 text-steel" />
                                                    {entry}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                            {categories.length > 0 && (
                                <section aria-labelledby="popular-categories">
                                    <h2 id="popular-categories" className="spec-label mb-3 text-steel">{t('popularCategories')}</h2>
                                    <ul className="grid gap-2 sm:grid-cols-2">
                                        {categories.map((category) => (
                                            <li key={category.slug}>
                                                <Link
                                                    href={`/collection/${category.slug}`}
                                                    onClick={() => onOpenChange(false)}
                                                    className="group/cat flex items-center justify-between gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3.5 transition-colors hover:border-foreground/25 hover:bg-card"
                                                >
                                                    <span className="min-w-0 truncate font-display font-semibold">{category.name}</span>
                                                    <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-steel transition-transform group-hover/cat:-translate-y-0.5 group-hover/cat:translate-x-0.5" />
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>
                    ) : suggestions.length > 0 ? (
                        <section aria-labelledby="matching-products">
                            <h2 id="matching-products" className="spec-label mb-3 text-steel">{t('matchingProducts')}</h2>
                            <ul className="divide-y divide-border rounded-xl border border-border">
                                {suggestions.map((item) => {
                                    const product = readFragment(ProductCardFragment, item);
                                    const price = product.priceWithTax;
                                    return (
                                        <li key={product.productId}>
                                            <Link
                                                href={`/product/${product.slug}`}
                                                onClick={() => {
                                                    remember(term);
                                                    onOpenChange(false);
                                                }}
                                                className="group/row flex items-center gap-4 px-3 py-3 transition-colors hover:bg-muted/60 sm:px-4"
                                            >
                                                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-stage sm:size-16">
                                                    {product.productAsset ? (
                                                        <Image src={`${product.productAsset.preview}?preset=thumb`} alt="" fill sizes="64px" className="object-contain mix-blend-multiply" />
                                                    ) : (
                                                        <ImageOff aria-hidden="true" className="absolute inset-0 m-auto size-4 text-muted-foreground" />
                                                    )}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate font-semibold group-hover/row:text-brand">{product.productName.trim()}</span>
                                                    <span className="spec-label block truncate text-steel">{product.sku.trim()}</span>
                                                    <span className={cn('mt-0.5 block text-xs font-medium', product.inStock ? 'text-success' : 'text-stock-out')}>
                                                        {product.inStock ? tProduct('inStock') : tProduct('outOfStock')}
                                                    </span>
                                                </span>
                                                <span className="shrink-0 text-right font-display text-sm font-bold sm:text-base">
                                                    <DiscountedPrice
                                                        value={price.__typename === 'PriceRange' ? price.min : price.__typename === 'SinglePrice' ? price.value : null}
                                                        currencyCode={product.currencyCode}
                                                        mrpFor={{slug: product.slug}}
                                                        layout="stacked"
                                                    />
                                                </span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                            <button
                                type="button"
                                onClick={() => submitSearch()}
                                className="group/btn mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-logo-blue text-sm font-semibold text-white transition-colors hover:bg-logo-blue-deep"
                            >
                                {t('seeAllResults', {term})}
                                <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                            </button>
                        </section>
                    ) : settled ? (
                        <p className="py-10 text-center text-sm text-muted-foreground" role="status">{t('searchNoResults', {term})}</p>
                    ) : (
                        <p className="py-10 text-center text-sm text-muted-foreground" aria-live="polite">{t('searching')}</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
