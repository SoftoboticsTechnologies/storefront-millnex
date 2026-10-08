import type { Metadata } from 'next';
import { Link } from '@/platform/i18n/navigation';
import { query } from '@/platform/vendure/api';
import {GetProductDetailQuery} from '@/features/products/graphql';
import { ProductImageCarousel } from '@/features/products/components/product-image-carousel';
import { ProductInfo } from '@/features/products/components/product-info';
import {getDisplayOptionGroups} from '@/features/products/product-options';
import { RelatedProducts } from '@/features/products/components/related-products';
import {SpecialOfferPrice} from '@/features/products/components/special-offer-price';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { notFound } from 'next/navigation';
import {ArrowRight, CalendarCheck, FileText, HelpCircle, MessageSquareText, PackageSearch, ShieldCheck, Truck} from 'lucide-react';
import {CUSTOMER_OFFERS, isFocusCollection} from '@/config/catalog-focus';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {QuoteButton} from '@/features/enquiry/quote-dialog';
import {cn} from '@/lib/utils';
import {stripHtml} from '@/features/products/product-card-data';
import { routing } from '@/platform/i18n/routing';
import {
    SITE_NAME,
    truncateDescription,
    buildCanonicalUrl,
    buildOgImages,
} from '@/config/metadata';
import {getTranslations} from 'next-intl/server';
import {toOgLocale} from '@/platform/i18n/locale-utils';
import {getRouteLocale} from '@/platform/i18n/server';
import {getPopularProductSlugs, getProductVariantParams} from '@/features/products/data';
import {getActiveCurrencyCode} from '@/features/currency/currency-server';
import {EMPTY_STATIC_PARAM, withEmptyCatalogFallback} from '@/platform/next/static-export';

// Prerenders every product slug in the catalog at build time — static export
// has no on-demand fallback for a slug that wasn't prerendered. Content
// (name/description/images) is baked in for SEO, and so is a real
// build-time price/stock (in the channel's default currency) so crawlers and
// first paint see an actual price. It's superseded client-side once a live
// fetch resolves (see features/products/product-price-client.tsx), in case
// the viewer's active currency differs from the build-time default.
//
// The `variant` optional catch-all also prerenders one dedicated static page
// per non-default variant (`/product/[slug]/[sku]`), each with that
// variant's own real price/stock baked in. Without this, selecting a variant
// only ever updates the DOM client-side — the change is real for a viewer,
// but a fresh page load (or "View Page Source") of that same URL never
// reflects it, since query-string-driven client state was never part of the
// static HTML that was generated. Giving each variant its own prerendered
// URL means selecting one is a real navigation to an already-fully-rendered
// page, so its content is genuinely present on load — see docs/decisions.md.
export async function generateStaticParams({
    params,
}: {
    params: {locale: string};
}) {
    const [slugs, variantParams] = await Promise.all([
        getPopularProductSlugs(params.locale),
        getProductVariantParams(params.locale),
    ]);

    return withEmptyCatalogFallback<{slug: string; variant: string[]}>([
        ...slugs.map((slug) => ({slug, variant: []})),
        ...variantParams.map(({slug, variant}) => ({slug, variant: [variant]})),
    ], {slug: EMPTY_STATIC_PARAM, variant: []});
}

async function getProductData(slug: string) {
    const locale = await getRouteLocale();

    return await query(GetProductDetailQuery, {slug}, {languageCode: locale});
}

export async function generateMetadata({
    params,
}: PageProps<'/[locale]/product/[slug]/[[...variant]]'>): Promise<Metadata> {
    const { slug } = await params;
    const locale = await getRouteLocale();
    const result = await getProductData(slug);
    const product = result.data.product;

    const t = await getTranslations({locale, namespace: 'Product'});

    if (!product) {
        return {
            title: t('notFound'),
        };
    }

    const description = truncateDescription(product.description);
    const fallbackDescription = t('shopProductAt', {name: product.name, siteName: SITE_NAME});
    const ogImage = product.assets?.[0]?.preview;
    const ogLocale = toOgLocale(locale);
    // Variant sub-pages (/product/[slug]/[sku]) share the same name/description
    // as the base product — only price/stock differ — so canonical always
    // points at the bare product URL to avoid diluting ranking signals across
    // near-duplicate pages, per-variant content still being genuinely
    // crawlable is what matters for the "price missing from view-source" fix.
    const productPath = `/product/${product.slug}`;

    return {
        title: product.name,
        description: description || fallbackDescription,
        alternates: {
            canonical: buildCanonicalUrl(`/${locale}${productPath}`),
            languages: Object.fromEntries(
                routing.locales.map((l) => [l, buildCanonicalUrl(`/${l}${productPath}`)])
            ),
        },
        openGraph: {
            title: product.name,
            description: description || fallbackDescription,
            type: 'website',
            locale: ogLocale,
            url: buildCanonicalUrl(`/${locale}${productPath}`),
            images: buildOgImages(ogImage, product.name),
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: description || fallbackDescription,
            images: ogImage ? [ogImage] : undefined,
        },
    };
}

export default async function ProductDetailPage({
    params,
}: PageProps<'/[locale]/product/[slug]/[[...variant]]'>) {
    const { slug, variant } = await params;
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Product'});

    const result = await getProductData(slug);
    const buildCurrencyCode = await getActiveCurrencyCode();

    const product = result.data.product;

    if (!product) {
        notFound();
    }

    // The optional `[[...variant]]` segment names a variant by SKU
    // (generateStaticParams above prerenders one such page per non-default
    // variant). An unrecognized SKU 404s rather than silently falling back to
    // the default variant, since that URL was never actually prerendered.
    const requestedSku = variant?.[0];
    const initialVariant = requestedSku
        ? product.variants.find((v) => v.sku === requestedSku)
        : product.variants[0];

    if (!initialVariant) {
        notFound();
    }

    // Get the primary collection (prefer deepest nested / most specific)
    const primaryCollection = product.collections?.find(c => c.parent?.id) ?? product.collections?.[0];

    // Hide options that belong to a shared option group but have no variant on
    // this product (Vendure 3.6 shared/global option groups).
    const productForDisplay = {...product, optionGroups: getDisplayOptionGroups(product)};

    // Vendure facet values ("Type: Flour Mill") are the only structured
    // product attributes the default schema has — grouped by facet for the
    // "Product information" table. Hidden when the product has none.
    const productInformation = Object.values(
        (product.facetValues ?? []).reduce<Record<string, {facet: string; values: string[]}>>((groups, value) => {
            const key = value.facet.id;
            (groups[key] ??= {facet: value.facet.name, values: []}).values.push(value.name.replace(/,\s*$/, ''));
            return groups;
        }, {})
    );
    const hasDescription = stripHtml(product.description).length > 0;

    const enquiryHref = `/contact?product=${encodeURIComponent(product.slug)}#enquiry`;
    const hasOffers = isFocusCollection(primaryCollection?.slug);
    // Specifications = only real Vendure data: collection, facet values,
    // SKU(s) and variant names. Nothing is typed in by hand.
    const specRows: Array<{label: string; value: string}> = [
        ...(primaryCollection ? [{label: t('categoryLabel'), value: primaryCollection.name}] : []),
        ...productInformation.map((row) => ({label: row.facet, value: row.values.join(', ')})),
        {label: t('skuLabel'), value: initialVariant.sku},
        ...(product.variants.length > 1
            ? [{label: t('variantsLabel'), value: product.variants.map((v) => v.name).join(' · ')}]
            : []),
    ];
    const tabs = [
        {value: 'overview', label: t('tabOverview')},
        {value: 'specifications', label: t('tabSpecifications')},
        {value: 'delivery', label: t('tabDelivery')},
        {value: 'questions', label: t('tabQuestions')},
    ];

    return (
        <>
            <div className="site-container pb-16 pt-24 sm:pt-28 lg:pb-24">
                {/* Breadcrumb Navigation */}
                <Breadcrumb className="mb-6 sm:mb-8">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink render={<Link href="/" />}>{t('home')}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink render={<Link href="/shop" />}>{t('shop')}</BreadcrumbLink>
                        </BreadcrumbItem>
                        {primaryCollection && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink render={<Link href={`/collection/${primaryCollection.slug}`} />}>
                                        {primaryCollection.name}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </>
                        )}
                        <BreadcrumbSeparator />
                        <BreadcrumbItem className="min-w-0">
                            <BreadcrumbPage className="line-clamp-1">{product.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-14 xl:gap-20">
                    {/* Left Column: Image Gallery (sticky from lg only) */}
                    <div className="min-w-0 sm:mx-auto sm:w-full sm:max-w-lg lg:sticky lg:top-28 lg:mx-0 lg:max-w-none lg:self-start">
                        <ProductImageCarousel images={product.assets} name={product.name} />
                    </div>

                    {/* Right Column: Product Info */}
                    <div className="min-w-0">
                        <ProductInfo
                            product={productForDisplay}
                            buildCurrencyCode={buildCurrencyCode}
                            initialVariantId={initialVariant.id}
                            category={primaryCollection ? {name: primaryCollection.name, slug: primaryCollection.slug} : undefined}
                        />
                    </div>
                </div>
            </div>

            {/* Product information tabs. Every panel stays mounted (hidden
                when inactive) so the full description/specs/support copy is
                in the static HTML for crawlers, not only the first tab. There
                are no Applications/Features tabs: Vendure holds no such data. */}
            <section aria-labelledby="product-details" className="border-t border-border bg-background py-16 sm:py-20 lg:py-24">
                <div className="site-container">
                    <h2 id="product-details" className="sr-only">{t('detailsEyebrow')}</h2>

                    <Tabs defaultValue="overview" className="gap-0">
                        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
                            <TabsList variant="line" className="h-auto w-full min-w-max justify-start gap-0 rounded-none border-b border-border p-0 group-data-horizontal/tabs:h-auto">
                                {tabs.map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="h-12 flex-none gap-2.5 rounded-none px-4 text-sm font-semibold text-muted-foreground after:bg-brand group-data-horizontal/tabs:after:-bottom-px data-active:text-foreground sm:h-14 sm:px-6 sm:text-[15px]"
                                    >
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {/* Overview */}
                        <TabsContent value="overview" keepMounted className={tabPanel}>
                            {hasDescription ? (
                                <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                                    <div
                                        className="max-w-3xl text-[15px] leading-relaxed text-muted-foreground sm:text-base lg:col-span-8 [&_a]:text-brand [&_a]:underline [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground [&_li]:mb-1.5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_strong]:text-foreground [&_table]:w-full [&_td]:border-b [&_td]:border-border [&_td]:py-2 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&>*:first-child]:mt-0"
                                        dangerouslySetInnerHTML={{__html: product.description}}
                                    />
                                    <SpecSheetCard slug={product.slug} className="lg:col-span-4 lg:self-start" t={{title: t('specSheetTitle'), body: t('specSheetBody'), cta: t('requestSpecSheet')}} />
                                </div>
                            ) : (
                                <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-10">
                                    <span className="flex size-12 items-center justify-center rounded-xl bg-card text-brand shadow-sm">
                                        <FileText aria-hidden="true" className="size-6" />
                                    </span>
                                    <h3 className="mt-5 font-display-wide text-2xl font-bold sm:text-3xl">{t('specsContactTitle')}</h3>
                                    <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">{t('noDescription')}</p>
                                    <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
                                        <QuoteButton product={product.slug} className={brandButton} />
                                        <Link href={enquiryHref} className={outlineButton}>
                                            <MessageSquareText aria-hidden="true" />
                                            {t('productEnquiry')}
                                        </Link>
                                    </div>
                                </div>
                            )}
                            {/* Special offer summary at the end of the product content — only when the variant has a Vendure MRP. */}
                            <SpecialOfferPrice
                                slug={product.slug}
                                variantId={initialVariant.id}
                                price={initialVariant.priceWithTax}
                                currencyCode={buildCurrencyCode}
                                className="mt-10 max-w-3xl"
                            />
                        </TabsContent>

                        {/* Specifications */}
                        <TabsContent value="specifications" keepMounted className={tabPanel}>
                            <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                                <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card lg:col-span-8">
                                    {specRows.map((row) => (
                                        <div key={row.label} className="grid gap-1 px-4 py-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-6 sm:px-6">
                                            <dt className="spec-label pt-0.5 text-steel">{row.label}</dt>
                                            <dd className="break-words text-sm font-medium text-foreground sm:text-[15px]">{row.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                                <SpecSheetCard slug={product.slug} className="lg:col-span-4 lg:self-start" t={{title: t('specSheetTitle'), body: t('specSheetBody'), cta: t('requestSpecSheet')}} />
                            </div>
                        </TabsContent>

                        {/* Delivery & Support — only what the store actually does:
                            Vendure prices shipping per address at checkout,
                            payment runs through the secure checkout, orders are
                            tracked in the account, and enquiries reach the team. */}
                        <TabsContent value="delivery" keepMounted className={tabPanel}>
                            <ul className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 sm:[&>li:last-child:nth-child(odd)]:col-span-2">
                                {[
                                    // Atta Chakki products: free shipping radius + free home demo (config/catalog-focus.ts).
                                    {icon: Truck, title: t('shippingTitle'), body: hasOffers ? t('shippingFreeBody', {km: CUSTOMER_OFFERS.freeShippingKm}) : t('shippingBody')},
                                    ...(hasOffers ? [{icon: CalendarCheck, title: t('offerDemoTitle'), body: t('offerDemoBody')}] : []),
                                    {icon: ShieldCheck, title: t('paymentTitle'), body: t('paymentBody')},
                                    {icon: PackageSearch, title: t('ordersTitle'), body: t('ordersBody'), href: '/account/orders', cta: t('viewOrders')},
                                    {icon: MessageSquareText, title: t('helpTitle'), body: t('helpBody'), href: enquiryHref, cta: t('productEnquiry')},
                                ].map(({icon: Icon, title, body, href, cta}) => (
                                    <li key={title} className="flex gap-4 bg-card p-5 sm:p-7">
                                        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-steel-soft text-foreground">
                                            <Icon aria-hidden="true" className="size-5" />
                                        </span>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-bold">{title}</h3>
                                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                                            {href && cta && (
                                                <Link href={href} className="group/btn mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand underline-offset-4 hover:underline">
                                                    {cta}
                                                    <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                                                </Link>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </TabsContent>

                        {/* Questions — a hand-off, never invented Q&A. */}
                        <TabsContent value="questions" keepMounted className={tabPanel}>
                            <div className="relative isolate overflow-hidden rounded-2xl bg-tint-sheen p-6 text-foreground sm:p-10 lg:p-12">
                                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                                    <div className="max-w-2xl">
                                        <HelpCircle aria-hidden="true" className="size-8 text-brand" />
                                        <h3 className="mt-5 font-display-wide text-2xl font-bold text-foreground sm:text-3xl">{t('questionsTitle')}</h3>
                                        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{t('questionsBody')}</p>
                                    </div>
                                    <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
                                        <Link href={enquiryHref} className={cn(brandButton, 'group/btn')}>
                                            {t('productEnquiry')}
                                            <ArrowRight aria-hidden="true" className="transition-transform group-hover/btn:translate-x-0.5" />
                                        </Link>
                                        <Link href="/faq" className={outlineLightButton}>
                                            <HelpCircle aria-hidden="true" />
                                            {t('readFaq')}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            {primaryCollection && (
                <RelatedProducts
                    collectionSlug={primaryCollection.slug}
                    currentProductId={product.id}
                />
            )}
        </>
    );
}

/** "Request full specification sheet" — opens the quote modal with this product pre-selected. */
function SpecSheetCard({slug, className, t}: {slug: string; className?: string; t: {title: string; body: string; cta: string}}) {
    return (
        <aside className={cn('rounded-xl border border-border bg-surface p-6', className)}>
            <FileText aria-hidden="true" className="size-6 text-brand" />
            <h3 className="mt-4 text-lg font-bold">{t.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
            <QuoteButton product={slug} intent="quote" className={cn(inkButton, 'mt-5 w-full whitespace-normal text-center')}>
                <FileText aria-hidden="true" />
                {t.cta}
            </QuoteButton>
        </aside>
    );
}

const tabPanel = 'pt-8 outline-none sm:pt-10';
// Local copies of the site button shapes (features can't import `site/`).
const buttonBase = 'inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-out outline-none focus-visible:ring-3 focus-visible:ring-brand/40 active:translate-y-px [&_svg]:size-4 [&_svg]:shrink-0';
const brandButton = cn(buttonBase, 'bg-brand text-brand-foreground shadow-[0_1px_0_0_oklch(1_0_0/0.18)_inset,0_10px_26px_-14px_var(--brand)] hover:-translate-y-0.5 hover:bg-[oklch(0.52_0.17_37)]');
const inkButton = cn(buttonBase, 'bg-logo-blue text-white hover:-translate-y-0.5 hover:bg-logo-blue-deep');
const outlineButton = cn(buttonBase, 'border border-foreground/15 bg-card text-foreground hover:-translate-y-0.5 hover:border-foreground/35 hover:shadow-[0_10px_24px_-18px_rgb(0_0_0/0.4)]');
const outlineLightButton = cn(buttonBase, 'border border-foreground/15 bg-card text-foreground hover:-translate-y-0.5 hover:border-foreground/35');
