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
            <div role="alert" className="flex flex-col items-center gap-4 rounded-xl border border-stock-out/25 bg-stock-out/5 px-6 py-14 text-center">
                <p className="text-sm text-muted-foreground">{t('loadError')}</p>
                <Button variant="outline" className="rounded-lg" onClick={refresh}>
                    <RotateCcw className="mr-2 size-4" />
                    {t('retry')}
                </Button>
            </div>
        );
    }

    if (!activeOrder || activeOrder.lines.length === 0) {
        return <CartItems activeOrder={null}/>;
    }

    // Items first, summary second: on phones the summary stacks under the
    // lines; from lg it becomes a sticky right-hand column.
    return (
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
            <div className="min-w-0 lg:col-span-8">
                <CartItems activeOrder={activeOrder}/>
            </div>

            <aside className="min-w-0 space-y-4 lg:col-span-4 lg:pt-8">
                <div className="space-y-4 lg:sticky lg:top-32">
                    <OrderSummary activeOrder={activeOrder}/>
                    <PromotionCode activeOrder={activeOrder}/>
                </div>
            </aside>
        </div>
    )
}
