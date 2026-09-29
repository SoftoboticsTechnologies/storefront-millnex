import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {ArrowRight, Check, ImageOff} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {QuoteButton} from '@/features/enquiry/quote-dialog';
import type {ProductSpecSheet} from '@/features/products/data';
import {ProductCardPrice} from '@/features/products/product-price-client';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {SPOTLIGHT_COPY} from '@/site/content/home';
import {arrowNudge, siteButton} from '@/site/ui/button-styles';

/**
 * Full-width spotlight on one real Vendure product. Only its catalog data is
 * listed — facet values, SKU, variants, live price and stock; no feature
 * bullets are written for it, because the catalog doesn't contain any.
 */
export async function ProductSpotlight({product}: {product: ProductSpecSheet}) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});
    const tProduct = await getTranslations({locale, namespace: 'Product'});

    const facts = [
        ...product.specs.map((spec) => ({label: spec.facet, value: spec.values.join(', ')})),
        ...(product.variantNames.length > 0 ? [{label: t('compareVariants'), value: product.variantNames.join(', ')}] : []),
        ...(product.skus.length > 0 ? [{label: t('compareSku'), value: product.skus.join(' / ')}] : []),
    ];

    return (
        <section aria-labelledby="spotlight-title" className="relative isolate overflow-hidden bg-tint-blue py-20 text-foreground sm:py-24 lg:py-28">
            <div className="site-container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div data-reveal="image" className="frame-ticks relative aspect-square overflow-hidden rounded-2xl bg-stage">
                    {product.imageUrl ? (
                        <Image
                            src={`${product.imageUrl}?preset=large`}
                            alt={product.name}
                            fill
                            sizes="(max-width: 1024px) 90vw, 600px"
                            className="object-contain p-8 mix-blend-multiply sm:p-12"
                        />
                    ) : (
                        <ImageOff aria-hidden="true" className="absolute inset-0 m-auto size-8 text-muted-foreground" />
                    )}
                </div>

                <div>
                    <h2 id="spotlight-title" data-reveal className="font-display-wide text-[2rem] font-bold leading-[1.02] sm:text-[2.5rem] lg:text-[3.25rem]">
                        {SPOTLIGHT_COPY.title}
                    </h2>
                    <p data-reveal className="mt-5 text-xl font-semibold text-foreground">{product.name}</p>
                    <div data-reveal className="mt-4 flex flex-wrap items-center gap-4">
                        {product.price && (
                            <p className="font-display-wide text-3xl font-bold">
                                <ProductCardPrice slug={product.slug} initial={product.price} />
                            </p>
                        )}
                        <span className={product.inStock ? 'text-sm font-semibold text-success' : 'text-sm font-semibold text-stock-out'}>
                            {product.inStock ? tProduct('inStock') : tProduct('outOfStock')}
                        </span>
                    </div>

                    {facts.length > 0 ? (
                        <dl data-reveal className="mt-8 divide-y divide-border border-y border-border">
                            {facts.map((fact) => (
                                <div key={fact.label} className="flex gap-4 py-3.5">
                                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" />
                                    <dt className="w-32 shrink-0 text-sm text-muted-foreground sm:w-40">{fact.label}</dt>
                                    <dd className="min-w-0 text-sm font-semibold break-words">{fact.value}</dd>
                                </div>
                            ))}
                        </dl>
                    ) : (
                        <p data-reveal className="mt-8 text-sm text-muted-foreground">{tProduct('noDescription')}</p>
                    )}

                    <div data-reveal className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <NavigationLink href={`/product/${product.slug}`} className={siteButton({variant: 'secondary', size: 'lg'})}>
                            {t('exploreProduct')}
                            <ArrowRight aria-hidden="true" className={arrowNudge} />
                        </NavigationLink>
                        <QuoteButton product={product.slug} className={siteButton({variant: 'outline', size: 'lg'})} />
                    </div>
                </div>
            </div>
        </section>
    );
}
