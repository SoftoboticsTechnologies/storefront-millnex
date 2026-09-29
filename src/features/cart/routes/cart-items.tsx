'use client';

import {ArrowRight, ShoppingBag} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {Link} from '@/platform/i18n/navigation';
import {Button} from '@/components/ui/button';
import type {ActiveOrder} from '@/features/cart/active-order';
import {CartLine} from '@/features/cart/components/cart-line';

export function CartEmptyState({onNavigate, compact = false}: {onNavigate?: () => void; compact?: boolean}) {
    const t = useTranslations('Cart');
    return (
        <div
            className={
                compact
                    ? 'flex flex-1 flex-col items-center justify-center p-8 text-center'
                    : 'flex flex-col items-center rounded-2xl border border-border bg-surface px-6 py-16 text-center sm:py-24'
            }
        >
            <span className="flex size-16 items-center justify-center rounded-xl border border-border bg-card text-steel shadow-[0_18px_40px_-28px_rgb(15_20_30/0.5)]">
                <ShoppingBag className="size-7" />
            </span>
            {compact ? (
                <p className="mt-5 font-display-wide text-lg font-extrabold">{t('empty')}</p>
            ) : (
                <h2 className="mt-6 font-display-wide text-2xl font-extrabold sm:text-3xl">{t('empty')}</h2>
            )}
            <p className="mt-2 max-w-sm text-sm text-muted-foreground sm:text-base">{t('emptyMessage')}</p>
            <Button
                render={<Link href="/shop" onClick={onNavigate} />}
                nativeButton={false}
                className="group mt-7 h-11 gap-2 rounded-lg bg-brand px-6 font-bold text-brand-foreground hover:bg-brand/90"
            >
                {t('exploreMachines')}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
        </div>
    );
}

export function CartItems({activeOrder}: { activeOrder: ActiveOrder | null }) {
    const t = useTranslations('Cart');

    if (!activeOrder || activeOrder.lines.length === 0) {
        return <CartEmptyState />;
    }

    return (
        <section aria-labelledby="cart-items-heading" className="min-w-0">
            <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
                <h2 id="cart-items-heading" className="spec-label text-steel">{t('itemsInCart')}</h2>
                <span className="spec-label text-steel">{t('itemCount', {count: activeOrder.totalQuantity})}</span>
            </div>
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {activeOrder.lines.map((line) => (
                    <CartLine key={line.id} line={line} currencyCode={activeOrder.currencyCode} />
                ))}
            </ul>
        </section>
    );
}
