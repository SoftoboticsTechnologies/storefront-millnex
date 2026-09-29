import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {getShopCategories} from '@/features/collections/data';
import {getCatalogListing} from '@/features/products/data';
import {CONTACT_CONFIG, getPhoneHref} from '@/config/contact';
import {BRAND_LOGO} from '@/site/content/media';
import {SiteHeader, type MegaMenuData, type SiteNavItem} from '@/site/navigation/navbar/site-header';
import {MobileTabBar} from '@/site/navigation/navbar/mobile-tab-bar';

const MEGA_PRODUCTS_PER_CATEGORY = 5;

/**
 * Site-wide storefront header (+ mobile bottom tab bar). Resolves translated
 * labels and the mega-menu data at build time — every category, product and
 * type in it is read from Vendure (collections, their products, and the
 * catalog's largest facet), so nothing is hardcoded — then hands them to
 * the client `SiteHeader` (scroll state, menus, account/cart state).
 */
export async function Navbar() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Navigation'});
    const [categories, catalog] = await Promise.all([
        getShopCategories(locale),
        getCatalogListing(locale, {take: 1}),
    ]);

    const categoryListings = await Promise.all(
        categories.map((category) => getCatalogListing(locale, {take: MEGA_PRODUCTS_PER_CATEGORY, collectionSlug: category.slug})),
    );
    const categoryNames = new Set(categories.map((category) => category.name.trim().toLowerCase()));
    // "Shop by type": the facet with the most values, minus values that only
    // repeat a category name (Vendure data often mirrors collections as facet values).
    const typeFacet = [...catalog.facets]
        .map((facet) => ({...facet, values: facet.values.filter((value) => !categoryNames.has(value.name.toLowerCase()))}))
        .sort((a, b) => b.values.length - a.values.length)[0];

    const mega: MegaMenuData = {
        totalProducts: catalog.totalItems,
        categories: categories.map((category, index) => ({
            name: category.name.trim(),
            slug: category.slug,
            productCount: categoryListings[index].totalItems,
            products: categoryListings[index].products.map(({name, slug, imageUrl, inStock}) => ({name: name.trim(), slug, imageUrl, inStock})),
        })),
        typeFacet: typeFacet && typeFacet.values.length > 0 ? typeFacet : null,
    };

    const items: SiteNavItem[] = [
        {key: 'home', label: t('home'), href: '/'},
        {key: 'shop', label: t('shop'), href: '/shop'},
        // Only offered when Vendure actually has categories.
        ...(categories.length > 0 ? [{key: 'categories', label: t('categories'), href: '/shop'}] : []),
        {key: 'about', label: t('about'), href: '/about'},
        {key: 'manufacturing', label: t('manufacturing'), href: '/manufacturing'},
        {key: 'faq', label: t('faq'), href: '/faq'},
        {key: 'contact', label: t('contact'), href: '/contact'},
    ];

    const phoneHref = getPhoneHref();

    return (
        <>
            <SiteHeader
                items={items}
                mega={mega}
                logo={{...BRAND_LOGO, alt: t('logoAlt')}}
                phone={phoneHref ? {href: phoneHref, label: CONTACT_CONFIG.phone} : null}
                labels={{
                    categories: t('categories'),
                    allProducts: t('allProducts'),
                    searchProducts: t('searchProducts'),
                    openMenu: t('openMenu'),
                    menu: t('menu'),
                    primaryNavigation: t('primaryNavigation'),
                    myAccount: t('myAccount'),
                    myOrders: t('myOrders'),
                    signIn: t('signIn'),
                    createAccount: t('createAccount'),
                    wishlist: t('wishlist'),
                    cart: t('cart'),
                    utility: [t('utilityDomestic'), t('utilitySupport'), t('utilitySecure')],
                    megaCategories: t('megaCategories'),
                    megaByType: typeFacet ? t('megaByType', {facet: typeFacet.name.toLowerCase()}) : '',
                    megaViewCategory: t('megaViewCategory'),
                    megaHelpTitle: t('megaHelpTitle'),
                    megaHelpBody: t('megaHelpBody'),
                    browseAllMachines: t('browseAllMachines'),
                    compare: t('compare'),
                    company: t('company'),
                    contact: t('contact'),
                }}
            />
            <MobileTabBar />
        </>
    );
}
