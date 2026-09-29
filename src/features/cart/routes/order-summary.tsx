'use client';

import {Link} from '@/platform/i18n/navigation';
import {Button} from '@/components/ui/button';
import {ArrowLeft, ArrowRight, Lock, ShieldCheck} from 'lucide-react';
import {useTranslations} from 'next-intl';
import type {ActiveOrder} from '@/features/cart/active-order';
import {OrderTotals} from '@/features/cart/components/order-totals';

export function OrderSummary({activeOrder}: { activeOrder: ActiveOrder }) {
    const t = useTranslations('Cart');
    return (
        <section aria-labelledby="cart-summary-heading" className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
                <h2 id="cart-summary-heading" className="font-display-wide text-xl font-extrabold">{t('orderSummary')}</h2>
                <span className="spec-label text-steel">{t('itemCount', {count: activeOrder.totalQuantity})}</span>
            </div>

            <div className="mt-5">
                <OrderTotals order={activeOrder} />
            </div>

            <Button
                render={<Link href="/checkout" />}
                nativeButton={false}
                className="group mt-6 h-12 w-full gap-2 rounded-lg bg-brand text-base font-bold text-brand-foreground hover:bg-brand/90"
                size="lg"
            >
                <Lock className="size-4" />
                {t('proceedToCheckout')}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Button>

            <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-surface px-3 py-2.5 text-xs text-muted-foreground">
                <ShieldCheck className="mt-px size-4 shrink-0 text-success" />
                <span>{t('secureCheckoutNote')}</span>
            </div>

            <Link
                href="/shop"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-brand"
            >
                <ArrowLeft className="size-4" />
                {t('continueShopping')}
            </Link>
        </section>
    );
}
