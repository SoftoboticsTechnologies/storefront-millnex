'use client';

import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {ArrowRight, ArrowUpRight, ImageOff, Scale} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Link} from '@/platform/i18n/navigation';
import type {MegaMenuData, SiteHeaderLabels} from '@/site/navigation/navbar/site-header';
import {siteButton} from '@/site/ui/button-styles';

interface MegaMenuProps {
    id: string;
    open: boolean;
    data: MegaMenuData;
    labels: SiteHeaderLabels;
    onMouseEnter: () => void;
    onNavigate: () => void;
}

/**
 * Desktop (xl+) categories panel under the header. Columns are the real
 * Vendure collections with their products (thumbnail, name, live-at-build
 * stock), then the catalog's main facet as "Shop by type" shop filters,
 * then a help card that opens the quote modal.
 */
export function MegaMenu({id, open, data, labels, onMouseEnter, onNavigate}: MegaMenuProps) {
    const tProduct = useTranslations('Product');
    const columns = Math.min(Math.max(data.categories.length, 1), 3);

    return (
        <div
            id={id}
            onMouseEnter={onMouseEnter}
            // `inert` keeps the closed panel out of the tab order and away from screen readers.
            inert={!open}
            className={cn(
                'absolute inset-x-0 top-full hidden origin-top border-b border-border bg-background shadow-[0_40px_60px_-40px_rgb(10_15_25/0.45)] transition-[opacity,transform,visibility] duration-200 ease-out xl:block',
                open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
            )}
        >
            <div className="site-container grid grid-cols-12 gap-8 py-8">
                <div className="col-span-8">
                    <p className="spec-label mb-5 text-steel">{labels.megaCategories}</p>
                    <div className={cn('grid gap-6', columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
                        {data.categories.map((category) => (
                            <div key={category.slug} className="min-w-0">
                                <Link
                                    href={`/collection/${category.slug}`}
                                    onClick={onNavigate}
                                    className="group/cat flex items-baseline justify-between gap-3 border-b border-border pb-3"
                                >
                                    <span className="font-display-wide text-lg font-bold leading-tight group-hover/cat:text-brand">{category.name}</span>
                                </Link>
                                <ul className="mt-2">
                                    {category.products.map((product) => (
                                        <li key={product.slug}>
                                            <Link
                                                href={`/product/${product.slug}`}
                                                onClick={onNavigate}
                                                className="group/item -mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
                                            >
                                                <span className="relative size-12 shrink-0 overflow-hidden rounded-md border border-border bg-stage">
                                                    {product.imageUrl ? (
                                                        <Image src={`${product.imageUrl}?preset=thumb`} alt="" fill sizes="48px" className="object-contain mix-blend-multiply" />
                                                    ) : (
                                                        <ImageOff aria-hidden="true" className="absolute inset-0 m-auto size-4 text-muted-foreground" />
                                                    )}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-semibold group-hover/item:text-brand">{product.name}</span>
                                                    <span className={cn('text-xs', product.inStock ? 'text-success' : 'text-stock-out')}>
                                                        {product.inStock ? tProduct('inStock') : tProduct('outOfStock')}
                                                    </span>
                                                </span>
                                                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-steel opacity-0 transition-opacity group-hover/item:opacity-100" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                {category.productCount > category.products.length && (
                                    <Link href={`/collection/${category.slug}`} onClick={onNavigate} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
                                        {labels.megaViewCategory}
                                        <ArrowRight aria-hidden="true" className="size-3.5" />
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-span-2 border-l border-border pl-8">
                    {data.typeFacet && (
                        <>
                            <p className="spec-label mb-5 text-steel">{labels.megaByType}</p>
                            <ul className="space-y-1">
                                {data.typeFacet.values.map((value) => (
                                    <li key={value.id}>
                                        <Link
                                            href={`/shop?facets=${data.typeFacet!.id}:${value.id}`}
                                            onClick={onNavigate}
                                            className="flex items-center justify-between gap-2 rounded-md py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-brand"
                                        >
                                            <span className="truncate">{value.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    <div className="mt-6 space-y-2 border-t border-border pt-5">
                        <Link href="/shop" onClick={onNavigate} className="flex items-center gap-2 text-sm font-bold hover:text-brand">
                            {labels.browseAllMachines}
                        </Link>
                        <Link href="/compare" onClick={onNavigate} className="flex items-center gap-2 text-sm font-semibold text-foreground/80 hover:text-brand">
                            <Scale aria-hidden="true" className="size-4" />
                            {labels.compare}
                        </Link>
                    </div>
                </div>

                <div className="col-span-2">
                    <div className="relative isolate flex h-full flex-col overflow-hidden rounded-xl bg-tint-blue p-5 text-foreground">
                        <p className="font-display-wide text-lg font-bold leading-tight">{labels.megaHelpTitle}</p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{labels.megaHelpBody}</p>
                        <div aria-hidden="true" className="min-h-5 flex-1" />
                        <Link href="/contact" onClick={onNavigate} className={cn(siteButton({variant: 'brand', size: 'sm'}), 'w-full')}>
                            {labels.contact}
                            <ArrowRight aria-hidden="true" className="size-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
