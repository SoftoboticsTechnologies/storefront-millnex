import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {query} from '@/platform/vendure/api';
import {getRouteLocale} from '@/platform/i18n/server';
import {routing} from '@/platform/i18n/routing';
import {toOgLocale} from '@/platform/i18n/locale-utils';
import {buildCanonicalUrl, SITE_NAME} from '@/config/metadata';
import {getActiveCurrencyCode} from '@/features/currency/currency-server';
import {getCollectionNames, getShopCategories} from '@/features/collections/data';
import {SearchProductsQuery} from '@/features/search/graphql';
import {buildSearchInput} from '@/features/search/search-helpers';
import {SearchResults} from '@/features/search/routes/search-results';
import {CategoryTabs} from '@/features/search/category-tabs';
import {ListingBanner} from '@/components/listing-banner';
import {cardFromSearchResult} from '@/features/products/product-card-data';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Shop'});
    const url = buildCanonicalUrl(`/${locale}/shop/`);

    return {
        title: t('title'),
        description: t('metaDescription', {siteName: SITE_NAME}),
        alternates: {
            canonical: url,
            languages: Object.fromEntries(routing.locales.map((l) => [l, buildCanonicalUrl(`/${l}/shop/`)])),
        },
        openGraph: {
            title: t('title'),
            description: t('metaDescription', {siteName: SITE_NAME}),
            type: 'website',
            locale: toOgLocale(locale),
            url,
        },
    };
}

/**
 * Shop all products ("Explore Millnex Machines"). Unlike `/search`
 * (query-string driven, noindex), the default listing here is fetched from
 * Vendure at build time so the exported HTML carries real, crawlable product
 * cards; filters/sort/pagination then run live client-side (see
 * catalog-results.tsx).
 */
export default async function ShopPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Shop'});
    const tListing = await getTranslations({locale, namespace: 'Listing'});
    const currencyCode = await getActiveCurrencyCode();

    const [initialProducts, categories, collectionNames] = await Promise.all([
        query(SearchProductsQuery, {input: buildSearchInput({searchParams: {}})}, {languageCode: locale, currencyCode}),
        getShopCategories(locale),
        getCollectionNames(locale),
    ]);

    // Real product images for the band artwork (first page of results).
    const bannerTiles = initialProducts.data.search.items.flatMap((item) => {
        const card = cardFromSearchResult(item);
        return card.imageUrl ? [{src: card.imageUrl, alt: card.name}] : [];
    });
    const tabCategories = categories.map(({name, slug}) => ({name: name.trim(), slug}));

    return (
        <div>
            <ListingBanner
                breadcrumbs={[{label: t('home'), href: '/'}, {label: t('breadcrumb')}]}
                title={t('title')}
                description={{text: t('subtitle')}}
                tiles={bannerTiles}
            />
            <CategoryTabs categories={tabCategories} allLabel={t('allTab')} label={tListing('categoryTabs')} />

            <div id="products" className="site-container scroll-mt-24 pb-16 lg:pb-24">
                <SearchResults
                    initialProducts={initialProducts.data}
                    collectionNames={collectionNames}
                    categories={tabCategories}
                />
            </div>
        </div>
    );
}
