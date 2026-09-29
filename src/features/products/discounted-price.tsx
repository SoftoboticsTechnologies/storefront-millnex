'use client';

import type {ReactNode} from 'react';
import {useTranslations} from 'next-intl';
import {cn} from '@/lib/utils';
import {Price} from '@/features/pricing/price';
import {resolveReferencePrice} from '@/features/pricing/display-price';
import {useMrp, type MrpLookup} from '@/features/pricing/mrp-context';

interface DiscountedPriceProps {
    /** The real Vendure price (minor units) — the price the customer pays. */
    value: number | null | undefined;
    currencyCode: string;
    /**
     * Which product/variant this price belongs to, so its Vendure MRP (if
     * any) can be shown. Without it only the ×1.10 reference price is used.
     */
    mrpFor?: MrpLookup;
    /** Optional lead-in before the selling price, e.g. "From" on a price range. */
    prefix?: ReactNode;
    /** `stacked` puts the struck-through price above the selling price (right-aligned lists). */
    layout?: 'inline' | 'stacked';
    /** Rendered when there is no usable price (missing/zero) — never a fake ₹0. */
    fallback?: ReactNode;
    className?: string;
}

/**
 * The single place a product price is shown with its struck-through
 * reference price (`resolveReferencePrice`): the product's real Vendure MRP
 * plus a "Save ₹X" line when it has one, otherwise the ×1.10 display price
 * with no saving claim. Sizes are `em`-relative so the caller's text size
 * sets the scale; the muted strikethrough uses `currentColor`.
 *
 * Presentation only: `value` is never altered, and cart/checkout/order
 * components keep using `Price` with the real line/order amounts.
 */
export function DiscountedPrice({value, currencyCode, mrpFor, prefix, layout = 'inline', fallback = null, className}: DiscountedPriceProps) {
    const t = useTranslations('Product');
    const mrp = useMrp(mrpFor, currencyCode);

    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        return <>{fallback}</>;
    }

    const reference = resolveReferencePrice(value, mrp);
    const stacked = layout === 'stacked';

    return (
        <span className={cn('inline-flex max-w-full flex-col', stacked ? 'items-end leading-tight' : 'items-start', className)}>
            <span className={cn('inline-flex max-w-full', stacked ? 'flex-col items-end' : 'flex-wrap items-baseline gap-x-2 gap-y-0.5')}>
                {reference && (
                    <s className="whitespace-nowrap text-[0.68em] font-medium tabular-nums tracking-normal opacity-60 decoration-1">
                        <span className="sr-only">{t(reference.saving !== null ? 'mrpLabel' : 'originalPrice')} </span>
                        <Price value={reference.original} currencyCode={currencyCode} />
                    </s>
                )}
                <span className="whitespace-nowrap tabular-nums">
                    {reference && <span className="sr-only">{t('sellingPrice')} </span>}
                    {prefix}
                    <Price value={value} currencyCode={currencyCode} />
                </span>
            </span>
            {reference?.saving != null && (
                <span className="mt-1 whitespace-nowrap font-sans text-[max(0.75rem,0.5em)] font-semibold leading-none tracking-normal text-success">
                    {t.rich('saveAmount', {price: () => <Price value={reference.saving!} currencyCode={currencyCode} />})}
                </span>
            )}
        </span>
    );
}
