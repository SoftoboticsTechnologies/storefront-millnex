'use client';

import {useTranslations} from 'next-intl';
import {RotateCcw} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {CartItems} from '@/features/cart/routes/cart-items';
import {OrderSummary} from '@/features/cart/routes/order-summary';
import {PromotionCode} from '@/features/cart/routes/promotion-code';
import {useActiveOrder} from '@/features/cart/active-order';
import {CartSkeleton} from '@/features/cart/components/cart-skeleton';

export function Cart() {
    const t = useTranslations('Cart');
    const {order: activeOrder, isLoading, error, refresh} = useActiveOrder();

    if (isLoading) {
        return <CartSkeleton/>;
    }

    if (error) {
        return (
            <div role="alert" className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/25 bg-destructive/5 px-6 py-14 text-center">
                <p className="text-sm text-muted-foreground">{t('loadError')}</p>
                <Button variant="outline" className="rounded-xl" onClick={refresh}>
                    <RotateCcw className="mr-2 size-4" />
                    {t('retry')}
                </Button>
            </div>
        );
    }

    if (!activeOrder || activeOrder.lines.length === 0) {
        return <CartItems activeOrder={null}/>;
    }

    return (
        <div className="grid gap-8 lg:grid-cols-3">
            <CartItems activeOrder={activeOrder}/>

            <div className="space-y-4 lg:col-span-1">
                <OrderSummary activeOrder={activeOrder}/>
                <PromotionCode activeOrder={activeOrder}/>
            </div>
        </div>
    )
}
