import type {CSSProperties} from 'react';
import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {ArrowRight, ArrowUpRight, Check, ImageOff} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {cn} from '@/lib/utils';
import {QuoteButton} from '@/features/enquiry/quote-dialog';
import {ProductCardPrice} from '@/features/products/product-price-client';
import type {ComparisonGroup} from '@/site/home/comparison-data';
import {COMPARE_COPY} from '@/site/content/home';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {SectionHeading} from '@/site/ui/section-heading';
import {arrowNudge, siteButton} from '@/site/ui/button-styles';

type SpecSheet = ComparisonGroup['products'][number];

const specText = (product: SpecSheet, facet: string) =>
    product.specs.find((spec) => spec.facet === facet)?.values.join(', ') ?? '';

/**
 * Splits a group's Vendure facets into the ones every model shares (shown
 * once, above the cards) and the ones that tell models apart (shown on each
 * card). Nothing beyond the products' own facet values is used.
 */
function splitSpecs(products: SpecSheet[]) {
    const facets = [...new Set(products.flatMap((product) => product.specs.map((spec) => spec.facet)))];
    const shared: Array<{facet: string; value: string}> = [];
    const distinct: string[] = [];
    for (const facet of facets) {
        const values = products.map((product) => specText(product, facet));
        if (values.every((value) => value && value === values[0])) shared.push({facet, value: values[0]});
        else distinct.push(facet);
    }
    return {shared, distinct};
}

/**
 * "Which Atta Chakki Is Right for You?" (homepage, redesigned 2026-10-08):
 * one card per model — photo on the stage, the specs that differ between
 * models, live price, stock and CTAs — with the specs every model shares
 * listed once. Data: getComparisonGroups (Vendure, build time; price swaps
 * to live via ProductCardPrice). The full side-by-side table stays on
 * /compare (site/ui/machine-comparison.tsx). Phones: horizontal snap row.
 */
export async function ModelPicker({groups}: {groups: ComparisonGroup[]}) {
    if (groups.length === 0) return null;
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});
    const tProduct = await getTranslations({locale, namespace: 'Product'});

    return (
        <section id="compare" aria-labelledby="compare-title" className="scroll-mt-28 overflow-hidden border-y border-border bg-surface py-20 sm:py-24 lg:py-28">
            <div className="site-container">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <SectionHeading title={<span id="compare-title">{COMPARE_COPY.title}</span>} body={COMPARE_COPY.body} />
                    <NavigationLink href="/compare" className={siteButton({variant: 'outline', size: 'md'})} data-reveal>
                        {t('compareMachines')}
                        <ArrowRight aria-hidden="true" className={arrowNudge} />
                    </NavigationLink>
                </div>

                {groups.map((group) => {
                    const {shared, distinct} = splitSpecs(group.products);
                    return (
                        <div key={group.slug} className="mt-12">
                            {groups.length > 1 && <h3 className="mb-5 font-display text-xl font-bold">{group.name}</h3>}

                            {shared.length > 0 && (
                                <div data-reveal className="mb-6 flex flex-wrap items-center gap-2 text-sm">
                                    <span className="mr-1 font-semibold text-foreground">{t('compareShared')}</span>
                                    {shared.flatMap(({facet, value}) => value.split(', ').map((item) => (
                                        <span key={`${facet}-${item}`} className="inline-flex items-center gap-1.5 rounded-full border border-logo-blue/20 bg-card px-3 py-1 font-medium text-logo-blue-deep">
                                            <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
                                            {item}
                                        </span>
                                    )))}
                                </div>
                            )}

                            {/* `relative` makes the swipe row the containing block for absolutely positioned
                                descendants (the price's sr-only labels), so they're clipped by it instead of
                                stretching the page sideways on phones (blank strip on the right, fixed 2026-10-08). */}
                            <ul className="relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
                                {group.products.map((product, index) => {
                                    const href = `/product/${product.slug}`;
                                    const specs = distinct
                                        .map((facet) => ({facet, value: specText(product, facet)}))
                                        .filter((spec) => spec.value);
                                    return (
                                        <li
                                            key={product.productId}
                                            data-reveal
                                            style={{'--reveal-delay': `${(index % 3) * 80}ms`} as CSSProperties}
                                            className="group/card flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-logo-blue/30 hover:shadow-[0_28px_50px_-34px_rgb(10_40_80/0.5)] sm:w-auto"
                                        >
                                            <NavigationLink href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-[4/3] overflow-hidden bg-stage">
                                                {product.imageUrl ? (
                                                    <Image
                                                        src={`${product.imageUrl}?preset=medium`}
                                                        alt=""
                                                        fill
                                                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 82vw"
                                                        className="object-contain p-5 mix-blend-multiply transition-transform duration-500 ease-out group-hover/card:scale-[1.04]"
                                                    />
                                                ) : (
                                                    <ImageOff className="absolute inset-0 m-auto size-6 text-muted-foreground" />
                                                )}
                                                <span className="absolute left-3 top-3 rounded-md bg-card/90 px-2 py-1 font-display text-xs font-bold tabular-nums text-steel shadow-sm">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                                <span className={cn(
                                                    'absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold shadow-sm',
                                                    product.inStock ? 'text-success' : 'text-stock-out',
                                                )}>
                                                    <span aria-hidden="true" className={cn('size-1.5 rounded-full', product.inStock ? 'bg-success' : 'bg-stock-out')} />
                                                    {product.inStock ? tProduct('inStock') : tProduct('outOfStock')}
                                                </span>
                                            </NavigationLink>

                                            <div className="flex flex-1 flex-col p-5 sm:p-6">
                                                <h4 className="font-display text-lg font-bold leading-snug">
                                                    <NavigationLink href={href} className="transition-colors hover:text-brand">{product.name}</NavigationLink>
                                                </h4>

                                                {(specs.length > 0 || product.variantNames.length > 0) && (
                                                    <dl className="mt-4 grid gap-2 text-sm">
                                                        {specs.map((spec) => (
                                                            <div key={spec.facet} className="flex items-baseline justify-between gap-3 border-b border-dashed border-border pb-2">
                                                                <dt className="text-muted-foreground">{spec.facet}</dt>
                                                                <dd className="text-right font-semibold">{spec.value}</dd>
                                                            </div>
                                                        ))}
                                                        {product.variantNames.length > 0 && (
                                                            <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-border pb-2">
                                                                <dt className="text-muted-foreground">{t('compareVariants')}</dt>
                                                                <dd className="text-right font-semibold">{product.variantNames.join(', ')}</dd>
                                                            </div>
                                                        )}
                                                    </dl>
                                                )}

                                                <div className="mt-auto pt-5">
                                                    {product.price && (
                                                        <p className="font-display text-2xl font-bold tracking-tight">
                                                            <ProductCardPrice slug={product.slug} initial={product.price} />
                                                        </p>
                                                    )}
                                                    <div className="mt-4 flex flex-col gap-2.5">
                                                        {product.inStock ? (
                                                            <QuoteButton product={product.slug} hideIcon className={siteButton({variant: 'brand', size: 'md'})} />
                                                        ) : (
                                                            <QuoteButton product={product.slug} intent="quote" hideIcon className={siteButton({variant: 'secondary', size: 'md'})}>
                                                                {tProduct('askAvailability')}
                                                            </QuoteButton>
                                                        )}
                                                        <NavigationLink href={href} className={siteButton({variant: 'outline', size: 'md'})}>
                                                            {tProduct('viewDetails')}
                                                            <ArrowUpRight aria-hidden="true" />
                                                        </NavigationLink>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}

                <p className="mt-6 text-xs text-muted-foreground">{t('compareNote')}</p>
            </div>
        </section>
    );
}
