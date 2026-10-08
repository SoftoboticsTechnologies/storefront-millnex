'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Home, LayoutGrid, Search, ShoppingCart, User} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Link, usePathname} from '@/platform/i18n/navigation';
import {useAuth} from '@/features/authentication/auth-context';
import {useActiveOrder} from '@/features/cart/active-order';
import {CartCountBadge} from '@/features/cart/cart-drawer';
import {SearchOverlay} from '@/site/navigation/navbar/search-overlay';

/**
 * Sticky bottom navigation for phones/tablets (hidden from `lg`), keeping
 * search, cart (with its live ActiveOrder count) and account one tap away.
 * `locale-layout.tsx` pads the page by the same height so content and the
 * footer are never hidden underneath it.
 */
export function MobileTabBar() {
    const t = useTranslations('Navigation');
    const pathname = usePathname();
    const {customer} = useAuth();
    const {itemCount} = useActiveOrder();
    const [searchOpen, setSearchOpen] = useState(false);

    const first = pathname.split('/')[1] ?? '';
    // Active tab: brand colour plus a 2px indicator along the top edge,
    // echoing the header's underline.
    const itemClass = (active: boolean) => cn(
        'relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors',
        'before:absolute before:inset-x-5 before:top-0 before:h-0.5 before:origin-center before:bg-brand before:transition-transform before:duration-300',
        active ? 'text-brand before:scale-x-100' : 'text-muted-foreground before:scale-x-0 hover:text-foreground',
    );

    return (
        <>
            {/* Solid background, no backdrop-blur, on its own compositor layer
                (translateZ): mobile browsers otherwise let a blurred fixed bar
                lag behind the scroll and slide partly off-screen. */}
            <nav
                aria-label={t('mobileNavigation')}
                className="fixed inset-x-0 bottom-0 z-40 transform-gpu border-t border-border bg-background pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-18px_rgb(0_0_0/0.35)] [backface-visibility:hidden] lg:hidden"
            >
                <div className="flex h-16">
                    <Link href="/" className={itemClass(first === '')} aria-current={first === '' ? 'page' : undefined}>
                        <Home className="size-5" />
                        {t('home')}
                    </Link>
                    <Link href="/shop" className={itemClass(['shop', 'collection', 'product'].includes(first))}>
                        <LayoutGrid className="size-5" />
                        {/* 2026-10-08: "Shop" opens all listed products (briefly labelled t('attaChakki')). */}
                        {t('shop')}
                    </Link>
                    <button type="button" onClick={() => setSearchOpen(true)} className={itemClass(first === 'search')}>
                        <Search className="size-5" />
                        {t('search')}
                    </button>
                    <Link href="/cart" className={itemClass(first === 'cart')} aria-label={t('cartWithCount', {count: itemCount})}>
                        <span className="relative">
                            <ShoppingCart className="size-5" />
                            <CartCountBadge count={itemCount} />
                        </span>
                        {t('cart')}
                    </Link>
                    <Link href={customer ? '/account' : '/sign-in'} className={itemClass(['account', 'sign-in', 'register'].includes(first))}>
                        <User className="size-5" />
                        {t('account')}
                    </Link>
                </div>
            </nav>
            <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
        </>
    );
}
