'use client';

import {ShoppingBag} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {Link} from '@/platform/i18n/navigation';
import {Button} from '@/components/ui/button';
import type {ActiveOrder} from '@/features/cart/active-order';
import {CartLine} from '@/features/cart/components/cart-line';

export function CartItems({activeOrder}: { activeOrder: ActiveOrder | null }) {
    const t = useTranslations('Cart');

    if (!activeOrder || activeOrder.lines.length === 0) {
        return (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-surface text-muted-foreground">
                    <ShoppingBag className="size-7" />
                </span>
                <h2 className="mt-5 text-2xl font-extrabold">{t('empty')}</h2>
                <p className="mt-2 text-muted-foreground">{t('emptyMessage')}</p>
                <Button
                    render={<Link href="/shop" />}
                    nativeButton={false}
                    className="mt-8 h-11 rounded-xl bg-brand px-6 font-bold text-brand-foreground hover:bg-brand/90"
                >
                    {t('continueShopping')}
                </Button>
            </div>
        );
    }

    return (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card lg:col-span-2">
            {activeOrder.lines.map((line) => (
                <CartLine key={line.id} line={line} currencyCode={activeOrder.currencyCode} />
            ))}
        </ul>
    );
}
