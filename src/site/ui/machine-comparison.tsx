'use client';

import {useId, useState} from 'react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {ArrowUpRight, ImageOff, Minus} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Link} from '@/platform/i18n/navigation';
import {QuoteButton} from '@/features/enquiry/quote-dialog';
import {ProductCardPrice} from '@/features/products/product-price-client';
import type {ComparisonGroup} from '@/site/home/comparison-data';

/**
 * Side-by-side machine comparison, one tab per Vendure collection. Rows are
 * built only from fields Vendure actually has — price (live), availability,
 * each facet present on any product in the group, SKU and variants — so a
 * spec that isn't in the catalog never appears (shown as "—" where one
 * product lacks a facet another has).
 */
export function MachineComparison({groups}: {groups: ComparisonGroup[]}) {
    const t = useTranslations('Home');
    const tProduct = useTranslations('Product');
    const id = useId();
    const [active, setActive] = useState(0);

    if (groups.length === 0) return null;
    const group = groups[Math.min(active, groups.length - 1)];
    const facetNames = [...new Set(group.products.flatMap((product) => product.specs.map((spec) => spec.facet)))];
    const hasVariants = group.products.some((product) => product.variantNames.length > 0);

    const rowLabel = 'sticky left-0 z-10 w-36 min-w-36 bg-card px-4 py-3.5 text-left align-top text-xs font-semibold uppercase tracking-[0.08em] text-steel sm:w-44 sm:min-w-44';
    const cell = 'min-w-48 border-l border-border px-4 py-3.5 align-top text-sm';

    return (
        <div>
            {groups.length > 1 && (
                <div role="tablist" aria-label={t('compareTabs')} className="mb-6 flex gap-2 overflow-x-auto [scrollbar-width:none]">
                    {groups.map((entry, index) => (
                        <button
                            key={entry.slug}
                            type="button"
                            role="tab"
                            id={`${id}-tab-${index}`}
                            aria-selected={index === active}
                            aria-controls={`${id}-panel`}
                            onClick={() => setActive(index)}
                            className={cn(
                                'inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors',
                                index === active ? 'border-logo-blue bg-logo-blue text-white' : 'border-border bg-card hover:border-foreground/30',
                            )}
                        >
                            {entry.name}
                        </button>
                    ))}
                </div>
            )}

            <div
                id={`${id}-panel`}
                role={groups.length > 1 ? 'tabpanel' : undefined}
                aria-labelledby={groups.length > 1 ? `${id}-tab-${active}` : undefined}
                // contain:paint — without it mobile Chrome counts the table's
                // absolutely positioned images toward the page width (the page
                // zoomed out to ~818px at 390px), despite the scroll box.
                className="overflow-x-auto rounded-2xl border border-border bg-card [contain:paint]"
            >
                <table className="w-full border-collapse">
                    <caption className="sr-only">{t('compareCaption', {category: group.name})}</caption>
                    <thead>
                        <tr className="border-b border-border">
                            <th scope="col" className={cn(rowLabel, 'align-bottom')}>{t('compareMachine')}</th>
                            {group.products.map((product) => (
                                <th key={product.productId} scope="col" className={cn(cell, 'text-left font-normal')}>
                                    <Link href={`/product/${product.slug}`} className="group/col block">
                                        <span className="relative block aspect-square w-full max-w-40 overflow-hidden rounded-lg bg-stage">
                                            {product.imageUrl ? (
                                                <Image src={`${product.imageUrl}?preset=small`} alt="" fill sizes="160px" className="object-contain p-2 mix-blend-multiply transition-transform duration-500 group-hover/col:scale-105" />
                                            ) : (
                                                <ImageOff aria-hidden="true" className="absolute inset-0 m-auto size-5 text-muted-foreground" />
                                            )}
                                        </span>
                                        <span className="mt-3 line-clamp-2 font-display text-[15px] font-semibold leading-snug group-hover/col:text-brand">{product.name}</span>
                                    </Link>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        <tr>
                            <th scope="row" className={rowLabel}>{t('comparePrice')}</th>
                            {group.products.map((product) => (
                                <td key={product.productId} className={cn(cell, 'font-display text-base font-bold')}>
                                    {product.price ? <ProductCardPrice slug={product.slug} initial={product.price} /> : <Minus aria-label="—" className="size-4 text-steel" />}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <th scope="row" className={rowLabel}>{t('compareAvailability')}</th>
                            {group.products.map((product) => (
                                <td key={product.productId} className={cn(cell, 'font-semibold', product.inStock ? 'text-success' : 'text-stock-out')}>
                                    {product.inStock ? tProduct('inStock') : tProduct('outOfStock')}
                                </td>
                            ))}
                        </tr>
                        {facetNames.map((facet) => (
                            <tr key={facet}>
                                <th scope="row" className={rowLabel}>{facet}</th>
                                {group.products.map((product) => {
                                    const values = product.specs.find((spec) => spec.facet === facet)?.values;
                                    return (
                                        <td key={product.productId} className={cell}>
                                            {values?.length ? values.join(', ') : <Minus aria-label="—" className="size-4 text-steel" />}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        {hasVariants && (
                            <tr>
                                <th scope="row" className={rowLabel}>{t('compareVariants')}</th>
                                {group.products.map((product) => (
                                    <td key={product.productId} className={cell}>
                                        {product.variantNames.length ? product.variantNames.join(', ') : <Minus aria-label="—" className="size-4 text-steel" />}
                                    </td>
                                ))}
                            </tr>
                        )}
                        <tr>
                            <th scope="row" className={rowLabel}>{t('compareSku')}</th>
                            {group.products.map((product) => (
                                <td key={product.productId} className={cn(cell, 'font-mono text-xs text-muted-foreground')}>
                                    {product.skus.join(' / ') || <Minus aria-label="—" className="size-4 text-steel" />}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td className={rowLabel} />
                            {group.products.map((product) => (
                                <td key={product.productId} className={cell}>
                                    <div className="flex flex-col gap-2">
                                        <Link
                                            href={`/product/${product.slug}`}
                                            className="group/btn inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-logo-blue px-3 text-sm font-semibold text-white transition-colors hover:bg-logo-blue-deep"
                                        >
                                            {tProduct('viewDetails')}
                                            <ArrowUpRight aria-hidden="true" className="size-4" />
                                        </Link>
                                        {!product.inStock && (
                                            <QuoteButton product={product.slug} hideIcon className="inline-flex h-10 items-center justify-center rounded-lg border border-foreground/15 px-3 text-sm font-semibold hover:border-foreground/35">
                                                {tProduct('askAvailability')}
                                            </QuoteButton>
                                        )}
                                    </div>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{t('compareNote')}</p>
        </div>
    );
}
