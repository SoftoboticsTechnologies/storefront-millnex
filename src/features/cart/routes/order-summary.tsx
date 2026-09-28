'use client';

import {Link} from '@/platform/i18n/navigation';
import {Button} from '@/components/ui/button';
import {Lock} from 'lucide-react';
import {useTranslations} from 'next-intl';
import type {ActiveOrder} from '@/features/cart/active-order';
import {OrderTotals} from '@/features/cart/components/order-totals';

export function OrderSummary({activeOrder}: { activeOrder: ActiveOrder }) {
    const t = useTranslations('Cart');
    return (
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-extrabold">{t('orderSummary')}</h2>

            <OrderTotals order={activeOrder} />

            <Button
                render={<Link href="/checkout" />}
                nativeButton={false}
                className="mt-6 h-12 w-full rounded-xl bg-brand text-base font-bold text-brand-foreground hover:bg-brand/90"
                size="lg"
            >
                {t('proceedToCheckout')}
            </Button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>{t('secureCheckout')}</span>
            </div>

            <Button render={<Link href="/shop" />} nativeButton={false} variant="outline" className="mt-3 h-11 w-full rounded-xl">{t('continueShopping')}</Button>
        </div>
    );
}
