import Image from 'next/image';
import {ArrowRight, Check, ImageOff} from 'lucide-react';
import {QuoteButton} from '@/features/enquiry/quote-dialog';
import type {ProductCardData} from '@/features/products/product-card-data';
import {ProductCardPrice} from '@/features/products/product-price-client';
import {HERO_PRODUCT_COPY} from '@/site/content/home';
import {LIVE_PHOTOS} from '@/site/content/media';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {arrowNudge, siteButton} from '@/site/ui/button-styles';

/**
 * Flagship highlight for Millnex's hero product (HERO_PRODUCT_COPY, matched
 * by name in home/page.tsx): the Vendure product photo on a stage with the
 * real machine photos (media.ts#LIVE_PHOTOS) beside it, then the title, the
 * banner's feature list, the live Vendure price (with its % OFF) and CTAs.
 * Renders nothing when the product isn't in the catalog.
 */
export function HeroProduct({product}: {product: ProductCardData | undefined}) {
    if (!product) return null;
    const href = `/product/${product.slug}`;
    const photos = LIVE_PHOTOS.slice(0, 3);

    return (
        <section id="flagship" aria-labelledby="flagship-title" className="relative isolate scroll-mt-28 overflow-hidden border-y border-border bg-tint-blue py-16 sm:py-20 lg:py-24">
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-blueprint opacity-50 [mask-image:radial-gradient(ellipse_at_30%_40%,black_20%,transparent_75%)]" />
            <div className="site-container grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
                {/* Photos */}
                <div data-reveal className="grid grid-cols-4 gap-3 sm:gap-4 lg:col-span-6">
                    <NavigationLink href={href} className="group/hero relative col-span-4 block aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-stage shadow-[0_30px_60px_-40px_rgb(10_40_80/0.55)] sm:col-span-3 sm:row-span-3 sm:aspect-auto">
                        {product.imageUrl ? (
                            <Image
                                src={`${product.imageUrl}?preset=large`}
                                alt={product.name.trim()}
                                fill
                                sizes="(min-width: 1024px) 38vw, (min-width: 640px) 70vw, 100vw"
                                className="object-contain p-4 mix-blend-multiply transition-transform duration-700 ease-out group-hover/hero:scale-[1.03] sm:p-6"
                            />
                        ) : (
                            <ImageOff aria-hidden="true" className="absolute inset-0 m-auto size-8 text-muted-foreground" />
                        )}
                        <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-bold text-brand-foreground shadow-sm sm:left-4 sm:top-4">
                            {HERO_PRODUCT_COPY.badge}
                        </span>
                    </NavigationLink>
                    {photos.map((photo) => (
                        <div key={photo.src} className="relative col-span-1 aspect-[3/4] overflow-hidden rounded-xl border border-border bg-stage max-sm:hidden">
                            <Image src={photo.src} alt={photo.alt} fill sizes="12vw" className="object-cover" />
                        </div>
                    ))}
                </div>

                {/* Details */}
                <div data-reveal className="lg:col-span-6">
                    <h2 id="flagship-title" className="font-display-wide text-[2rem] font-bold leading-[1.02] sm:text-[2.5rem] lg:text-[3rem]">
                        {HERO_PRODUCT_COPY.title}
                    </h2>
                    <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{HERO_PRODUCT_COPY.body}</p>

                    <ul className="mt-6 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                        {HERO_PRODUCT_COPY.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2.5 text-sm font-medium text-foreground">
                                <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-logo-blue text-white">
                                    <Check className="size-3" strokeWidth={3} />
                                </span>
                                {feature}
                            </li>
                        ))}
                    </ul>

                    {product.price && (
                        <p className="mt-7 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                            <ProductCardPrice slug={product.slug} initial={product.price} />
                        </p>
                    )}

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <NavigationLink href={href} className={siteButton({variant: 'brand', size: 'lg'})}>
                            {HERO_PRODUCT_COPY.cta}
                            <ArrowRight aria-hidden="true" className={arrowNudge} />
                        </NavigationLink>
                        <QuoteButton product={product.slug} className={siteButton({variant: 'secondary', size: 'lg'})} />
                    </div>
                </div>
            </div>
        </section>
    );
}
