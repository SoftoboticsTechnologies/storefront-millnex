import type {Metadata} from "next";
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from "@/platform/i18n/server";
import {toOgLocale} from '@/platform/i18n/locale-utils';
import {routing} from '@/platform/i18n/routing';
import {buildCanonicalUrl} from "@/config/metadata";
import {getCatalogListing, getNewestProducts} from '@/features/products/data';
import {ProductRail} from '@/features/products/featured-products';
import {getCollectionNames, getShopCategories, getTopCollections} from '@/features/collections/data';
import {ShopHero} from "@/site/home/shop-hero";
import {FeatureStrip} from "@/site/home/feature-strip";
import {CategoryGrid} from "@/site/home/category-showcase";
import {CatalogEmpty} from "@/site/home/catalog-empty";
import {PromoBanner} from "@/site/home/promo-banner";
import {WhyMillnex} from "@/site/home/why-millnex";
import {AboutSection} from "@/site/home/about-section";
import {ApplicationsSection} from "@/site/home/applications-section";
import {StorySection} from "@/site/home/story-section";
import {CtaSection} from "@/site/home/cta-section";
import {JsonLd} from "@/site/seo/json-ld";
import {organizationSchema} from "@/site/seo/schemas";

const RAIL_SIZE = 8;

/**
 * Merchandising collections, matched by slug. Vendure has no "featured" or
 * "best seller" flag, so these rails only appear when the store has
 * deliberately curated a collection with one of these slugs — a best-seller
 * claim is never inferred from anything else.
 */
const FEATURED_SLUGS = ['featured', 'featured-products'];
const BEST_SELLER_SLUGS = ['best-sellers', 'bestsellers', 'bestseller'];

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    return {
        title: {
            absolute: t('metaTitle'),
        },
        description: t('metaDescription'),
        alternates: {
            canonical: buildCanonicalUrl(`/${locale}/`),
            languages: Object.fromEntries(routing.locales.map((l) => [l, buildCanonicalUrl(`/${l}/`)])),
        },
        openGraph: {
            title: t('metaTitle'),
            description: t('metaDescription'),
            type: "website",
            locale: toOgLocale(locale),
            url: buildCanonicalUrl(`/${locale}/`),
        },
    };
}

export default async function Home() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    const [allCollections, categories, collectionNames, catalog, newest] = await Promise.all([
        getTopCollections(locale),
        getShopCategories(locale),
        getCollectionNames(locale),
        getCatalogListing(locale, {take: RAIL_SIZE}),
        getNewestProducts(locale, RAIL_SIZE),
    ]);

    const findCollection = (slugs: string[]) => allCollections.find((collection) => slugs.includes(collection.slug));
    const featuredCollection = findCollection(FEATURED_SLUGS);
    const bestSellerCollection = findCollection(BEST_SELLER_SLUGS);

    const [featured, bestSellers] = await Promise.all([
        featuredCollection
            ? getCatalogListing(locale, {take: RAIL_SIZE, collectionSlug: featuredCollection.slug})
            : Promise.resolve(catalog),
        bestSellerCollection
            ? getCatalogListing(locale, {take: RAIL_SIZE, collectionSlug: bestSellerCollection.slug})
            : Promise.resolve(null),
    ]);

    const hasProducts = catalog.totalItems > 0;
    const shopAll = {href: '/shop', label: t('viewAllProducts')};

    return (
        <>
            <JsonLd data={organizationSchema(locale)} />
            <ShopHero hasCategories={categories.length > 0} />
            <FeatureStrip />
            <CategoryGrid categories={categories} />
            {hasProducts && (
                <ProductRail
                    id="new-arrivals"
                    eyebrow={t('newArrivalsEyebrow')}
                    title={t('newArrivals')}
                    products={newest}
                    collectionNames={collectionNames}
                    viewAll={shopAll}
                    className="bg-surface/60 py-12 sm:py-16"
                    preloadFirstProduct
                />
            )}
            <ApplicationsSection />

            {hasProducts ? (
                <>
                    <ProductRail
                        id="featured"
                        eyebrow={t('featuredEyebrow')}
                        title={featuredCollection ? t('featuredProducts') : t('ourProducts')}
                        products={featured.products}
                        collectionNames={collectionNames}
                        viewAll={featuredCollection ? {href: `/collection/${featuredCollection.slug}`, label: t('viewAll')} : shopAll}
                    />
                    {bestSellerCollection && bestSellers && (
                        <ProductRail
                            id="best-sellers"
                            eyebrow={t('bestSellersEyebrow')}
                            title={t('bestSellers')}
                            products={bestSellers.products}
                            collectionNames={collectionNames}
                            viewAll={{href: `/collection/${bestSellerCollection.slug}`, label: t('viewAll')}}
                        />
                    )}
                </>
            ) : (
                <CatalogEmpty />
            )}

            {/* Account promo → brand/trust → shopping CTA. Use cases sit above
                the products; company story deliberately comes after them. */}
            <StorySection />
            <AboutSection />
            <PromoBanner />
            <WhyMillnex />
            <CtaSection />
        </>
    );
}
