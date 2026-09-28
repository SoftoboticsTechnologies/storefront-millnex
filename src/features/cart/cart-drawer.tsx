'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Lock, RotateCcw, ShoppingBag, ShoppingCart} from 'lucide-react';
import {Sheet, SheetContent, SheetTitle, SheetTrigger} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {Link} from '@/platform/i18n/navigation';
import {useActiveOrder} from './active-order';
import {CartLine} from './components/cart-line';
import {OrderTotals} from './components/order-totals';

/** Count badge shared by every cart trigger (header, mobile tab bar). */
export function CartCountBadge({count, className}: {count: number; className?: string}) {
    if (count <= 0) return null;
    return (
        <span
            className={cn(
                'absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-brand-foreground ring-2 ring-background',
                className,
            )}
        >
            {count > 99 ? '99+' : count}
        </span>
    );
}

interface CartDrawerProps {
    /** Classes for the trigger button (lets the header restyle it over dark heroes). */
    triggerClassName?: string;
}

/**
 * Header cart button + slide-over mini cart. Everything shown comes from
 * Vendure's ActiveOrder (lines, unit/line prices, totals) and every change
 * goes through the same cart mutations as the cart page.
 */
export function CartDrawer({triggerClassName}: CartDrawerProps) {
    const t = useTranslations('Cart');
    const [open, setOpen] = useState(false);
    const {order, isLoading, error, refresh, itemCount} = useActiveOrder();
    const close = () => setOpen(false);
    const hasLines = !!order && order.lines.length > 0;

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
                render={
                    <button
                        type="button"
                        aria-label={t('openCartWithCount', {count: itemCount})}
                        className={cn(
                            'relative inline-flex size-10 items-center justify-center rounded-xl transition-colors outline-none focus-visible:ring-3 focus-visible:ring-brand/40',
                            triggerClassName,
                        )}
                    />
                }
            >
                <ShoppingCart className="size-5" />
                <CartCountBadge count={itemCount} />
            </SheetTrigger>

            <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
                <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
                    <SheetTitle className="text-lg font-extrabold">
                        {t('title')}
                        {itemCount > 0 && <span className="ml-2 text-sm font-medium text-muted-foreground">({t('itemCount', {count: itemCount})})</span>}
                    </SheetTitle>
                </div>

                {isLoading ? (
                    <div className="flex-1 space-y-4 p-5" aria-busy="true">
                        {Array.from({length: 3}).map((_, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="size-20 animate-pulse rounded-xl bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                                    <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                                    <div className="h-8 w-28 animate-pulse rounded-full bg-muted" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                        <p className="text-sm text-muted-foreground">{t('loadError')}</p>
                        <Button variant="outline" className="rounded-xl" onClick={refresh}>
                            <RotateCcw className="mr-2 size-4" />
                            {t('retry')}
                        </Button>
                    </div>
                ) : !hasLines ? (
                    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                        <span className="flex size-16 items-center justify-center rounded-full bg-surface text-muted-foreground">
                            <ShoppingBag className="size-7" />
                        </span>
                        <p className="mt-5 text-lg font-bold">{t('empty')}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{t('emptyMessage')}</p>
                        <Button
                            render={<Link href="/shop" onClick={close} />}
                            nativeButton={false}
                            className="mt-6 h-11 rounded-xl bg-brand px-6 font-bold text-brand-foreground hover:bg-brand/90"
                        >
                            {t('continueShopping')}
                        </Button>
                    </div>
                ) : (
                    <>
                        <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
                            {order.lines.map((line) => (
                                <CartLine key={line.id} line={line} currencyCode={order.currencyCode} size="compact" onNavigate={close} />
                            ))}
                        </ul>
                        <div className="shrink-0 space-y-4 border-t border-border bg-surface/60 p-5">
                            <OrderTotals order={order} />
                            <div className="grid gap-2">
                                <Button
                                    render={<Link href="/checkout" onClick={close} />}
                                    nativeButton={false}
                                    className="h-12 rounded-xl bg-brand text-base font-bold text-brand-foreground hover:bg-brand/90"
                                >
                                    <Lock className="mr-2 size-4" />
                                    {t('proceedToCheckout')}
                                </Button>
                                <Button
                                    render={<Link href="/cart" onClick={close} />}
                                    nativeButton={false}
                                    variant="outline"
                                    className="h-11 rounded-xl font-semibold"
                                >
                                    {t('viewCart')}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
