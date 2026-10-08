'use client';

import {useEffect, useState} from 'react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {ArrowRight, Eye, ImageOff, Loader2} from 'lucide-react';
import {Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {cn} from '@/lib/utils';
import {Link} from '@/platform/i18n/navigation';
import {query} from '@/platform/vendure/client-api';
import type {ResultOf} from '@/platform/vendure/graphql';
import {QuoteButton} from '@/features/enquiry/quote-dialog';
import {GetProductDetailQuery} from '@/features/products/graphql';
import {ProductCardPrice} from '@/features/products/product-price-client';
import {stripHtml, type ProductCardData} from '@/features/products/product-card-data';
import {QuickAddButton} from './quick-add-button';
import {StockBadge} from './stock-badge';

type ProductDetail = NonNullable<ResultOf<typeof GetProductDetailQuery>['product']>;

interface QuickViewButtonProps {
    product: ProductCardData;
    category?: string;
    className?: string;
}

/**
 * "Quick view" from a product card: a modal with the product's real Vendure
 * detail (images, description, facet specifications), fetched only when it
 * opens. Price/stock come from the same live sources as the card; actions
 * are the card's own (quick add, or an availability enquiry when out of stock).
 */
export function QuickViewButton({product, category, className}: QuickViewButtonProps) {
    const t = useTranslations('Product');
    const [open, setOpen] = useState(false);
    const [detail, setDetail] = useState<ProductDetail | null>(null);
    const [failed, setFailed] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        if (!open || detail) return;
        let cancelled = false;
        query(GetProductDetailQuery, {slug: product.slug})
            .then(({data}) => {
                if (!cancelled) setDetail(data.product ?? null);
            })
            .catch(() => {
                if (!cancelled) setFailed(true);
            });
        return () => {
            cancelled = true;
        };
    }, [open, detail, product.slug]);

    const images = detail?.assets.length ? detail.assets.map((asset) => asset.preview) : product.imageUrl ? [product.imageUrl] : [];
    const specs = Object.values(
        (detail?.facetValues ?? []).reduce<Record<string, {facet: string; values: string[]}>>((groups, value) => {
            (groups[value.facet.id] ??= {facet: value.facet.name, values: []}).values.push(value.name.replace(/,\s*$/, ''));
            return groups;
        }, {}),
    );
    const summary = detail ? stripHtml(detail.description) : product.summary;
    const href = `/product/${product.slug}`;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={<button type="button" className={className} />}
                aria-label={t('quickViewNamed', {name: product.name})}
            >
                <Eye aria-hidden="true" className="size-4" />
                <span>{t('quickView')}</span>
            </DialogTrigger>
            <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-4xl">
                <div className="grid md:grid-cols-2">
                    <div className="bg-stage p-5 md:rounded-l-2xl md:p-8">
                        <div className="relative aspect-square">
                            {images[activeImage] ? (
                                <Image src={images[activeImage]} alt={product.name} fill sizes="(max-width: 768px) 90vw, 440px" className="object-contain mix-blend-multiply" />
                            ) : (
                                <span className="flex size-full items-center justify-center text-muted-foreground"><ImageOff className="size-8 opacity-50" /></span>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="mt-4 flex gap-2 overflow-x-auto">
                                {images.map((src, index) => (
                                    <button
                                        key={src}
                                        type="button"
                                        onClick={() => setActiveImage(index)}
                                        aria-label={t('showImage', {index: index + 1})}
                                        aria-pressed={index === activeImage}
                                        className={cn('relative size-14 shrink-0 overflow-hidden rounded-md border bg-card', index === activeImage ? 'border-brand' : 'border-border')}
                                    >
                                        <Image src={`${src}?preset=thumb`} alt="" fill sizes="56px" className="object-contain mix-blend-multiply" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col p-6 md:p-8">
                        {category && <p className="spec-label text-brand">{category}</p>}
                        <DialogTitle className="mt-2 font-display-wide text-2xl font-bold leading-tight">{product.name}</DialogTitle>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            {product.price && (
                                <p className="text-2xl font-bold tracking-tight">
                                    <ProductCardPrice slug={product.slug} initial={product.price} />
                                </p>
                            )}
                            <StockBadge inStock={product.inStock} />
                        </div>
                        <DialogDescription className="mt-4 text-sm leading-relaxed text-muted-foreground">
                            {summary || t('noDescription')}
                        </DialogDescription>

                        {!detail && !failed && (
                            <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                                {t('loadingDetails')}
                            </p>
                        )}
                        {specs.length > 0 && (
                            <dl className="mt-5 divide-y divide-border rounded-lg border border-border text-sm">
                                {specs.map((row) => (
                                    <div key={row.facet} className="grid grid-cols-5 gap-3 px-3.5 py-2.5">
                                        <dt className="col-span-2 font-semibold">{row.facet}</dt>
                                        <dd className="col-span-3 text-muted-foreground">{row.values.join(', ')}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                        {product.sku && <p className="spec-label mt-4 text-steel">{t('sku', {sku: product.sku})}</p>}

                        <div className="mt-auto flex flex-col gap-2.5 pt-6 sm:flex-row">
                            {product.inStock ? (
                                <QuickAddButton slug={product.slug} name={product.name} inStock className="h-11" />
                            ) : (
                                <QuoteButton product={product.slug} intent="quote" hideIcon className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-logo-blue px-4 text-sm font-semibold text-white transition-colors hover:bg-logo-blue-deep">
                                    {t('askAvailability')}
                                </QuoteButton>
                            )}
                            <Link
                                href={href}
                                onClick={() => setOpen(false)}
                                className="group/btn inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-foreground/15 px-4 text-sm font-semibold transition-colors hover:border-foreground/35"
                            >
                                {t('viewDetails')}
                                <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
