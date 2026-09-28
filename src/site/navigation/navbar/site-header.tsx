'use client';

import {useEffect, useState} from 'react';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {ChevronDown, Heart, LayoutGrid, LogIn, Menu, Package, Search, User, UserPlus} from 'lucide-react';
import {Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger} from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {cn} from '@/lib/utils';
import {Link} from '@/platform/i18n/navigation';
import {useAuth} from '@/features/authentication/auth-context';
import {CartDrawer} from '@/features/cart/cart-drawer';
import {useWishlist} from '@/features/products/wishlist';
import {AccountMenu} from '@/site/navigation/navbar/account-menu';
import {SearchOverlay} from '@/site/navigation/navbar/search-overlay';

export interface SiteNavItem {
    key: string;
    label: string;
    /** Locale-less path (the i18n Link adds the locale), e.g. "/shop". */
    href: string;
}

export interface SiteNavCategory {
    name: string;
    slug: string;
}

interface SiteHeaderProps {
    items: SiteNavItem[];
    categories: SiteNavCategory[];
    logo: {src: string; width: number; height: number; alt: string};
    labels: {
        categories: string;
        allProducts: string;
        searchProducts: string;
        openMenu: string;
        menu: string;
        primaryNavigation: string;
        account: string;
        myAccount: string;
        myOrders: string;
        signIn: string;
        createAccount: string;
        wishlist: string;
    };
}

/**
 * Routes whose first section is a dark (ink) hero, so the header can start
 * transparent with light text and turn solid once the page scrolls.
 * Everything else (shop, product, cart, checkout, account…) gets the solid
 * header from the first paint.
 */
// Empty since the light redesign: no route opens on a dark hero any more.
// Add a route segment here if one does again.
const TRANSPARENT_ROUTES = new Set<string>([]);

function routeSegment(pathname: string): string {
    // "/en/about/" -> "about"; "/en/product/x/" -> "product/x"
    return pathname.replace(/^\/[^/]+/, '').replace(/^\/+|\/+$/g, '');
}

function activeKeyFor(segment: string): string | null {
    if (segment === '') return 'home';
    const first = segment.split('/')[0];
    if (['shop', 'search', 'product'].includes(first)) return 'shop';
    if (first === 'collection') return 'categories';
    return ['about', 'contact'].includes(first) ? first : null;
}

export function SiteHeader({items, categories, logo, labels}: SiteHeaderProps) {
    const pathname = usePathname();
    const segment = routeSegment(pathname);
    const transparentRoute = TRANSPARENT_ROUTES.has(segment);
    const activeKey = activeKeyFor(segment);
    const {customer} = useAuth();

    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);
        onScroll();
        window.addEventListener('scroll', onScroll, {passive: true});
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const solid = !transparentRoute || scrolled || menuOpen;
    const wishlistCount = useWishlist().ids.length;
    const iconButton = cn(
        'inline-flex size-10 items-center justify-center rounded-xl transition-colors outline-none focus-visible:ring-3 focus-visible:ring-brand/40',
        solid ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/10',
    );
    const navLink = (active: boolean) => cn(
        'group relative inline-flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-brand/40',
        solid
            ? active ? 'text-foreground' : 'text-foreground/65 hover:text-foreground'
            : active ? 'text-white' : 'text-white/75 hover:text-white',
    );
    const underline = (active: boolean) => cn(
        'absolute inset-x-3 bottom-1 h-0.5 origin-left rounded-full bg-brand transition-transform duration-300',
        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50',
    );

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300',
                solid
                    ? 'border-border/70 bg-background/90 shadow-[0_10px_30px_-24px_rgb(0_0_0/0.35)] backdrop-blur-xl'
                    : 'border-transparent bg-transparent',
            )}
        >
            <div className="site-container flex h-16 items-center gap-3 lg:gap-6">
                <Link href="/" className="flex shrink-0 items-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-brand/40">
                    <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} priority className="h-[3.25rem] w-auto sm:h-14" />
                </Link>

                <nav aria-label={labels.primaryNavigation} className="hidden lg:block">
                    <ul className="flex items-center gap-0.5">
                        {items.map((item) => {
                            const active = item.key === activeKey;
                            if (item.key === 'categories') {
                                return (
                                    <li key={item.key}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger openOnHover delay={80} closeDelay={150} render={<button type="button" className={navLink(active)} />}>
                                                {item.label}
                                                <ChevronDown className="size-3.5 opacity-70" />
                                                <span aria-hidden="true" className={underline(active)} />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent sideOffset={10} className="w-64 p-1.5">
                                                {categories.map((category) => (
                                                    <DropdownMenuItem key={category.slug} className="px-2.5 py-2 text-sm" render={<Link href={`/collection/${category.slug}`} />}>
                                                        {category.name}
                                                    </DropdownMenuItem>
                                                ))}
                                                {categories.length > 0 && <DropdownMenuSeparator />}
                                                <DropdownMenuItem className="gap-2 px-2.5 py-2 text-sm font-semibold" render={<Link href="/shop" />}>
                                                    <LayoutGrid className="size-4" />
                                                    {labels.allProducts}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </li>
                                );
                            }
                            return (
                                <li key={item.key}>
                                    <Link href={item.href} aria-current={active ? 'page' : undefined} className={navLink(active)}>
                                        {item.label}
                                        <span aria-hidden="true" className={underline(active)} />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
                    {/* Desktop: search field-style trigger; mobile: icon */}
                    <button
                        type="button"
                        onClick={() => setSearchOpen(true)}
                        className={cn(
                            'hidden h-10 w-56 items-center gap-2 rounded-xl border px-3 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-brand/40 xl:flex 2xl:w-72',
                            solid
                                ? 'border-border bg-card text-muted-foreground hover:border-foreground/25'
                                : 'border-white/20 bg-white/5 text-white/75 hover:border-white/40',
                        )}
                    >
                        <Search className="size-4 shrink-0" />
                        <span className="truncate">{labels.searchProducts}</span>
                    </button>
                    <button type="button" onClick={() => setSearchOpen(true)} aria-label={labels.searchProducts} className={cn(iconButton, 'xl:hidden')}>
                        <Search className="size-5" />
                    </button>

                    <AccountMenu triggerClassName={solid ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/10'} />
                    <Link href="/wishlist" aria-label={labels.wishlist} className={cn(iconButton, 'relative')}>
                        <Heart className="size-5" />
                        {wishlistCount > 0 && (
                            <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-brand-foreground ring-2 ring-background">
                                {wishlistCount > 99 ? '99+' : wishlistCount}
                            </span>
                        )}
                    </Link>
                    <CartDrawer triggerClassName={solid ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/10'} />

                    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                        <SheetTrigger render={<button type="button" className={cn(iconButton, 'lg:hidden')} />}>
                            <Menu className="size-5" />
                            <span className="sr-only">{labels.openMenu}</span>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-sm">
                            <div className="flex h-16 items-center border-b border-border px-5">
                                <SheetTitle className="sr-only">{labels.menu}</SheetTitle>
                                <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} className="h-12 w-auto" />
                            </div>

                            <div className="p-5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        setSearchOpen(true);
                                    }}
                                    className="flex h-11 w-full items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm text-muted-foreground"
                                >
                                    <Search className="size-4" />
                                    {labels.searchProducts}
                                </button>
                            </div>

                            <nav aria-label={labels.primaryNavigation} className="px-5">
                                <ul className="divide-y divide-border border-y border-border">
                                    {items.filter((item) => item.key !== 'categories').map((item) => (
                                        <li key={item.key}>
                                            <SheetClose
                                                nativeButton={false}
                                                render={
                                                    <Link
                                                        href={item.href}
                                                        aria-current={item.key === activeKey ? 'page' : undefined}
                                                        className={cn('flex min-h-12 items-center text-base font-bold', item.key === activeKey && 'text-brand')}
                                                    />
                                                }
                                            >
                                                {item.label}
                                            </SheetClose>
                                        </li>
                                    ))}
                                </ul>
                            </nav>

                            {categories.length > 0 && (
                                <div className="px-5 pt-6">
                                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{labels.categories}</p>
                                    <ul className="space-y-1">
                                        {categories.map((category) => (
                                            <li key={category.slug}>
                                                <SheetClose
                                                    nativeButton={false}
                                                    render={<Link href={`/collection/${category.slug}`} className="flex min-h-10 items-center rounded-lg px-2 text-sm font-semibold hover:bg-muted" />}
                                                >
                                                    {category.name}
                                                </SheetClose>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="mt-6 grid gap-2 border-t border-border p-5">
                                {customer ? (
                                    <>
                                        <SheetClose nativeButton={false} render={<Link href="/account" className="flex h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold" />}>
                                            <User className="size-4" />{labels.myAccount}
                                        </SheetClose>
                                        <SheetClose nativeButton={false} render={<Link href="/account/orders" className="flex h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold" />}>
                                            <Package className="size-4" />{labels.myOrders}
                                        </SheetClose>
                                    </>
                                ) : (
                                    <>
                                        <SheetClose nativeButton={false} render={<Link href="/sign-in" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-3 text-sm font-bold text-brand-foreground" />}>
                                            <LogIn className="size-4" />{labels.signIn}
                                        </SheetClose>
                                        <SheetClose nativeButton={false} render={<Link href="/register" className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold" />}>
                                            <UserPlus className="size-4" />{labels.createAccount}
                                        </SheetClose>
                                    </>
                                )}
                                <SheetClose nativeButton={false} render={<Link href="/wishlist" className="flex h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold" />}>
                                    <Heart className="size-4" />{labels.wishlist}
                                </SheetClose>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
        </header>
    );
}
