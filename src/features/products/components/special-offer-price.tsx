'use client';

import {useTranslations} from 'next-intl';
import {BadgePercent} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Price} from '@/features/pricing/price';
import {resolveReferencePrice} from '@/features/pricing/display-price';
import {useMrp} from '@/features/pricing/mrp-context';

interface SpecialOfferPriceProps {
    slug: string;
    variantId: string;
    /** The variant's real Vendure priceWithTax (minor units) — the price charged at checkout. */
    price: number;
    currencyCode: string;
    className?: string;
}

/**
 * "Special offer price" summary at the end of the PDP's product content:
 * MRP (struck through) → offer price (the real Vendure price) → saving.
 * Rendered only when the variant has a Vendure MRP above its price — never
 * for the generated ×1.10 reference price, which makes no saving claim.
 */
export function SpecialOfferPrice({slug, variantId, price, currencyCode, className}: SpecialOfferPriceProps) {
    const t = useTranslations('Product');
    const mrp = useMrp({slug, variantId}, currencyCode);
    const reference = resolveReferencePrice(price, mrp);

    if (!reference || reference.saving === null) return null;

    return (
        <section aria-labelledby="special-offer-title" className={cn('overflow-hidden rounded-2xl border border-border bg-card', className)}>
            <div className="flex items-center gap-3 border-b border-border bg-tint-green px-5 py-4 sm:px-6">
                <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-logo-green-deep shadow-sm">
                    <BadgePercent className="size-5" />
                </span>
                <h3 id="special-offer-title" className="font-display-wide text-lg font-bold sm:text-xl">{t('specialOfferTitle')}</h3>
            </div>
            <dl className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="px-5 py-4 sm:px-6 sm:py-5">
                    <dt className="text-sm font-medium text-muted-foreground">{t('mrpLabel')}</dt>
                    <dd className="mt-1 text-xl font-semibold tabular-nums text-muted-foreground line-through decoration-1">
                        <Price value={reference.original} currencyCode={currencyCode} />
                    </dd>
                </div>
                <div className="px-5 py-4 sm:px-6 sm:py-5">
                    <dt className="text-sm font-medium text-muted-foreground">{t('offerPriceLabel')}</dt>
                    <dd className="mt-1 font-display text-2xl font-bold tabular-nums text-foreground sm:text-[1.75rem]">
                        <Price value={price} currencyCode={currencyCode} />
                    </dd>
                </div>
                <div className="px-5 py-4 sm:px-6 sm:py-5">
                    <dt className="text-sm font-medium text-muted-foreground">{t('youSaveLabel')}</dt>
                    <dd className="mt-1 text-xl font-bold tabular-nums text-success">
                        <Price value={reference.saving} currencyCode={currencyCode} />
                    </dd>
                </div>
            </dl>
            <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground sm:px-6">{t('offerInclTax')}</p>
        </section>
    );
}
