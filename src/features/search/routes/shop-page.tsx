import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/platform/i18n/navigation';
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
import {ListingBanner} from '@/components/listing-banner';
import {cardFromSearchResult} from '@/features/products/product-card-data';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

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
 * Shop all products. Unlike `/search` (query-string driven, noindex), the
 * default listing here is fetched from Vendure at build time so the exported
 * HTML carries real, crawlable product cards; filters/sort/pagination then
 * run live client-side (see catalog-results.tsx).
 */
export default async function ShopPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Shop'});
    const currencyCode = await getActiveCurrencyCode();

    const [initialProducts, categories, collectionNames] = await Promise.all([
        query(SearchProductsQuery, {input: buildSearchInput({searchParams: {}})}, {languageCode: locale, currencyCode}),
        getShopCategories(locale),
        getCollectionNames(locale),
    ]);

    // Real product images for the banner artwork (first page of results).
    const bannerTiles = initialProducts.data.search.items.flatMap((item) => {
        const card = cardFromSearchResult(item);
        return card.imageUrl ? [{src: card.imageUrl, alt: card.name}] : [];
    });

    return (
        <div className="pb-16 pt-24 sm:pt-28">
            <div className="site-container">
                <Breadcrumb className="mb-4">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink render={<Link href="/" />}>{t('home')}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{t('title')}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <ListingBanner
                eyebrow={t('eyebrow')}
                title={t('title')}
                description={{text: t('subtitle')}}
                ctaLabel={t('browseProducts')}
                tiles={bannerTiles}
            />

            <div className="site-container">
                {categories.length > 0 && (
                    <nav aria-label={t('categories')} className="-mx-4 mb-8 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
                        <ul className="flex w-max gap-2">
                            <li>
                                <span className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-semibold text-background">
                                    {t('allProducts')}
                                </span>
                            </li>
                            {categories.map((category) => (
                                <li key={category.id}>
                                    <Link
                                        href={`/collection/${category.slug}`}
                                        className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-sm font-semibold transition-colors hover:border-foreground/30 hover:bg-muted"
                                    >
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}

                <div id="products" className="scroll-mt-28">
                    <SearchResults
                        initialProducts={initialProducts.data}
                        collectionNames={collectionNames}
                        categories={categories.map(({name, slug}) => ({name: name.trim(), slug}))}
                    />
                </div>
            </div>
        </div>
    );
}
