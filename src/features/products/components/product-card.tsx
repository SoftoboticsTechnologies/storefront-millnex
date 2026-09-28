import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {Eye, ImageOff} from 'lucide-react';
import {Link} from '@/platform/i18n/navigation';
import {ProductCardPrice} from '@/features/products/product-price-client';
import type {ProductCardData} from '@/features/products/product-card-data';
import {QuickAddButton} from './quick-add-button';
import {WishlistButton} from './wishlist-button';

interface ProductCardProps {
    product: ProductCardData;
    /** Collection name to label the card with, when the caller knows it. */
    category?: string;
    preload?: boolean;
}

export function ProductCard({product, category, preload}: ProductCardProps) {
    const t = useTranslations('Product');
    const href = `/product/${product.slug}`;

    return (
        <article className="group/card relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_22px_45px_-30px_rgb(0_0_0/0.45)]">
            {/* Link prefetch is disabled app-wide (static-export segment-cache
                bug, see docs/decisions.md) — no per-link override here. */}
            <Link href={href} className="relative block aspect-square overflow-hidden bg-surface" tabIndex={-1} aria-hidden="true">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt=""
                        fill
                        preload={preload}
                        loading={preload ? undefined : 'lazy'}
                        className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.04]"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                ) : (
                    <span className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <ImageOff className="size-7 opacity-50" />
                        <span className="text-xs">{t('noImage')}</span>
                    </span>
                )}
                {!product.inStock && (
                    <span className="absolute left-3 top-3 rounded-full bg-foreground/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-background">
                        {t('outOfStock')}
                    </span>
                )}
                <span className="absolute inset-x-3 bottom-3 z-10 hidden translate-y-2 items-center justify-center gap-1.5 rounded-xl bg-background/95 py-2 text-xs font-semibold opacity-0 shadow-sm backdrop-blur transition-[opacity,transform] duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100 lg:flex">
                    <Eye className="size-3.5" />
                    {t('viewProduct')}
                </span>
            </Link>
            {/* Sibling of the image link (not inside it: that link is
                aria-hidden) and above the card-wide name overlay. */}
            <WishlistButton productId={product.productId} name={product.name} className="absolute right-2.5 top-2.5 z-20 sm:right-3 sm:top-3" />

            <div className="flex flex-1 flex-col p-3 sm:p-4">
                {category && (
                    <p className="mb-1 truncate text-[11px] font-bold uppercase tracking-[0.12em] text-brand">{category}</p>
                )}
                <h3 className="text-sm font-bold leading-snug sm:text-[15px]">
                    <Link href={href} className="line-clamp-2 outline-none after:absolute after:inset-0 after:content-[''] hover:text-brand focus-visible:text-brand">
                        {product.name}
                    </Link>
                </h3>
                {product.summary && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">{product.summary}</p>
                )}

                <div className="mt-auto pt-3">
                    <p className="text-base font-extrabold tracking-tight sm:text-lg">
                        {product.price ? (
                            <ProductCardPrice slug={product.slug} initial={product.price} />
                        ) : (
                            <span className="text-sm font-medium text-muted-foreground">{t('priceUnavailable')}</span>
                        )}
                    </p>
                    <p className={product.inStock ? 'mt-0.5 text-xs font-medium text-emerald-700' : 'mt-0.5 text-xs font-medium text-destructive'}>
                        {product.inStock ? t('inStock') : t('outOfStock')}
                    </p>
                    {/* `relative z-10` lifts the actions above the card-wide
                        name link overlay so they stay independently clickable. */}
                    <div className="relative z-10 mt-3 flex gap-2">
                        <QuickAddButton slug={product.slug} name={product.name} inStock={product.inStock} />
                        <Link
                            href={href}
                            aria-label={t('viewProductNamed', {name: product.name})}
                            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:border-foreground/30 hover:bg-muted"
                        >
                            <Eye className="size-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
