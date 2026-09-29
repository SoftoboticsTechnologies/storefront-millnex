import type {Metadata} from "next";
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from "@/platform/i18n/server";
import {toOgLocale} from '@/platform/i18n/locale-utils';
import {routing} from '@/platform/i18n/routing';
import {buildCanonicalUrl} from "@/config/metadata";
import {getCatalogListing, getProductSpecSheets} from '@/features/products/data';
import {ProductRail} from '@/features/products/featured-products';
import {getCollectionNames, getShopCategories, getTopCollections} from '@/features/collections/data';
import {Hero} from "@/site/home/hero";
import {TrustStrip} from "@/site/home/trust-strip";
import {CategoryShowcase, type ShowcaseProduct} from "@/site/home/category-showcase";
import {ShopByCategory, type ShopByCategoryEntry} from "@/site/home/shop-by-category";
import {CatalogEmpty} from "@/site/home/catalog-empty";
import {MachineFinder} from "@/site/home/machine-finder";
import {ProductSpotlight} from "@/site/home/product-spotlight";
import {WhyMillnex} from "@/site/home/why-millnex";
import {ManufacturingSection} from "@/site/home/manufacturing-section";
import {SplitSection} from "@/site/home/split-section";
import {getComparisonGroups} from "@/site/home/comparison-data";
import type {CatalogCategory} from "@/site/home/catalog-links";
import {COMPARE_COPY, FEATURED_COPY, FINDER_COPY} from "@/site/content/home";
import {NavigationLink} from "@/site/navigation/navigation-link";
import {MachineComparison} from "@/site/ui/machine-comparison";
import {MachineFeatures} from "@/site/ui/machine-features";
import {DISPLAY_MACHINE_PHOTO} from "@/site/content/media";
import {SectionHeading} from "@/site/ui/section-heading";
import {siteButton} from "@/site/ui/button-styles";
import {JsonLd} from "@/site/seo/json-ld";
import {organizationSchema} from "@/site/seo/schemas";

const FEATURED_SIZE = 8;
/** Products previewed per category in the "Machines Built for Every Need" showcase. */
const CATEGORY_PREVIEW_SIZE = 4;

/**
 * Merchandising collection, matched by slug. Vendure has no "featured" flag,
 * so the Featured Machines grid uses a curated collection only when the
 * store has one with this slug; otherwise it shows the catalog.
 */
const FEATURED_SLUGS = ['featured', 'featured-products'];

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

/**
 * Homepage. Each section answers one question — What does Millnex sell
 * (hero) → what can I buy (featured) → which type do I need (categories) →
 * which one is right (finder, compare, spotlight) → why trust them (why,
 * manufacturing) → home or business (split); the footer's CTA band closes with
 * "what next". Every product, price, stock state, category and count is
 * read from Vendure at build time; nothing is hardcoded.
 */
export default async function Home() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    const [allCollections, shopCategories, collectionNames, catalog, comparisonGroups] = await Promise.all([
        getTopCollections(locale),
        getShopCategories(locale),
        getCollectionNames(locale),
        getCatalogListing(locale, {take: FEATURED_SIZE}),
        getComparisonGroups(locale),
    ]);

    const featuredCollection = allCollections.find((collection) => FEATURED_SLUGS.includes(collection.slug));
    const [featured, categoryListings] = await Promise.all([
        featuredCollection ? getCatalogListing(locale, {take: FEATURED_SIZE, collectionSlug: featuredCollection.slug}) : Promise.resolve(catalog),
        Promise.all(shopCategories.map((category) => getCatalogListing(locale, {take: CATEGORY_PREVIEW_SIZE, collectionSlug: category.slug}))),
    ]);
    const categories: CatalogCategory[] = shopCategories.map((category, index) => ({
        name: category.name.trim(),
        slug: category.slug,
        productCount: categoryListings[index].totalItems,
    }));
    const shopByCategory: ShopByCategoryEntry[] = shopCategories.map((category, index) => ({
        name: category.name.trim(),
        slug: category.slug,
        productCount: categoryListings[index].totalItems,
    }));

    const productsByCategory: Record<string, ShowcaseProduct[]> = Object.fromEntries(shopCategories.map((category, index) => [
        category.slug,
        categoryListings[index].products.map(({name, slug, imageUrl, inStock}) => ({name: name.trim(), slug, imageUrl, inStock})),
    ]));

    // Spotlight: the product with the richest catalog data (most facet values).
    const candidates = comparisonGroups.flatMap((group) => group.products);
    const spotlight = [...(candidates.length > 0 ? candidates : await getProductSpecSheets(locale, catalog.products.slice(0, 1).map((product) => product.slug)))]
        .sort((a, b) => b.specs.reduce((sum, spec) => sum + spec.values.length, 0) - a.specs.reduce((sum, spec) => sum + spec.values.length, 0))[0];

    const hasProducts = catalog.totalItems > 0;

    return (
        <>
            <JsonLd data={organizationSchema(locale)} />
            <Hero categories={categories} facets={catalog.facets} />
            <TrustStrip />
            <ShopByCategory categories={shopByCategory} />
            {hasProducts && (
                <ProductRail
                    id="featured"
                    title={FEATURED_COPY.title}
                    description={FEATURED_COPY.body}
                    products={featured.products}
                    collectionNames={collectionNames}
                    viewAll={featuredCollection ? {href: `/collection/${featuredCollection.slug}`, label: t('viewAll')} : {href: '/shop', label: t('viewAllMachines')}}
                    className="border-y border-border bg-surface py-20 sm:py-24 lg:py-28"
                    preloadFirstProduct
                />
            )}
            <MachineFeatures className="bg-background" image={DISPLAY_MACHINE_PHOTO} />

            {hasProducts ? (
                <>
                    <CategoryShowcase categories={categories} facets={catalog.facets} productsByCategory={productsByCategory} />

                    {spotlight && <ProductSpotlight product={spotlight} />}

                    <section id="find-your-machine" className="scroll-mt-28 bg-background py-20 sm:py-24 lg:py-28">
                        <div className="site-container">
                            <SectionHeading title={FINDER_COPY.title} body={FINDER_COPY.body} />
                            <div data-reveal className="mt-12">
                                <MachineFinder />
                            </div>
                        </div>
                    </section>

                    {comparisonGroups.length > 0 && (
                        <section id="compare" className="scroll-mt-28 border-y border-border bg-surface py-20 sm:py-24 lg:py-28">
                            <div className="site-container">
                                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                                    <SectionHeading title={COMPARE_COPY.title} body={COMPARE_COPY.body} />
                                    <NavigationLink href="/compare" className={siteButton({variant: 'secondary', size: 'md'})} data-reveal>
                                        {t('compareMachines')}
                                    </NavigationLink>
                                </div>
                                <div data-reveal className="mt-12">
                                    <MachineComparison groups={comparisonGroups} />
                                </div>
                            </div>
                        </section>
                    )}

                </>
            ) : (
                <>
                    <CatalogEmpty />
                    <CategoryShowcase categories={categories} facets={catalog.facets} productsByCategory={productsByCategory} />
                </>
            )}

            <WhyMillnex />
            <ManufacturingSection />

            <SplitSection categories={categories} facets={catalog.facets} />
        </>
    );
}
