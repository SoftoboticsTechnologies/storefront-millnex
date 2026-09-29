'use client';

import {useTranslations} from 'next-intl';
import {cn} from '@/lib/utils';
import {Price} from '@/features/pricing/price';
import type {ActiveOrder} from '@/features/cart/active-order';

type Totals = Pick<ActiveOrder, 'currencyCode' | 'subTotalWithTax' | 'shippingWithTax' | 'total' | 'totalWithTax' | 'discounts'>;

/**
 * Order totals exactly as Vendure computed them. Tax is Vendure's own
 * `totalWithTax − total` (prices are shown tax-inclusive), displayed only
 * when non-zero — the storefront never calculates tax or shipping itself.
 * Until a shipping method is chosen at checkout the total is labelled
 * "estimated", because Vendure hasn't priced shipping yet.
 */
export function OrderTotals({order, compact = false}: {order: Totals; compact?: boolean}) {
    const t = useTranslations('Cart');
    const tax = order.totalWithTax - order.total;
    const shippingKnown = order.shippingWithTax > 0;

    return (
        <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{t('subtotal')}</dt>
                <dd className="font-semibold tabular-nums"><Price value={order.subTotalWithTax} currencyCode={order.currencyCode} /></dd>
            </div>
            {order.discounts?.map((discount, index) => (
                <div key={index} className="flex justify-between gap-4 text-success">
                    <dt className="min-w-0 break-words">{discount.description}</dt>
                    <dd className="shrink-0 font-semibold tabular-nums"><Price value={discount.amountWithTax} currencyCode={order.currencyCode} /></dd>
                </div>
            ))}
            <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{t('shipping')}</dt>
                <dd className="text-right font-semibold tabular-nums">
                    {shippingKnown
                        ? <Price value={order.shippingWithTax} currencyCode={order.currencyCode} />
                        : <span className="font-normal text-muted-foreground">{t('calculatedAtCheckout')}</span>}
                </dd>
            </div>
            {tax > 0 && (
                <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t('taxIncluded')}</dt>
                    <dd className="font-semibold tabular-nums"><Price value={tax} currencyCode={order.currencyCode} /></dd>
                </div>
            )}
            <div className={cn('flex items-baseline justify-between gap-4 border-t border-border text-base', compact ? 'pt-3' : 'pt-4')}>
                <dt className="font-display font-bold">{shippingKnown ? t('total') : t('estimatedTotal')}</dt>
                <dd className={cn('font-display font-extrabold tabular-nums', compact ? 'text-lg' : 'text-2xl')}>
                    <Price value={order.totalWithTax} currencyCode={order.currencyCode} />
                </dd>
            </div>
        </dl>
    );
}
