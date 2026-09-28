'use client';

import {useTranslations} from 'next-intl';
import {Price} from '@/features/pricing/price';
import type {ActiveOrder} from '@/features/cart/active-order';

type Totals = Pick<ActiveOrder, 'currencyCode' | 'subTotalWithTax' | 'shippingWithTax' | 'total' | 'totalWithTax' | 'discounts'>;

/**
 * Order totals exactly as Vendure computed them. Tax is Vendure's own
 * `totalWithTax − total` (prices are shown tax-inclusive), displayed only
 * when non-zero — the storefront never calculates tax or shipping itself.
 */
export function OrderTotals({order}: {order: Totals}) {
    const t = useTranslations('Cart');
    const tax = order.totalWithTax - order.total;

    return (
        <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{t('subtotal')}</dt>
                <dd className="font-semibold"><Price value={order.subTotalWithTax} currencyCode={order.currencyCode} /></dd>
            </div>
            {order.discounts?.map((discount, index) => (
                <div key={index} className="flex justify-between gap-4 text-emerald-700">
                    <dt>{discount.description}</dt>
                    <dd className="font-semibold"><Price value={discount.amountWithTax} currencyCode={order.currencyCode} /></dd>
                </div>
            ))}
            <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{t('shipping')}</dt>
                <dd className="font-semibold">
                    {order.shippingWithTax > 0
                        ? <Price value={order.shippingWithTax} currencyCode={order.currencyCode} />
                        : <span className="font-normal text-muted-foreground">{t('calculatedAtCheckout')}</span>}
                </dd>
            </div>
            {tax > 0 && (
                <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t('taxIncluded')}</dt>
                    <dd className="font-semibold"><Price value={tax} currencyCode={order.currencyCode} /></dd>
                </div>
            )}
            <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3 text-base">
                <dt className="font-bold">{t('total')}</dt>
                <dd className="text-xl font-extrabold"><Price value={order.totalWithTax} currencyCode={order.currencyCode} /></dd>
            </div>
        </dl>
    );
}
