import type {Metadata} from "next";
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from "@/platform/i18n/server";
import {toOgLocale} from '@/platform/i18n/locale-utils';
import {routing} from '@/platform/i18n/routing';
import {buildCanonicalUrl} from "@/config/metadata";
import {CUSTOMER_OFFERS} from "@/config/catalog-focus";
import {getCatalogListing} from '@/features/products/data';
import {ProductRail} from '@/features/products/featured-products';
import {getCollectionNames, getShopCategories, getTopCollections} from '@/features/collections/data';
import {Hero} from "@/site/home/hero";
import {TrustStrip} from "@/site/home/trust-strip";
import {CategoryShowcase, type ShowcaseProduct} from "@/site/home/category-showcase";
// Hidden 2026-10-08 (Atta Chakki focus) — imports for sections no longer rendered:
// import {ShopByCategory, type ShopByCategoryEntry} from "@/site/home/shop-by-category";
// import {MachineFinder} from "@/site/home/machine-finder";
// import {SplitSection} from "@/site/home/split-section";
// import {DISPLAY_MACHINE_PHOTO} from "@/site/content/media";
// import {FINDER_COPY, FOOD_PREP_COPY} from "@/site/content/home";
// import {SectionHeading} from "@/site/ui/section-heading";
import {HeroProduct} from "@/site/home/hero-product";
import {DemoSection} from "@/site/home/demo-section";
import {CatalogEmpty} from "@/site/home/catalog-empty";
import {WhyMillnex} from "@/site/home/why-millnex";
import {ManufacturingSection} from "@/site/home/manufacturing-section";
import {getComparisonGroups} from "@/site/home/comparison-data";
import {ModelPicker} from "@/site/home/model-picker";
import type {CatalogCategory} from "@/site/home/catalog-links";
import {FEATURED_COPY, FRESH_FLOUR_COPY, HERO_PRODUCT_COPY} from "@/site/content/home";
import {MachineFeatures} from "@/site/ui/machine-features";
import {DESIGN_PHOTOS} from "@/site/content/media";
import {LivePhotos} from "@/site/ui/live-photos";
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
        description: t('metaDescription', {km: CUSTOMER_OFFERS.freeShippingKm}),
        alternates: {
            canonical: buildCanonicalUrl(`/${locale}/`),
            languages: Object.fromEntries(routing.locales.map((l) => [l, buildCanonicalUrl(`/${l}/`)])),
        },
        openGraph: {
            title: t('metaTitle'),
            description: t('metaDescription', {km: CUSTOMER_OFFERS.freeShippingKm}),
            type: "website",
            locale: toOgLocale(locale),
            url: buildCanonicalUrl(`/${locale}/`),
        },
    };
}

/**
 * Homepage — Atta Chakki focus (client direction 2026-10-08). The visitor
 * reads: Millnex → Atta Chakki (hero) → free home demo + free shipping
 * (trust strip) → Featured Products → the flagship card with price → see it
 * at home before you buy (demo section) → features, fresh flour, real
 * photos, compare → why Millnex, manufacturing; the footer's CTA band closes.
 * Listings are scoped to the Atta Chakki collection (config/catalog-focus.ts).
 * Every product, price, stock state, category and count is read from Vendure
 * at build time; nothing is hardcoded.
 *
 * Hidden 2026-10-08 (commented out below, kept for reactivation): Shop by
 * category, Food Processing Made Effortless, Machines Built for Every Need,
 * the multi-machine finder and the home/business split.
 */
export default async function Home() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    const [allCollections, shopCategories, collectionNames, catalog, comparisonGroups, fullCatalog] = await Promise.all([
        getTopCollections(locale),
        getShopCategories(locale),
        getCollectionNames(locale),
        getCatalogListing(locale, {take: FEATURED_SIZE}),
        getComparisonGroups(locale),
        getCatalogListing(locale, {take: 100}),
    ]);
    // Flagship highlight: Millnex's hero product, matched by name (HERO_PRODUCT_COPY.match).
    const heroProduct = fullCatalog.products.find((product) => HERO_PRODUCT_COPY.match.test(product.name));
    // Hidden 2026-10-08 — "Food Processing Made Effortless": real products matched by name (FOOD_PREP_COPY.matches), in order.
    // const foodPrepProducts = FOOD_PREP_COPY.matches
    //     .map((match) => fullCatalog.products.find((product) => match.test(product.name)))
    //     .filter((product): product is NonNullable<typeof product> => product !== undefined);

    const featuredCollection = allCollections.find((collection) => FEATURED_SLUGS.includes(collection.slug));
    const [featured, categoryListings] = await Promise.all([
        featuredCollection ? getCatalogListing(locale, {take: FEATURED_SIZE, collectionSlug: featuredCollection.slug}) : Promise.resolve(catalog),
        Promise.all(shopCategories.map((category) => getCatalogListing(locale, {take: CATEGORY_PREVIEW_SIZE, collectionSlug: category.slug}))),
    ]);
    // Featured: only the 1.5 HP, 2 HP and 3 HP models, in that order (FEATURED_COPY.matches,
    // matched by name). Falls back to the previous list if none match.
    const hpProducts = FEATURED_COPY.matches.flatMap((match) => fullCatalog.products.filter((product) => match.test(product.name)));
    // Previously: the flagship led the first FEATURED_SIZE catalog products.
    const featuredProducts = hpProducts.length > 0
        ? hpProducts
        : heroProduct
            ? [heroProduct, ...featured.products.filter((product) => product.productId !== heroProduct.productId)].slice(0, FEATURED_SIZE)
            : featured.products;
    const categories: CatalogCategory[] = shopCategories.map((category, index) => ({
        name: category.name.trim(),
        slug: category.slug,
        productCount: categoryListings[index].totalItems,
    }));
    // Hidden 2026-10-08 — "Shop by category" data:
    // const shopByCategory: ShopByCategoryEntry[] = shopCategories.map((category, index) => ({
    //     name: category.name.trim(),
    //     slug: category.slug,
    //     productCount: categoryListings[index].totalItems,
    // }));

    const productsByCategory: Record<string, ShowcaseProduct[]> = Object.fromEntries(shopCategories.map((category, index) => [
        category.slug,
        categoryListings[index].products.map(({name, slug, imageUrl, inStock}) => ({name: name.trim(), slug, imageUrl, inStock})),
    ]));

    const hasProducts = catalog.totalItems > 0;

    return (
        <>
            <JsonLd data={organizationSchema(locale)} />
            <Hero categories={categories} facets={catalog.facets} />
            <TrustStrip />
            {/* Shop by Category section temporarily disabled.
                Client currently wants the homepage focused exclusively on Atta Chakki.
            <ShopByCategory categories={shopByCategory} /> */}
            {/* Featured Products sits above the flagship card (client request 2026-10-08). */}
            {hasProducts && (
                <ProductRail
                    id="featured"
                    title={FEATURED_COPY.title}
                    description={FEATURED_COPY.body}
                    products={featuredProducts}
                    collectionNames={collectionNames}
                    viewAll={featuredCollection ? {href: `/collection/${featuredCollection.slug}`, label: t('viewAll')} : {href: '/shop', label: t('viewAttaChakki')}}
                    className="border-t border-border bg-surface py-20 sm:py-24 lg:py-28"
                    preloadFirstProduct
                />
            )}
            <HeroProduct product={heroProduct} />
            <DemoSection />
            {/* Hidden 2026-10-08: the S.S Body 2-in-1 display photo reads as a pulverizer — image={DISPLAY_MACHINE_PHOTO} */}
            {/* 2026-10-08: the 1.5 HP floral design (was MACHINE_PHOTOS.flourMillStandard). */}
            <MachineFeatures className="bg-background" image={DESIGN_PHOTOS[1]} />

            {hasProducts ? (
                <>
                    {/* "Machines Built for Every Need" (SHOWCASE_COPY) replaced by the Atta Chakki-focused
                        "Designed for Fresh Flour at Home" — same component and design. */}
                    <CategoryShowcase
                        categories={categories}
                        facets={catalog.facets}
                        productsByCategory={productsByCategory}
                        copy={FRESH_FLOUR_COPY}
                        viewAllLabel={t('viewAttaChakki')}
                        cardCtaLabel={t('viewAttaChakki')}
                    />

                    {/* Food Processing section temporarily hidden — client currently wants an Atta Chakki-focused website.
                    <ProductRail
                        id="food-processing"
                        wide
                        title={FOOD_PREP_COPY.title}
                        description={FOOD_PREP_COPY.body}
                        products={foodPrepProducts}
                        collectionNames={collectionNames}
                        viewAll={{href: '/shop', label: t('viewAllMachines')}}
                        className="border-y border-border bg-surface py-20 sm:py-24 lg:py-28"
                    /> */}

                    <LivePhotos className="bg-background" />

                    {/* Machine finder temporarily hidden — it recommends pulverizers, gravy and fafda machines.
                    <section id="find-your-machine" className="scroll-mt-28 bg-background py-20 sm:py-24 lg:py-28">
                        <div className="site-container">
                            <SectionHeading title={FINDER_COPY.title} body={FINDER_COPY.body} />
                            <div data-reveal className="mt-12">
                                <MachineFinder />
                            </div>
                        </div>
                    </section> */}

                    <ModelPicker groups={comparisonGroups} />

                </>
            ) : (
                <>
                    <CatalogEmpty />
                    <CategoryShowcase categories={categories} facets={catalog.facets} productsByCategory={productsByCategory} copy={FRESH_FLOUR_COPY} viewAllLabel={t('viewAttaChakki')} cardCtaLabel={t('viewAttaChakki')} />
                </>
            )}

            <WhyMillnex />
            <ManufacturingSection />

            {/* Home / business split temporarily hidden — its business panel promotes commercial machinery.
            <SplitSection categories={categories} facets={catalog.facets} /> */}
        </>
    );
}
