'use client';

import {useEffect, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {ArrowRight, Heart, MessageSquareText, RotateCcw} from 'lucide-react';
import {QuoteButton} from '@/features/enquiry/quote-dialog';
import {Button} from '@/components/ui/button';
import {Link} from '@/platform/i18n/navigation';
import {query} from '@/platform/vendure/client-api';
import {getActiveCurrencyCode} from '@/features/currency/currency-client';
import {GetWishlistProductsQuery} from '@/features/products/graphql';
import {cardFromProduct, type ProductCardData} from '@/features/products/product-card-data';
import {PRODUCT_GRID_CLASS} from '@/features/products/product-grid-layout';
import {ProductGridSkeleton} from '@/features/products/product-grid-skeleton';
import {useWishlist} from '@/features/products/wishlist';
import {ProductCard} from './product-card';

type State =
    | {status: 'loading'}
    | {status: 'error'}
    | {status: 'ready'; products: ProductCardData[]};

/** Saved products, re-read from Vendure every time (only IDs are stored). */
export function WishlistList() {
    const t = useTranslations('Wishlist');
    const locale = useLocale();
    const {ids, retain} = useWishlist();
    const [state, setState] = useState<State>({status: 'loading'});
    const [attempt, setAttempt] = useState(0);
    const key = ids.join(',');

    useEffect(() => {
        const wanted = key ? key.split(',') : [];
        if (wanted.length === 0) {
            setState({status: 'ready', products: []});
            return;
        }
        let cancelled = false;
        getActiveCurrencyCode()
            .then((currencyCode) => query(GetWishlistProductsQuery, {ids: wanted, take: wanted.length}, {languageCode: locale, currencyCode}))
            .then(({data}) => {
                if (cancelled) return;
                const items = data.products.items.filter((product) => product.slug);
                retain(items.map((product) => product.id));
                // Keep the order the shopper saved them in.
                const byId = new Map(items.map((product) => [product.id, cardFromProduct(product)]));
                setState({status: 'ready', products: wanted.map((id) => byId.get(id)).filter((p): p is ProductCardData => !!p)});
            })
            .catch(() => !cancelled && setState({status: 'error'}));
        return () => {
            cancelled = true;
        };
    }, [key, locale, retain, attempt]);

    if (state.status === 'loading') return <ProductGridSkeleton />;

    if (state.status === 'error') {
        return (
            <div role="alert" className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-10 text-center">
                <p className="text-sm text-muted-foreground">{t('loadError')}</p>
                <Button variant="outline" className="h-11 rounded-lg border-foreground/15 px-5 font-semibold" onClick={() => setAttempt((n) => n + 1)}>
                    <RotateCcw className="mr-2 size-4" />
                    {t('retry')}
                </Button>
            </div>
        );
    }

    if (state.products.length === 0) {
        return (
            <div className="relative isolate flex flex-col items-center overflow-hidden rounded-2xl border border-border bg-surface px-6 py-16 text-center sm:py-20">
                <span className="frame-ticks flex size-16 items-center justify-center rounded-xl bg-card text-brand shadow-sm">
                    <Heart aria-hidden="true" className="size-7" />
                </span>
                <h2 className="mt-6 font-display-wide text-2xl font-bold sm:text-3xl">{t('emptyTitle')}</h2>
                <p className="mt-2 max-w-sm text-base text-muted-foreground">{t('emptyBody')}</p>
                <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 min-[420px]:w-auto min-[420px]:flex-row">
                    <Link
                        href="/shop"
                        className="group/btn inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-[15px] font-semibold text-brand-foreground shadow-[0_1px_0_0_oklch(1_0_0/0.18)_inset,0_10px_26px_-14px_var(--brand)] transition-[transform,background-color] duration-200 outline-none hover:-translate-y-0.5 hover:bg-[oklch(0.52_0.17_37)] focus-visible:ring-3 focus-visible:ring-brand/40"
                    >
                        {t('browse')}
                        <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                    <QuoteButton className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-foreground/15 bg-card px-6 text-[15px] font-semibold text-foreground transition-[transform,border-color] duration-200 outline-none hover:-translate-y-0.5 hover:border-foreground/35 focus-visible:ring-3 focus-visible:ring-brand/40 [&_svg]:size-4">
                        <MessageSquareText aria-hidden="true" />
                        {t('emptyEnquire')}
                    </QuoteButton>
                </div>
            </div>
        );
    }

    return (
        <>
            <ul className={PRODUCT_GRID_CLASS}>
                {state.products.map((product) => (
                    <li key={product.productId}>
                        <ProductCard product={product} />
                    </li>
                ))}
            </ul>
        </>
    );
}
