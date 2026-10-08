import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {ImageOff} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Link} from '@/platform/i18n/navigation';
import {ProductCardPrice} from '@/features/products/product-price-client';
import type {ProductCardData} from '@/features/products/product-card-data';
import {QuickAddButton} from './quick-add-button';
import {QuickViewButton} from './quick-view-button';
import {StockBadge} from './stock-badge';
import {WishlistButton} from './wishlist-button';

interface ProductCardProps {
    product: ProductCardData;
    /** Collection name to label the card with, when the caller knows it. */
    category?: string;
    preload?: boolean;
    /** Horizontal layout from sm (image left, details right) for 2-up rails where a tall 4:5 card would be oversized. */
    wide?: boolean;
}

/**
 * Product card: a large product "stage" (photos have white backgrounds, so
 * they sit on a light plinth with mix-blend-multiply and are never cropped),
 * then category, name, SKU, live price and availability, then actions.
 * The single action is Add to cart (disabled, labelled "Out of Stock", when
 * Vendure reports no stock). Every value shown comes from Vendure.
 */
export function ProductCard({product, category, preload, wide = false}: ProductCardProps) {
    const t = useTranslations('Product');
    const href = `/product/${product.slug}`;

    return (
        <article className={cn('group/card relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-[box-shadow,transform,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_28px_50px_-34px_rgb(15_20_30/0.5)]', wide && 'sm:flex-row')}>
            {/* Link prefetch is disabled app-wide (static-export segment-cache
                bug, see docs/decisions.md) — no per-link override here. */}
            <div className={cn('relative', wide && 'sm:w-[46%] sm:shrink-0')}>
                <Link href={href} className="frame-ticks relative block aspect-[4/5] overflow-hidden bg-stage" tabIndex={-1} aria-hidden="true">
                    {product.imageUrl ? (
                        <Image
                            src={product.imageUrl}
                            alt=""
                            fill
                            preload={preload}
                            loading={preload ? undefined : 'lazy'}
                            className="object-contain p-3 mix-blend-multiply transition-transform duration-700 ease-out group-hover/card:scale-[1.05] sm:p-5"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <span className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                            <ImageOff className="size-7 opacity-50" />
                            <span className="text-xs">{t('noImage')}</span>
                        </span>
                    )}
                </Link>
                <StockBadge inStock={product.inStock} className="pointer-events-none absolute bottom-2.5 left-2.5 z-10 bg-card/95 shadow-sm backdrop-blur max-sm:h-5 max-sm:gap-1 max-sm:px-2 max-sm:text-[10px] max-sm:tracking-[0.02em] sm:bottom-auto sm:left-3 sm:top-3" />
                {/* Siblings of the image link (not inside it: that link is
                    aria-hidden) and above the card-wide name overlay. */}
                <WishlistButton productId={product.productId} name={product.name} className="absolute right-2.5 top-2.5 z-20 sm:right-3 sm:top-3" />
                <QuickViewButton
                    product={product}
                    category={category}
                    className="absolute inset-x-3 bottom-3 z-20 hidden h-10 translate-y-2 items-center justify-center gap-2 rounded-lg bg-background/90 text-xs font-semibold text-foreground opacity-0 backdrop-blur transition-[opacity,transform,background-color] duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100 hover:bg-logo-blue hover:text-white focus-visible:translate-y-0 focus-visible:opacity-100 lg:flex"
                />
            </div>

            <div className={cn('flex flex-1 flex-col border-t border-border p-3 sm:p-4', wide && 'sm:border-l sm:border-t-0 sm:p-6 lg:p-7')}>
                {category && (
                    <p className="spec-label mb-1.5 truncate text-brand">{category}</p>
                )}
                <h3 className="font-display text-[15px] font-semibold leading-snug sm:text-base">
                    <Link href={href} className="line-clamp-2 outline-none after:absolute after:inset-0 after:content-[''] hover:text-brand focus-visible:text-brand">
                        {product.name}
                    </Link>
                </h3>
                {product.sku && (
                    <p className="spec-label mt-1.5 truncate text-steel" title={product.sku}>{product.sku}</p>
                )}
                {product.summary && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">{product.summary}</p>
                )}

                <div className="mt-auto pt-4">
                    <p className="font-display text-lg font-bold tracking-tight sm:text-xl">
                        {product.price ? (
                            <ProductCardPrice slug={product.slug} initial={product.price} />
                        ) : (
                            <span className="text-sm font-medium text-muted-foreground">{t('priceUnavailable')}</span>
                        )}
                    </p>
                    {/* `relative z-10` lifts the button above the card-wide
                        name link overlay so it stays independently clickable. */}
                    <div className="relative z-10 mt-3 flex">
                        <QuickAddButton slug={product.slug} name={product.name} inStock={product.inStock} />
                    </div>
                </div>
            </div>
        </article>
    );
}
