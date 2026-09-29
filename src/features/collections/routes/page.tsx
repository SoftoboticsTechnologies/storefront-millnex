import type { Metadata } from 'next';
import { query } from '@/platform/vendure/api';
import {GetCollectionProductsQuery} from '@/features/collections/graphql';
import {SearchProductsQuery} from '@/features/search/graphql';
import {ListingBanner} from '@/components/listing-banner';
import {cardFromSearchResult} from '@/features/products/product-card-data';
import {buildSearchInput} from '@/features/search/search-helpers';
import {getActiveCurrencyCode} from '@/features/currency/currency-server';
import {CollectionResults} from '@/features/collections/routes/collection-results';
import {CategoryTabs} from '@/features/search/category-tabs';
import {QuoteButton} from '@/features/enquiry/quote-dialog';
import { routing } from '@/platform/i18n/routing';
import {
    SITE_NAME,
    truncateDescription,
    buildCanonicalUrl,
    buildOgImages,
} from '@/config/metadata';
import {toOgLocale} from '@/platform/i18n/locale-utils';
import {getRouteLocale} from '@/platform/i18n/server';
import {getTranslations} from 'next-intl/server';
import {getCollectionNames, getShopCategories, getTopCollections} from '@/features/collections/data';
import {EMPTY_STATIC_PARAM, withEmptyCatalogFallback} from '@/platform/next/static-export';
import {notFound} from 'next/navigation';

// Prerenders every known collection (root + children) at build time — static
// export has no on-demand fallback for a slug that wasn't prerendered.
export async function generateStaticParams({
    params,
}: {
    params: {locale: string};
}) {
    const collections = await getTopCollections(params.locale);
    const slugs = collections.flatMap((collection) => [
        collection.slug,
        ...(collection.children?.map((child) => child.slug) ?? []),
    ]);
    return withEmptyCatalogFallback(slugs.map((slug) => ({slug})), {slug: EMPTY_STATIC_PARAM});
}

async function getCollectionMetadata(slug: string) {
    const locale = await getRouteLocale();

    return query(GetCollectionProductsQuery, {
        slug,
        input: { take: 0, collectionSlug: slug, groupByProduct: true },
    }, {languageCode: locale});
}

// Default (unfiltered, page 1) product listing for the collection, fetched
// at build time so the statically-exported HTML has real, indexable product
// content for SEO instead of only the client-fetched-after-mount grid (see
// collection-results.tsx). Superseded client-side once the live fetch
// resolves, or immediately when the URL carries filter/sort/page params this
// build-time listing doesn't reflect.
async function getDefaultCollectionProducts(slug: string) {
    const locale = await getRouteLocale();
    const currencyCode = await getActiveCurrencyCode();

    return query(SearchProductsQuery, {
        input: buildSearchInput({searchParams: {}, collectionSlug: slug}),
    }, {languageCode: locale, currencyCode});
}

export async function generateMetadata({
    params,
}: PageProps<'/[locale]/collection/[slug]'>): Promise<Metadata> {
    const { slug } = await params;
    const locale = await getRouteLocale();
    const result = await getCollectionMetadata(slug);
    const collection = result.data.collection;

    const t = await getTranslations({locale, namespace: 'Collection'});

    if (!collection) {
        return {
            title: t('collectionNotFound'),
        };
    }

    const description =
        truncateDescription(collection.description) ||
        t('browseCollectionAt', {name: collection.name, siteName: SITE_NAME});
    const ogLocale = toOgLocale(locale);
    const collectionPath = `/collection/${collection.slug}`;

    return {
        title: collection.name,
        description,
        alternates: {
            canonical: buildCanonicalUrl(`/${locale}${collectionPath}`),
            languages: Object.fromEntries(
                routing.locales.map((l) => [l, buildCanonicalUrl(`/${l}${collectionPath}`)])
            ),
        },
        openGraph: {
            title: collection.name,
            description,
            type: 'website',
            locale: ogLocale,
            url: buildCanonicalUrl(`/${locale}${collectionPath}`),
            images: buildOgImages(collection.featuredAsset?.preview, collection.name),
        },
        twitter: {
            card: 'summary_large_image',
            title: collection.name,
            description,
            images: collection.featuredAsset?.preview
                ? [collection.featuredAsset.preview]
                : undefined,
        },
    };
}

export default async function CollectionPage({params}: PageProps<'/[locale]/collection/[slug]'>) {
    const { slug } = await params;
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Collection'});

    if (slug === EMPTY_STATIC_PARAM) {
        notFound();
    }

    // Name/description/breadcrumb are baked in at build time for SEO; the
    // product listing, filters, sort, and pagination are resolved live
    // client-side (currency- and query-string-dependent) — see
    // collection-results.tsx.
    const [collectionResult, initialProducts, collectionNames, categories] = await Promise.all([
        getCollectionMetadata(slug),
        getDefaultCollectionProducts(slug),
        getCollectionNames(locale),
        getShopCategories(locale),
    ]);
    const collection = collectionResult.data.collection;
    const collectionName = collection?.name.trim() || slug;
    // Vendure descriptions are often empty rich text ("<p></p>") — only show real copy.
    const hasDescription = !!collection?.description?.replace(/<[^>]*>/g, '').trim();

    // Band artwork: the collection's own image (if any), then real product images.
    const bannerTiles = [
        ...(collection?.featuredAsset ? [{src: collection.featuredAsset.preview, alt: collectionName}] : []),
        ...initialProducts.data.search.items.flatMap((item) => {
            const card = cardFromSearchResult(item);
            return card.imageUrl ? [{src: card.imageUrl, alt: card.name}] : [];
        }),
    ];

    return (
        <div>
            <ListingBanner
                breadcrumbs={[
                    {label: t('home'), href: '/'},
                    {label: t('shop'), href: '/shop'},
                    {label: collectionName},
                ]}
                title={collectionName}
                description={
                    hasDescription && collection?.description
                        ? {html: collection.description}
                        : {text: t('fallbackDescription', {name: collectionName})}
                }
                actions={
                    <QuoteButton className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-brand-foreground shadow-[0_10px_26px_-14px_var(--brand)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-brand/90 [&_svg]:size-4" />
                }
                tiles={bannerTiles}
            />
            <CategoryTabs
                categories={categories.map(({name, slug: categorySlug}) => ({name: name.trim(), slug: categorySlug}))}
                activeSlug={slug}
                allLabel={t('allTab')}
                label={t('categoryTabs')}
            />

            <div id="products" className="site-container scroll-mt-24 pb-16 lg:pb-24">
                <CollectionResults
                    collectionSlug={slug}
                    collectionId={collection?.id}
                    initialProducts={initialProducts.data}
                    collectionNames={collectionNames}
                />
            </div>
        </div>
    );
}
