import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {getShopCategories} from '@/features/collections/data';
import {getCatalogListing} from '@/features/products/data';
import {CONTACT_CONFIG, getPhoneHref} from '@/config/contact';
import {CUSTOMER_OFFERS, FOCUS_COLLECTION_SLUGS} from '@/config/catalog-focus';
import {BRAND_LOGO} from '@/site/content/media';
import {SiteHeader, type MegaMenuData, type SiteNavItem} from '@/site/navigation/navbar/site-header';
import {MobileTabBar} from '@/site/navigation/navbar/mobile-tab-bar';

const MEGA_PRODUCTS_PER_CATEGORY = 5;
/** Most Atta Chakki models listed in the nav item's hover dropdown. */
const NAV_DROPDOWN_PRODUCTS = 12;

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

    // Atta Chakki focus (2026-10-08): Home · Atta Chakki · About · Shop All · FAQ · Contact.
    // "Shop All" opens every listed product; "Atta Chakki" opens the focus collection page
    // (config/catalog-focus.ts). Without a focus only "Shop All" is shown.
    const focusSlug = FOCUS_COLLECTION_SLUGS[0];
    // Hover dropdown under "Atta Chakki": the focus collection's products (name + photo
    // only — no stock state, at client request), read from Vendure at build time.
    const focusListing = focusSlug ? await getCatalogListing(locale, {take: NAV_DROPDOWN_PRODUCTS, collectionSlug: focusSlug}) : null;
    const focusChildren = focusListing?.products.map(({name, slug, imageUrl}) => ({label: name.trim(), href: `/product/${slug}`, imageUrl})) ?? [];
    const items: SiteNavItem[] = [
        {key: 'home', label: t('home'), href: '/'},
        ...(focusSlug ? [{key: 'attaChakki', label: t('attaChakki'), href: `/collection/${focusSlug}`, children: focusChildren}] : []),
        /* Hidden 2026-10-08 — "Why Millnex" (homepage anchor), removed from the nav at client request.
        {key: 'why', label: t('whyMillnex'), href: '/#why-millnex'},
        */
        {key: 'about', label: t('about'), href: '/about'},
        {key: 'shop', label: t('shopAll'), href: '/shop'},
        {key: 'faq', label: t('faq'), href: '/faq'},
        {key: 'contact', label: t('contact'), href: '/contact'},
    ];
    /* Hidden 2026-10-08 — previous items: the "Categories" mega menu (every machine
       category) and Manufacturing (still reachable from the homepage and About).
        {key: 'shop', label: t('shop'), href: '/shop'},
        ...(categories.length > 0 ? [{key: 'categories', label: t('categories'), href: '/shop'}] : []),
        {key: 'manufacturing', label: t('manufacturing'), href: '/manufacturing'},
    */

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
                    // Announcement bar (2026-10-08). Previously: utilityDomestic, utilitySupport, utilitySecure.
                    utility: [t('utilityDemo'), t('utilityShipping', {km: CUSTOMER_OFFERS.freeShippingKm}), t('utilitySecure')],
                    megaCategories: t('megaCategories'),
                    megaByType: typeFacet ? t('megaByType', {facet: typeFacet.name.toLowerCase()}) : '',
                    megaViewCategory: t('megaViewCategory'),
                    megaHelpTitle: t('megaHelpTitle'),
                    megaHelpBody: t('megaHelpBody'),
                    browseAllMachines: t('browseAllMachines'),
                    compare: t('compareModels'),
                    company: t('company'),
                    contact: t('contact'),
                }}
            />
            <MobileTabBar />
        </>
    );
}
