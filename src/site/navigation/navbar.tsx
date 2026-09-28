import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {getShopCategories} from '@/features/collections/data';
import {BRAND_LOGO} from '@/site/content/media';
import {SiteHeader, type SiteNavItem} from '@/site/navigation/navbar/site-header';
import {MobileTabBar} from '@/site/navigation/navbar/mobile-tab-bar';

/**
 * Site-wide storefront header (+ mobile bottom tab bar). Resolves translated
 * labels and the real Vendure category list at build time, then hands them
 * to the client `SiteHeader` (scroll state, dropdowns, account/cart state).
 */
export async function Navbar() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Navigation'});
    const categories = (await getShopCategories(locale)).map(({name, slug}) => ({name: name.trim(), slug}));

    const items: SiteNavItem[] = [
        {key: 'home', label: t('home'), href: '/'},
        {key: 'shop', label: t('shop'), href: '/shop'},
        // Only offered when Vendure actually has categories.
        ...(categories.length > 0 ? [{key: 'categories', label: t('categories'), href: '/shop'}] : []),
        {key: 'about', label: t('about'), href: '/about'},
        {key: 'contact', label: t('contact'), href: '/contact'},
    ];

    return (
        <>
            <SiteHeader
                items={items}
                categories={categories}
                logo={{...BRAND_LOGO, alt: t('logoAlt')}}
                labels={{
                    categories: t('categories'),
                    allProducts: t('allProducts'),
                    searchProducts: t('searchProducts'),
                    openMenu: t('openMenu'),
                    menu: t('menu'),
                    primaryNavigation: t('primaryNavigation'),
                    account: t('account'),
                    myAccount: t('myAccount'),
                    myOrders: t('myOrders'),
                    signIn: t('signIn'),
                    createAccount: t('createAccount'),
                    wishlist: t('wishlist'),
                }}
            />
            <MobileTabBar />
        </>
    );
}
