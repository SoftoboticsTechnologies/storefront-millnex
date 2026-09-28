'use client';

import {useState} from 'react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {toast} from 'sonner';
import {ImageOff, Loader2, Minus, Plus, Trash2} from 'lucide-react';
import {Link} from '@/platform/i18n/navigation';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {Price} from '@/features/pricing/price';
import type {ActiveOrder} from '@/features/cart/active-order';
import {adjustQuantity, removeFromCart} from '../routes/actions';

type OrderLine = ActiveOrder['lines'][number];

interface CartLineProps {
    line: OrderLine;
    currencyCode: string;
    /** `compact` for the slide-over drawer, `full` for the cart page. */
    size?: 'compact' | 'full';
    /** Called when the shopper follows a product link (e.g. to close the drawer). */
    onNavigate?: () => void;
}

export function CartLine({line, currencyCode, size = 'full', onNavigate}: CartLineProps) {
    const t = useTranslations('Cart');
    const [pending, setPending] = useState<'adjust' | 'remove' | null>(null);
    const variant = line.productVariant;
    const product = variant.product;
    const href = `/product/${product.slug}`;
    const compact = size === 'compact';
    const outOfStock = variant.stockLevel === 'OUT_OF_STOCK';

    const run = async (kind: 'adjust' | 'remove', action: () => Promise<{__typename: string; message?: string}>) => {
        setPending(kind);
        try {
            const result = await action();
            if (result.__typename !== 'Order') {
                toast.error(t('updateFailed'), {description: result.message});
            }
        } catch {
            toast.error(t('updateFailed'));
        } finally {
            setPending(null);
        }
    };

    const imageSize = compact ? 'size-20' : 'size-24 sm:size-28';

    return (
        <li className={cn('flex gap-3 sm:gap-4', compact ? 'py-4' : 'p-4 sm:p-5')}>
            <Link href={href} onClick={onNavigate} className={cn('relative shrink-0 overflow-hidden rounded-xl bg-surface', imageSize)}>
                {product.featuredAsset ? (
                    <Image
                        src={`${product.featuredAsset.preview}?preset=thumb`}
                        alt={product.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                    />
                ) : (
                    <span className="flex size-full items-center justify-center text-muted-foreground">
                        <ImageOff className="size-5 opacity-50" />
                    </span>
                )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link href={href} onClick={onNavigate} className="line-clamp-2 text-sm font-bold hover:text-brand sm:text-[15px]">
                            {product.name}
                        </Link>
                        {variant.name !== product.name && (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">{variant.name}</p>
                        )}
                        {!compact && <p className="mt-0.5 text-xs text-muted-foreground">{t('sku', {sku: variant.sku})}</p>}
                    </div>
                    <p className="shrink-0 text-sm font-extrabold sm:text-base">
                        <Price value={line.linePriceWithTax} currencyCode={currencyCode} />
                    </p>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                    <Price value={line.unitPriceWithTax} currencyCode={currencyCode} /> {t('each')}
                </p>
                {outOfStock ? (
                    <p className="mt-1 text-xs font-semibold text-destructive">{t('lineOutOfStock')}</p>
                ) : variant.stockLevel === 'LOW_STOCK' ? (
                    <p className="mt-1 text-xs font-semibold text-amber-700">{t('lineLowStock')}</p>
                ) : null}

                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                    <div className="flex items-center rounded-full border border-border bg-card">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-full"
                            disabled={line.quantity <= 1 || pending !== null}
                            onClick={() => run('adjust', () => adjustQuantity(line.id, line.quantity - 1))}
                            aria-label={t('decreaseQuantity')}
                        >
                            <Minus className="size-3.5" />
                        </Button>
                        <span className="w-8 text-center text-sm font-bold tabular-nums" aria-live="polite">
                            {pending === 'adjust' ? <Loader2 className="mx-auto size-3.5 animate-spin" /> : line.quantity}
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-full"
                            disabled={pending !== null || outOfStock}
                            onClick={() => run('adjust', () => adjustQuantity(line.id, line.quantity + 1))}
                            aria-label={t('increaseQuantity')}
                        >
                            <Plus className="size-3.5" />
                        </Button>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 rounded-full px-2.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        disabled={pending !== null}
                        onClick={() => run('remove', () => removeFromCart(line.id))}
                    >
                        {pending === 'remove' ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                        {t('remove')}
                    </Button>
                </div>
            </div>
        </li>
    );
}
