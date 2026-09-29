'use client';

import {useState} from 'react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {toast} from 'sonner';
import {Heart, ImageOff, Loader2, Minus, Plus, Trash2} from 'lucide-react';
import {Link} from '@/platform/i18n/navigation';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {Price} from '@/features/pricing/price';
import {useWishlist} from '@/features/products/wishlist';
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
    const wishlist = useWishlist();
    const variant = line.productVariant;
    const product = variant.product;
    const href = `/product/${product.slug}`;
    const compact = size === 'compact';
    const outOfStock = variant.stockLevel === 'OUT_OF_STOCK';
    const saved = wishlist.has(product.id);

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

    // The wishlist is device-local product IDs only — saving never touches the
    // ActiveOrder, so the line stays in the cart.
    const toggleWishlist = () => {
        wishlist.toggle(product.id);
        toast.success(saved ? t('removedFromWishlist') : t('savedToWishlist'));
    };

    return (
        <li className={cn('flex gap-3 sm:gap-5', compact ? 'py-4' : 'p-4 sm:p-6')}>
            <Link
                href={href}
                onClick={onNavigate}
                className={cn(
                    'relative shrink-0 overflow-hidden rounded-xl border border-border bg-stage',
                    compact ? 'size-20' : 'size-24 sm:size-32',
                )}
            >
                {product.featuredAsset ? (
                    // `small` is a resize preset (Vendure's `thumb` crops) — product
                    // photos carry baked-in text, so they must never be cropped.
                    <Image
                        src={`${product.featuredAsset.preview}?preset=small`}
                        alt={product.name}
                        fill
                        sizes="128px"
                        className="object-contain p-1.5 mix-blend-multiply"
                    />
                ) : (
                    <span className="flex size-full items-center justify-center text-steel">
                        <ImageOff className="size-5 opacity-60" />
                    </span>
                )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link
                            href={href}
                            onClick={onNavigate}
                            className={cn(
                                'line-clamp-2 font-display font-bold leading-snug transition-colors hover:text-brand',
                                compact ? 'text-sm' : 'text-[15px] sm:text-lg',
                            )}
                        >
                            {product.name}
                        </Link>
                        {variant.name !== product.name && (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">{variant.name}</p>
                        )}
                        {variant.sku && (
                            <p className="spec-label mt-1 truncate text-steel">{t('sku', {sku: variant.sku})}</p>
                        )}
                    </div>
                    <div className="shrink-0 text-right">
                        {!compact && <p className="spec-label hidden text-steel sm:block">{t('lineTotal')}</p>}
                        <p className={cn('font-display font-extrabold tabular-nums', compact ? 'text-sm' : 'text-base sm:text-lg')}>
                            <Price value={line.linePriceWithTax} currencyCode={currencyCode} />
                        </p>
                    </div>
                </div>

                <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
                    <Price value={line.unitPriceWithTax} currencyCode={currencyCode} /> {t('each')}
                </p>
                {outOfStock ? (
                    <p className="mt-1.5 inline-flex w-fit items-center rounded-md bg-stock-out/10 px-2 py-0.5 text-xs font-semibold text-stock-out">
                        {t('lineOutOfStock')}
                    </p>
                ) : variant.stockLevel === 'LOW_STOCK' ? (
                    <p className="mt-1.5 text-xs font-semibold text-warning">{t('lineLowStock')}</p>
                ) : null}

                <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-3">
                    <div
                        className="flex items-center rounded-lg border border-border bg-card"
                        role="group"
                        aria-label={t('quantity')}
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-l-lg rounded-r-none"
                            disabled={line.quantity <= 1 || pending !== null}
                            onClick={() => run('adjust', () => adjustQuantity(line.id, line.quantity - 1))}
                            aria-label={t('decreaseQuantity')}
                        >
                            <Minus className="size-3.5" />
                        </Button>
                        <span className="w-9 border-x border-border text-center text-sm font-bold leading-9 tabular-nums" aria-live="polite">
                            {pending === 'adjust' ? <Loader2 className="mx-auto size-3.5 animate-spin" /> : line.quantity}
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-l-none rounded-r-lg"
                            disabled={pending !== null || outOfStock}
                            onClick={() => run('adjust', () => adjustQuantity(line.id, line.quantity + 1))}
                            aria-label={t('increaseQuantity')}
                        >
                            <Plus className="size-3.5" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={cn(
                                'h-8 gap-1.5 rounded-lg px-2 text-xs',
                                saved ? 'text-brand hover:text-brand' : 'text-muted-foreground',
                            )}
                            aria-pressed={saved}
                            aria-label={compact ? (saved ? t('savedInWishlist') : t('saveToWishlist')) : undefined}
                            onClick={toggleWishlist}
                        >
                            <Heart className={cn('size-3.5', saved && 'fill-current')} />
                            {!compact && <span>{saved ? t('savedInWishlist') : t('saveToWishlist')}</span>}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 rounded-lg px-2 text-xs text-muted-foreground hover:bg-stock-out/10 hover:text-stock-out"
                            disabled={pending !== null}
                            onClick={() => run('remove', () => removeFromCart(line.id))}
                        >
                            {pending === 'remove' ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                            {t('remove')}
                        </Button>
                    </div>
                </div>
            </div>
        </li>
    );
}
