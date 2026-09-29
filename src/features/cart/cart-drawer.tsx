'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Lock, RotateCcw, ShieldCheck, ShoppingCart} from 'lucide-react';
import {Sheet, SheetContent, SheetTitle, SheetTrigger} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {Link} from '@/platform/i18n/navigation';
import {useActiveOrder} from './active-order';
import {CartLine} from './components/cart-line';
import {OrderTotals} from './components/order-totals';
import {CartEmptyState} from './routes/cart-items';

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

            <SheetContent side="right" className="flex w-full flex-col gap-0 bg-background p-0 sm:max-w-md">
                <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
                    <SheetTitle className="font-display-wide text-lg font-extrabold">{t('title')}</SheetTitle>
                    {itemCount > 0 && <span className="spec-label text-steel">{t('itemCount', {count: itemCount})}</span>}
                </div>

                {isLoading ? (
                    <div className="flex-1 space-y-4 p-5" aria-busy="true">
                        {Array.from({length: 3}).map((_, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="size-20 animate-pulse rounded-xl bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                                    <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                                    <div className="h-9 w-28 animate-pulse rounded-lg bg-muted" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                        <p className="text-sm text-muted-foreground">{t('loadError')}</p>
                        <Button variant="outline" className="rounded-lg" onClick={refresh}>
                            <RotateCcw className="mr-2 size-4" />
                            {t('retry')}
                        </Button>
                    </div>
                ) : !hasLines ? (
                    <CartEmptyState compact onNavigate={close} />
                ) : (
                    <>
                        <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
                            {order.lines.map((line) => (
                                <CartLine key={line.id} line={line} currencyCode={order.currencyCode} size="compact" onNavigate={close} />
                            ))}
                        </ul>
                        <div className="shrink-0 space-y-4 border-t border-border bg-surface p-5">
                            <OrderTotals order={order} compact />
                            <div className="grid gap-2">
                                <Button
                                    render={<Link href="/checkout" onClick={close} />}
                                    nativeButton={false}
                                    className="h-12 gap-2 rounded-lg bg-brand text-base font-bold text-brand-foreground hover:bg-brand/90"
                                >
                                    <Lock className="size-4" />
                                    {t('proceedToCheckout')}
                                </Button>
                                <Button
                                    render={<Link href="/cart" onClick={close} />}
                                    nativeButton={false}
                                    variant="outline"
                                    className="h-11 rounded-lg bg-card font-semibold"
                                >
                                    {t('viewCart')}
                                </Button>
                            </div>
                            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                                <ShieldCheck className="size-3.5 text-success" />
                                {t('secureCheckout')}
                            </p>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
