'use client';

import {useTranslations} from 'next-intl';
import {Heart} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useWishlist} from '@/features/products/wishlist';

interface WishlistButtonProps {
    productId: string;
    name: string;
    /** `icon` — round overlay button (cards); `full` — labelled outline button (PDP). */
    variant?: 'icon' | 'full';
    className?: string;
}

export function WishlistButton({productId, name, variant = 'icon', className}: WishlistButtonProps) {
    const t = useTranslations('Wishlist');
    const {has, toggle} = useWishlist();
    const saved = has(productId);
    const label = saved ? t('removeNamed', {name}) : t('addNamed', {name});

    return (
        <button
            type="button"
            onClick={() => toggle(productId)}
            aria-pressed={saved}
            aria-label={variant === 'icon' ? label : undefined}
            title={variant === 'icon' ? label : undefined}
            className={cn(
                'inline-flex items-center justify-center transition-[color,background-color,border-color,transform] duration-200 outline-none focus-visible:ring-3 focus-visible:ring-brand/40 active:scale-95',
                variant === 'icon'
                    ? 'size-9 rounded-full bg-background/90 shadow-sm backdrop-blur hover:bg-background'
                    : 'h-11 gap-2 rounded-lg border bg-card px-4 text-sm font-semibold hover:border-foreground/35 hover:shadow-[0_10px_24px_-18px_rgb(0_0_0/0.4)]',
                variant === 'full' && (saved ? 'border-brand/40 bg-brand/[0.06]' : 'border-foreground/15'),
                saved ? 'text-brand' : variant === 'full' ? 'text-foreground' : 'text-foreground/70 hover:text-foreground',
                className,
            )}
        >
            <Heart className={cn('size-[18px]', saved && 'fill-current')} />
            {variant === 'full' && <span>{saved ? t('saved') : t('add')}</span>}
        </button>
    );
}
