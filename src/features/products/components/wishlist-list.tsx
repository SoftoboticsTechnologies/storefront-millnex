'use client';

import {useEffect, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Heart, RotateCcw} from 'lucide-react';
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
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
                <p className="text-sm text-muted-foreground">{t('loadError')}</p>
                <Button variant="outline" className="rounded-xl" onClick={() => setAttempt((n) => n + 1)}>
                    <RotateCcw className="mr-2 size-4" />
                    {t('retry')}
                </Button>
            </div>
        );
    }

    if (state.products.length === 0) {
        return (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-background text-brand shadow-sm">
                    <Heart className="size-7" />
                </span>
                <p className="mt-5 text-lg font-bold">{t('emptyTitle')}</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">{t('emptyBody')}</p>
                <Button
                    render={<Link href="/shop" />}
                    nativeButton={false}
                    className="mt-6 h-11 rounded-xl bg-brand px-6 font-bold text-brand-foreground hover:bg-brand/90"
                >
                    {t('browse')}
                </Button>
            </div>
        );
    }

    return (
        <>
            <p className="mb-5 text-sm text-muted-foreground">{t('count', {count: state.products.length})}</p>
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
