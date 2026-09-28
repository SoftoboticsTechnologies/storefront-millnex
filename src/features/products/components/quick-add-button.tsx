'use client';

import {useState, useTransition} from 'react';
import {useTranslations} from 'next-intl';
import {toast} from 'sonner';
import {CheckCircle2, Loader2, ShoppingCart} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {useRouter} from '@/platform/i18n/navigation';
import {query} from '@/platform/vendure/client-api';
import {GetProductDetailQuery} from '@/features/products/graphql';
import {addToCart} from '@/features/products/add-to-cart';

interface QuickAddButtonProps {
    slug: string;
    name: string;
    inStock: boolean;
    className?: string;
}

/**
 * Card-level "Add to cart". A search result doesn't say how many variants a
 * product has, so this resolves the product's real variants from Vendure on
 * click: a single-variant product is added to the ActiveOrder directly (the
 * same `addToCart` the PDP uses — Vendure prices it); a product with options
 * sends the shopper to its detail page to choose them instead of guessing a
 * variant on their behalf.
 */
export function QuickAddButton({slug, name, inStock, className}: QuickAddButtonProps) {
    const t = useTranslations('Product');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [added, setAdded] = useState(false);

    const handleClick = () => {
        startTransition(async () => {
            try {
                const {data} = await query(GetProductDetailQuery, {slug});
                const variants = data.product?.variants ?? [];
                if (variants.length !== 1) {
                    router.push(`/product/${slug}`);
                    return;
                }
                const [variant] = variants;
                if (variant.stockLevel === 'OUT_OF_STOCK') {
                    toast.error(t('outOfStock'));
                    return;
                }
                const result = await addToCart(variant.id, 1);
                if (result.success) {
                    setAdded(true);
                    toast.success(t('addedToCartMessage'), {description: t('addedToCartDescription', {name})});
                    setTimeout(() => setAdded(false), 2000);
                } else {
                    toast.error(t('errorTitle'), {description: result.error || t('errorAddToCart')});
                }
            } catch {
                toast.error(t('errorTitle'), {description: t('errorAddToCart')});
            }
        });
    };

    return (
        <Button
            type="button"
            onClick={handleClick}
            disabled={!inStock || isPending}
            className={cn('h-10 flex-1 rounded-xl bg-brand font-semibold text-brand-foreground hover:bg-brand/90', className)}
        >
            {isPending ? (
                <Loader2 className="size-4 animate-spin" />
            ) : added ? (
                <CheckCircle2 className="size-4" />
            ) : (
                <ShoppingCart className="size-4" />
            )}
            <span className="truncate">
                {!inStock ? t('outOfStock') : added ? t('addedToCart') : t('addToCart')}
            </span>
        </Button>
    );
}
