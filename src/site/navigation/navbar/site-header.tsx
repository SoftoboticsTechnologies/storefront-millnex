'use client';

import {useEffect, useRef, useState} from 'react';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {ArrowRight, ArrowUpRight, ChevronDown, Heart, ImageOff, LogIn, Menu, Package, Phone, Search, ShieldCheck, ShoppingCart, User, UserPlus} from 'lucide-react';
import {Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger} from '@/components/ui/sheet';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {cn} from '@/lib/utils';
import {Link} from '@/platform/i18n/navigation';
import {FOCUS_COLLECTION_SLUGS} from '@/config/catalog-focus';
import {useAuth} from '@/features/authentication/auth-context';
import {CartDrawer} from '@/features/cart/cart-drawer';
import {useWishlist} from '@/features/products/wishlist';
import {AccountMenu} from '@/site/navigation/navbar/account-menu';
import {MegaMenu} from '@/site/navigation/navbar/mega-menu';
import {SearchOverlay} from '@/site/navigation/navbar/search-overlay';

export interface SiteNavItem {
    key: string;
    label: string;
    /** Locale-less path (the i18n Link adds the locale), e.g. "/shop". */
    href: string;
    /** Hover dropdown links (desktop) / accordion (mobile menu), e.g. the Atta Chakki models. */
    children?: SiteNavChild[];
}

export interface SiteNavChild {
    label: string;
    href: string;
    imageUrl: string | null;
}

export interface MegaMenuProduct {
    name: string;
    slug: string;
    imageUrl: string | null;
    inStock: boolean;
}

export interface MegaMenuData {
    totalProducts: number;
    categories: Array<{name: string; slug: string; productCount: number; products: MegaMenuProduct[]}>;
    /** The catalog's main Vendure facet (e.g. "Type"), linked as shop filters. */
    typeFacet: {id: string; name: string; values: Array<{id: string; name: string; count: number}>} | null;
}

export interface SiteHeaderLabels {
    categories: string;
    allProducts: string;
    searchProducts: string;
    openMenu: string;
    menu: string;
    primaryNavigation: string;
    myAccount: string;
    myOrders: string;
    signIn: string;
    createAccount: string;
    wishlist: string;
    cart: string;
    utility: string[];
    megaCategories: string;
    megaByType: string;
    megaViewCategory: string;
    megaHelpTitle: string;
    megaHelpBody: string;
    browseAllMachines: string;
    compare: string;
    company: string;
    contact: string;
}

interface SiteHeaderProps {
    items: SiteNavItem[];
    mega: MegaMenuData;
    logo: {src: string; width: number; height: number; alt: string};
    phone: {href: string; label: string} | null;
    labels: SiteHeaderLabels;
}

/**
 * Routes whose first section is a full-bleed tinted hero (which includes the
 * header space): the header starts transparent there (same dark text) and
 * turns solid once the page scrolls.
 * Every other route gets the solid header from the first paint.
 */
// Not the homepage: its hero is a banner carousel that starts below the header.
const TRANSPARENT_ROUTES = new Set<string>(['about', 'manufacturing', 'shop', 'collection', 'search']);

function routeSegment(pathname: string): string {
    // "/en/about/" -> "about"; "/en/product/x/" -> "product/x"
    return pathname.replace(/^\/[^/]+/, '').replace(/^\/+|\/+$/g, '');
}

function activeKeyFor(segment: string): string | null {
    if (segment === '') return 'home';
    const first = segment.split('/')[0];
    // The focus collection page is "Atta Chakki"; every other collection (grinders,
    // cutters…) belongs to "Shop" ("categories" while the mega menu was shown).
    if (first === 'collection' && FOCUS_COLLECTION_SLUGS.includes(segment.split('/')[1] ?? '')) return 'attaChakki';
    if (['shop', 'search', 'product', 'compare', 'collection'].includes(first)) return 'shop';
    return ['about', 'manufacturing', 'faq', 'contact'].includes(first) ? first : null;
}

export function SiteHeader({items, mega, logo, phone, labels}: SiteHeaderProps) {
    const pathname = usePathname();
    const segment = routeSegment(pathname);
    // Matched on the first path segment, so every /collection/<slug> counts.
    const transparentRoute = TRANSPARENT_ROUTES.has(segment.split('/')[0]);
    const activeKey = activeKeyFor(segment);
    const {customer} = useAuth();

    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [megaOpen, setMegaOpen] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, {passive: true});
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close the mega menu on navigation and on Escape.
    useEffect(() => setMegaOpen(false), [pathname]);
    useEffect(() => {
        if (!megaOpen) return;
        const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMegaOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [megaOpen]);

    const openMega = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setMegaOpen(true);
    };
    const scheduleCloseMega = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setMegaOpen(false), 160);
    };

    const solid = !transparentRoute || scrolled || menuOpen || megaOpen;
    const wishlistCount = useWishlist().ids.length;

    const iconButton = cn(
        'relative inline-flex size-10 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-3 focus-visible:ring-brand/40',
        'text-foreground hover:bg-muted',
    );
    const navLink = (active: boolean) => cn(
        'group relative inline-flex h-16 items-center gap-1 px-3 text-[14px] font-semibold transition-colors outline-none focus-visible:text-brand 2xl:px-3.5',
        active ? 'text-foreground' : 'text-foreground/65 hover:text-foreground',
    );
    const underline = (active: boolean) => cn(
        'absolute inset-x-3 bottom-0 h-[2px] origin-left bg-brand transition-transform duration-300 ease-out 2xl:inset-x-3.5',
        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
    );

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 transition-transform duration-300 ease-out',
                // The 32px utility bar (lg+) slides away once the page scrolls.
                scrolled && !megaOpen && 'lg:-translate-y-8',
            )}
            onMouseLeave={scheduleCloseMega}
        >
            <div className="hidden h-8 border-b border-logo-blue/10 bg-tint-blue text-logo-blue-deep lg:block">
                <div className="site-container flex h-full items-center justify-between gap-6 text-xs">
                    <p className="flex items-center gap-2.5">
                        <ShieldCheck aria-hidden="true" className="size-3.5 text-logo-green-deep" />
                        {labels.utility.map((part, index) => (
                            <span key={part} className="flex items-center gap-2.5">
                                {index > 0 && <span aria-hidden="true" className="size-1 rounded-full bg-current opacity-40" />}
                                {part}
                            </span>
                        ))}
                    </p>
                    <div className="flex items-center gap-5">
                        {phone && (
                            <a href={phone.href} className="flex items-center gap-1.5 font-medium transition-colors hover:text-brand">
                                <Phone aria-hidden="true" className="size-3.5" />
                                {phone.label}
                            </a>
                        )}
                        <Link href="/compare" className="font-medium transition-colors hover:text-brand">{labels.compare}</Link>
                    </div>
                </div>
            </div>

            <div
                className={cn(
                    'border-b transition-[background-color,border-color,box-shadow] duration-300',
                    solid
                        ? 'border-border bg-background/95 shadow-[0_12px_32px_-28px_rgb(10_15_25/0.45)] backdrop-blur-xl'
                        : 'border-transparent bg-transparent',
                )}
            >
                <div className="site-container flex h-16 items-center gap-2 xl:gap-5">
                    <Link href="/" className="flex shrink-0 items-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-brand/40">
                        <Image
                            src={logo.src}
                            alt={logo.alt}
                            width={logo.width}
                            height={logo.height}
                            priority
                            className="h-12 w-auto sm:h-[3.25rem]"
                        />
                    </Link>

                    <nav aria-label={labels.primaryNavigation} className="ml-2 hidden xl:block">
                        <ul className="flex items-center">
                            {items.map((item) => {
                                const active = item.key === activeKey;
                                if (item.key === 'categories') {
                                    return (
                                        <li key={item.key} onMouseEnter={openMega}>
                                            <button
                                                type="button"
                                                aria-expanded={megaOpen}
                                                aria-controls="mega-menu"
                                                onClick={() => setMegaOpen((open) => !open)}
                                                className={navLink(active || megaOpen)}
                                            >
                                                {item.label}
                                                <ChevronDown aria-hidden="true" className={cn('size-3.5 opacity-70 transition-transform duration-200', megaOpen && 'rotate-180')} />
                                                <span aria-hidden="true" className={underline(active || megaOpen)} />
                                            </button>
                                        </li>
                                    );
                                }
                                if (item.children && item.children.length > 0) {
                                    return (
                                        <li key={item.key} onMouseEnter={scheduleCloseMega}>
                                            <NavDropdown item={item} active={active} viewAll={labels.megaViewCategory} linkClassName={navLink(active)} underlineClassName={underline(active)} />
                                        </li>
                                    );
                                }
                                return (
                                    <li key={item.key} onMouseEnter={scheduleCloseMega}>
                                        <Link href={item.href} aria-current={active ? 'page' : undefined} className={navLink(active)}>
                                            {item.label}
                                            <span aria-hidden="true" className={underline(active)} />
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
                        {/* Field-style trigger from lg (narrower at xl, where the full nav
                            shares the row); icon-only below. Both open the search overlay. */}
                        <button
                            type="button"
                            onClick={() => setSearchOpen(true)}
                            className="mr-2 hidden h-11 w-72 items-center gap-2.5 rounded-full border border-border bg-card px-4 text-[15px] text-muted-foreground shadow-[0_1px_2px_rgb(10_15_25/0.04)] transition-[border-color,box-shadow] outline-none hover:border-foreground/25 hover:shadow-[0_4px_14px_-8px_rgb(10_15_25/0.25)] focus-visible:ring-3 focus-visible:ring-brand/40 lg:flex xl:w-56 2xl:w-72"
                        >
                            <Search aria-hidden="true" className="size-[18px] shrink-0 text-foreground/80" />
                            <span className="truncate">{labels.searchProducts}</span>
                        </button>
                        {/* Phones get the wishlist here instead; search stays in the bottom tab bar and the menu drawer. */}
                        <button type="button" onClick={() => setSearchOpen(true)} aria-label={labels.searchProducts} className={cn(iconButton, 'hidden sm:inline-flex lg:hidden')}>
                            <Search className="size-5" />
                        </button>
                        <AccountMenu triggerClassName={'hidden sm:inline-flex rounded-lg text-foreground hover:bg-muted'} />
                        <Link href="/wishlist" aria-label={labels.wishlist} className={iconButton}>
                            <Heart className="size-5" />
                            {wishlistCount > 0 && (
                                <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-brand-foreground ring-2 ring-background">
                                    {wishlistCount > 99 ? '99+' : wishlistCount}
                                </span>
                            )}
                        </Link>
                        <CartDrawer triggerClassName={'rounded-lg text-foreground hover:bg-muted'} />


                        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                            <SheetTrigger render={<button type="button" className={cn(iconButton, 'ml-1 xl:hidden')} />}>
                                <Menu className="size-5" />
                                <span className="sr-only">{labels.openMenu}</span>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-sm">
                                <div className="flex h-16 items-center border-b border-border px-5">
                                    <SheetTitle className="sr-only">{labels.menu}</SheetTitle>
                                    <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} className="h-12 w-auto" />
                                </div>

                                <div className="p-5 pb-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            setSearchOpen(true);
                                        }}
                                        className="flex h-11 w-full items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground"
                                    >
                                        <Search className="size-4" />
                                        {labels.searchProducts}
                                    </button>
                                </div>

                                <nav aria-label={labels.primaryNavigation} className="px-5">
                                    <ul className="divide-y divide-border border-y border-border">
                                        {items.map((item) => item.key === 'categories' ? (
                                            <li key={item.key}>
                                                <Accordion>
                                                    <AccordionItem value="categories" className="border-0">
                                                        <AccordionTrigger className="min-h-12 items-center py-0 text-base font-bold hover:no-underline">{item.label}</AccordionTrigger>
                                                        <AccordionContent className="pb-3">
                                                            <ul className="space-y-3">
                                                                {mega.categories.map((category) => (
                                                                    <li key={category.slug}>
                                                                        <SheetClose
                                                                            nativeButton={false}
                                                                            render={<Link href={`/collection/${category.slug}`} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5 text-sm font-bold" />}
                                                                        >
                                                                            {category.name}
                                                                        </SheetClose>
                                                                        <ul className="mt-1 space-y-0.5 pl-3">
                                                                            {category.products.map((product) => (
                                                                                <li key={product.slug}>
                                                                                    <SheetClose
                                                                                        nativeButton={false}
                                                                                        render={<Link href={`/product/${product.slug}`} className="flex min-h-9 items-center text-sm text-muted-foreground hover:text-foreground" />}
                                                                                    >
                                                                                        <span className="truncate">{product.name}</span>
                                                                                    </SheetClose>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Accordion>
                                            </li>
                                        ) : item.children && item.children.length > 0 ? (
                                            <li key={item.key}>
                                                <Accordion>
                                                    <AccordionItem value={item.key} className="border-0">
                                                        <AccordionTrigger className={cn('min-h-12 items-center py-0 text-base font-bold hover:no-underline', item.key === activeKey && 'text-brand')}>{item.label}</AccordionTrigger>
                                                        <AccordionContent className="pb-3">
                                                            <ul className="space-y-0.5">
                                                                {item.children.map((child) => (
                                                                    <li key={child.href}>
                                                                        <SheetClose
                                                                            nativeButton={false}
                                                                            render={<Link href={child.href} className="flex min-h-10 items-center gap-3 rounded-lg px-1 text-sm font-medium text-foreground/80 hover:text-foreground" />}
                                                                        >
                                                                            <NavChildThumb imageUrl={child.imageUrl} className="size-9" />
                                                                            <span className="truncate">{child.label}</span>
                                                                        </SheetClose>
                                                                    </li>
                                                                ))}
                                                                <li>
                                                                    <SheetClose
                                                                        nativeButton={false}
                                                                        render={<Link href={item.href} className="mt-1 flex min-h-10 items-center gap-1.5 px-1 text-sm font-semibold text-brand" />}
                                                                    >
                                                                        {labels.megaViewCategory}
                                                                        <ArrowRight aria-hidden="true" className="size-3.5" />
                                                                    </SheetClose>
                                                                </li>
                                                            </ul>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Accordion>
                                            </li>
                                        ) : (
                                            <li key={item.key}>
                                                <SheetClose
                                                    nativeButton={false}
                                                    render={
                                                        <Link
                                                            href={item.href}
                                                            aria-current={item.key === activeKey ? 'page' : undefined}
                                                            className={cn('flex min-h-12 items-center justify-between text-base font-bold', item.key === activeKey && 'text-brand')}
                                                        />
                                                    }
                                                >
                                                    {item.label}
                                                    <ArrowRight aria-hidden="true" className="size-4 text-steel" />
                                                </SheetClose>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>

                                <div className="grid gap-2 p-5">
                                    {customer ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            <SheetClose nativeButton={false} render={<Link href="/account" className="flex h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold" />}>
                                                <User className="size-4" />{labels.myAccount}
                                            </SheetClose>
                                            <SheetClose nativeButton={false} render={<Link href="/account/orders" className="flex h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold" />}>
                                                <Package className="size-4" />{labels.myOrders}
                                            </SheetClose>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            <SheetClose nativeButton={false} render={<Link href="/sign-in" className="flex h-11 items-center justify-center gap-2 rounded-lg bg-logo-blue px-3 text-sm font-bold text-white" />}>
                                                <LogIn className="size-4" />{labels.signIn}
                                            </SheetClose>
                                            <SheetClose nativeButton={false} render={<Link href="/register" className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold" />}>
                                                <UserPlus className="size-4" />{labels.createAccount}
                                            </SheetClose>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                        <SheetClose nativeButton={false} render={<Link href="/wishlist" className="flex h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold" />}>
                                            <Heart className="size-4" />{labels.wishlist}
                                            {wishlistCount > 0 && <span className="spec-label ml-auto text-brand">{wishlistCount}</span>}
                                        </SheetClose>
                                        <SheetClose nativeButton={false} render={<Link href="/cart" className="flex h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold" />}>
                                            <ShoppingCart className="size-4" />{labels.cart}
                                        </SheetClose>
                                    </div>
                                    {phone && (
                                        <a href={phone.href} className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
                                            <Phone aria-hidden="true" className="size-4" />
                                            {phone.label}
                                        </a>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>

            <MegaMenu
                id="mega-menu"
                open={megaOpen}
                data={mega}
                labels={labels}
                onMouseEnter={openMega}
                onNavigate={() => setMegaOpen(false)}
            />

            <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} categories={mega.categories} />
        </header>
    );
}

function NavChildThumb({imageUrl, className}: {imageUrl: string | null; className?: string}) {
    return (
        <span className={cn('relative shrink-0 overflow-hidden rounded-md border border-border bg-stage', className)}>
            {imageUrl ? (
                <Image src={`${imageUrl}?preset=thumb`} alt="" fill sizes="48px" className="object-contain mix-blend-multiply" />
            ) : (
                <ImageOff aria-hidden="true" className="absolute inset-0 m-auto size-4 text-muted-foreground" />
            )}
        </span>
    );
}

/**
 * Desktop nav item with a hover/focus dropdown (e.g. "Atta Chakki" → its
 * models). The label still links to the item's page; the panel opens on
 * hover or keyboard focus (CSS only) and lists name + photo — no stock
 * state, at client request.
 */
function NavDropdown({item, active, viewAll, linkClassName, underlineClassName}: {
    item: SiteNavItem;
    active: boolean;
    viewAll: string;
    linkClassName: string;
    underlineClassName: string;
}) {
    return (
        <div className="group/dd relative">
            <Link href={item.href} aria-current={active ? 'page' : undefined} aria-haspopup="true" className={linkClassName}>
                {item.label}
                <ChevronDown aria-hidden="true" className="size-3.5 opacity-70 transition-transform duration-200 group-hover/dd:rotate-180 group-focus-within/dd:rotate-180" />
                <span aria-hidden="true" className={underlineClassName} />
            </Link>
            <div className="invisible absolute left-0 top-full z-50 -translate-y-1 pt-1 opacity-0 transition-[opacity,transform,visibility] duration-200 ease-out group-hover/dd:visible group-hover/dd:translate-y-0 group-hover/dd:opacity-100 group-focus-within/dd:visible group-focus-within/dd:translate-y-0 group-focus-within/dd:opacity-100">
                <div className="w-80 rounded-xl border border-border bg-background p-2 shadow-[0_24px_48px_-24px_rgb(10_15_25/0.45)]">
                    <ul className="max-h-[min(70vh,32rem)] overflow-y-auto">
                        {(item.children ?? []).map((child) => (
                            <li key={child.href}>
                                <Link href={child.href} className="group/item flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors outline-none hover:bg-muted focus-visible:bg-muted">
                                    <NavChildThumb imageUrl={child.imageUrl} className="size-11" />
                                    <span className="min-w-0 flex-1 text-sm font-semibold leading-snug group-hover/item:text-brand">{child.label}</span>
                                    <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-steel opacity-0 transition-opacity group-hover/item:opacity-100" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <Link href={item.href} className="mt-1 flex items-center gap-1.5 border-t border-border px-2 pb-1 pt-2.5 text-sm font-semibold text-brand outline-none hover:underline focus-visible:underline">
                        {viewAll}
                        <ArrowRight aria-hidden="true" className="size-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
