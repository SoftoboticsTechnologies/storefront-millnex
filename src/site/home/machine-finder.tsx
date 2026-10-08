'use client';

import {useEffect, useState} from 'react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {ArrowLeft, ArrowRight, ArrowUpRight, Check, ImageOff, Loader2, RotateCcw} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Link} from '@/platform/i18n/navigation';
import {readFragment} from '@/platform/vendure/graphql';
import {ProductCardFragment} from '@/features/products/graphql';
import {getSearchSuggestions, type SearchSuggestion} from '@/features/search/suggest';
import {DiscountedPrice} from '@/features/products/discounted-price';
import {useQuote} from '@/features/enquiry/quote-dialog';
import {FINDER_COPY} from '@/site/content/home';

type StepKey = keyof typeof FINDER_COPY.steps;
const STEP_ORDER: StepKey[] = ['use', 'material', 'volume'];

type Answers = Partial<Record<StepKey, string>>;

function optionLabel(step: StepKey, value: string | undefined): string | undefined {
    return (FINDER_COPY.steps[step].options as ReadonlyArray<{value: string; label: string}>).find((option) => option.value === value)?.label;
}

/**
 * Guided "find your machine" selector. Answers map to a live Vendure search
 * (the material's `searchTerm`, see FINDER_COPY) — the results are whatever
 * the store lists for it, never a hardcoded recommendation. Usage and
 * volume aren't product data, so they go to the quote request as text.
 */
export function MachineFinder() {
    const t = useTranslations('Home');
    const tProduct = useTranslations('Product');
    const {openQuote} = useQuote();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Answers>({});
    const [results, setResults] = useState<SearchSuggestion[] | null>(null);
    const [failed, setFailed] = useState(false);

    const done = step >= STEP_ORDER.length;
    const material = FINDER_COPY.steps.material.options.find((option) => option.value === answers.material);

    useEffect(() => {
        if (!done || !material) return;
        let cancelled = false;
        setResults(null);
        setFailed(false);
        getSearchSuggestions(material.searchTerm)
            .then((items) => !cancelled && setResults(items))
            .catch(() => !cancelled && setFailed(true));
        return () => {
            cancelled = true;
        };
    }, [done, material]);

    const choose = (key: StepKey, value: string) => {
        setAnswers((current) => ({...current, [key]: value}));
        setStep((current) => current + 1);
    };
    const reset = () => {
        setAnswers({});
        setStep(0);
        setResults(null);
    };

    const requirement = STEP_ORDER
        .map((key) => {
            const label = optionLabel(key, answers[key]);
            return label ? `${FINDER_COPY.steps[key].question} ${label}` : null;
        })
        .filter(Boolean)
        .join('\n');

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_40px_80px_-60px_rgb(15_20_30/0.5)]">
            {/* Stepper */}
            <ol className="grid grid-cols-3 border-b border-border">
                {STEP_ORDER.map((key, index) => {
                    const state = index < step ? 'done' : index === step ? 'current' : 'upcoming';
                    return (
                        <li key={key} className={cn('relative px-3 py-4 sm:px-6', index > 0 && 'border-l border-border')}>
                            <button
                                type="button"
                                disabled={state === 'upcoming'}
                                onClick={() => setStep(index)}
                                aria-current={state === 'current' ? 'step' : undefined}
                                className="flex w-full items-center gap-3 text-left disabled:cursor-default"
                            >
                                <span
                                    className={cn(
                                        'flex size-8 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold transition-colors',
                                        state === 'done' && 'bg-logo-green-deep text-white',
                                        state === 'current' && 'bg-brand text-brand-foreground',
                                        state === 'upcoming' && 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    {state === 'done' ? <Check aria-hidden="true" className="size-4" /> : String(index + 1).padStart(2, '0')}
                                </span>
                                <span className="hidden min-w-0 sm:block">
                                    <span className="spec-label block text-steel">{t('finderStep', {current: index + 1, total: STEP_ORDER.length})}</span>
                                    <span className="block truncate text-sm font-semibold">{optionLabel(key, answers[key]) ?? FINDER_COPY.steps[key].question}</span>
                                </span>
                            </button>
                            <span
                                aria-hidden="true"
                                className={cn('absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand transition-transform duration-500', index < step ? 'scale-x-100' : 'scale-x-0')}
                            />
                        </li>
                    );
                })}
            </ol>

            <div className="p-5 sm:p-8 lg:p-10">
                {!done ? (
                    <fieldset key={STEP_ORDER[step]} className="animate-fade-up">
                        <legend className="font-display-wide text-2xl font-bold sm:text-3xl">{FINDER_COPY.steps[STEP_ORDER[step]].question}</legend>
                        <div className={cn('mt-6 grid gap-3', STEP_ORDER[step] === 'material' ? 'grid-cols-2 sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4')}>
                            {(FINDER_COPY.steps[STEP_ORDER[step]].options as ReadonlyArray<{value: string; label: string; hint?: string}>).map((option) => {
                                const selected = answers[STEP_ORDER[step]] === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => choose(STEP_ORDER[step], option.value)}
                                        className={cn(
                                            'group/opt flex min-h-20 flex-col justify-between gap-2 rounded-xl border p-4 text-left transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/35',
                                            selected ? 'border-brand bg-brand/5' : 'border-border bg-surface/50',
                                        )}
                                    >
                                        <span className="flex items-start justify-between gap-2">
                                            <span className="font-semibold leading-snug">{option.label}</span>
                                            <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-steel transition-transform group-hover/opt:translate-x-0.5" />
                                        </span>
                                        {option.hint && <span className="text-xs text-muted-foreground">{option.hint}</span>}
                                    </button>
                                );
                            })}
                        </div>
                        {step > 0 && (
                            <button type="button" onClick={() => setStep(step - 1)} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
                                <ArrowLeft aria-hidden="true" className="size-4" />
                                {t('finderBack')}
                            </button>
                        )}
                    </fieldset>
                ) : (
                    <div className="animate-fade-up" aria-live="polite">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="spec-label text-brand">{t('finderRecommended')}</p>
                                <h3 className="mt-2 font-display-wide text-2xl font-bold sm:text-3xl">
                                    {t('finderResultsFor', {material: material?.label ?? ''})}
                                </h3>
                            </div>
                            <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-muted-foreground hover:text-foreground sm:self-auto">
                                <RotateCcw aria-hidden="true" className="size-4" />
                                {t('finderStartOver')}
                            </button>
                        </div>

                        {results === null && !failed ? (
                            <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                                {t('finderSearching')}
                            </p>
                        ) : results && results.length > 0 ? (
                            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {results.slice(0, 3).map((item) => {
                                    const product = readFragment(ProductCardFragment, item);
                                    const price = product.priceWithTax;
                                    return (
                                        <li key={product.productId}>
                                            <Link href={`/product/${product.slug}`} className="group/res flex items-center gap-4 rounded-xl border border-border p-3 transition-colors hover:border-foreground/25">
                                                <span className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-stage">
                                                    {product.productAsset ? (
                                                        <Image src={`${product.productAsset.preview}?preset=small`} alt="" fill sizes="80px" className="object-contain mix-blend-multiply" />
                                                    ) : (
                                                        <ImageOff aria-hidden="true" className="absolute inset-0 m-auto size-5 text-muted-foreground" />
                                                    )}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="line-clamp-2 text-sm font-semibold group-hover/res:text-brand">{product.productName.trim()}</span>
                                                    <span className="mt-1 block font-display text-sm font-bold">
                                                        <DiscountedPrice
                                                            value={price.__typename === 'PriceRange' ? price.min : price.__typename === 'SinglePrice' ? price.value : null}
                                                            currencyCode={product.currencyCode}
                                                            mrpFor={{slug: product.slug}}
                                                        />
                                                    </span>
                                                    <span className={cn('text-xs font-medium', product.inStock ? 'text-success' : 'text-stock-out')}>
                                                        {product.inStock ? tProduct('inStock') : tProduct('outOfStock')}
                                                    </span>
                                                </span>
                                                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-steel" />
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="mt-6 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">{t('finderNoMatch')}</p>
                        )}

                        <div className="mt-8 flex flex-col gap-4 rounded-xl bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{FINDER_COPY.resultNote}</p>
                            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                                {material && (
                                    <Link
                                        href={`/search?q=${encodeURIComponent(material.searchTerm)}`}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-foreground/15 bg-card px-4 text-sm font-semibold hover:border-foreground/35"
                                    >
                                        {t('finderSeeAll')}
                                    </Link>
                                )}
                                <button
                                    type="button"
                                    onClick={() => openQuote({message: requirement, intent: 'quote'})}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-[oklch(0.52_0.17_37)]"
                                >
                                    {t('finderQuote')}
                                    <ArrowRight aria-hidden="true" className="size-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
