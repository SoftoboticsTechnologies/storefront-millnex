import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {ArrowRight, LayoutGrid, Lock, Search, ShoppingBag} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {getProductOptions} from '@/features/products/data';
import {QuoteDialog} from '@/features/enquiry/quote-dialog';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {HERO_COPY} from '@/site/content/home';
import {SITE_MEDIA} from '@/site/content/media';
import {siteButton} from '@/site/ui/button-styles';

interface ShopHeroProps {
    hasCategories: boolean;
}

/**
 * Storefront hero: Millnex's full-width banner artwork, shown uncropped
 * because its headline and "Order now" are baked into the image, followed by
 * the page's real <h1> and shopping CTAs. The banner sits below the (solid)
 * header so the header never covers its headline.
 */
export async function ShopHero({hasCategories}: ShopHeroProps) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});
    const banner = SITE_MEDIA.heroBanner;
    // Real Vendure products for the quote form's picker (hidden when none).
    const products = await getProductOptions(locale);

    return (
        <section className="relative isolate overflow-hidden border-b border-border bg-surface pt-16 text-foreground">
            <NavigationLink href="/shop/" className="group relative mx-auto block max-w-[1920px] outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-brand/60">
                <Image
                    src={banner.src}
                    alt={banner.alt}
                    width={banner.width}
                    height={banner.height}
                    priority
                    sizes="100vw"
                    className="animate-hero-image-in h-auto w-full"
                />
                {/* Soft fade into the text band below. */}
                <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-surface/70 to-transparent sm:h-10" />
            </NavigationLink>

            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-blueprint opacity-70 [mask-image:linear-gradient(to_top,black,transparent)]" />
            <div aria-hidden="true" className="absolute -left-40 bottom-0 -z-10 size-[30rem] rounded-full bg-brand/10 blur-[130px]" />

            <div className="site-container flex flex-col gap-7 py-9 sm:py-12 xl:flex-row xl:items-center xl:justify-between xl:gap-12">
                <div className="min-w-0 max-w-3xl xl:flex-1">
                    {/* Wraps to two lines on narrow phones, so rounded-xl there and a pill from sm. */}
                    <p className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-1.5 text-[11px] leading-snug font-bold uppercase tracking-[0.16em] text-muted-foreground sm:rounded-full sm:tracking-[0.2em]">
                        <ShoppingBag aria-hidden="true" className="size-3.5 shrink-0 text-brand" />
                        {t('heroEyebrow')}
                    </p>
                    <h1 className="animate-hero-rise mt-4 text-3xl leading-[1.1] font-extrabold text-foreground sm:text-4xl lg:text-[2.75rem]">
                        {t('heroTitle')}
                    </h1>
                    <p className="animate-hero-rise mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                        {HERO_COPY.body}
                    </p>
                </div>

                {/* CTAs share one row from md up (all three need ~600px). On wide
                    screens they move to the right of the heading, trust points below. */}
                <div className="flex flex-col gap-6 xl:shrink-0 xl:items-end">
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:flex-nowrap">
                        <NavigationLink href="/shop/" className={siteButton({variant: 'brand', size: 'lg'})}>
                            {t('shopNow')}
                            <ArrowRight className="transition-transform group-hover/btn:translate-x-0.5" />
                        </NavigationLink>
                        {hasCategories && (
                            <NavigationLink href="/#categories" className={siteButton({variant: 'outline', size: 'lg'})}>
                                <LayoutGrid />
                                {t('browseCategories')}
                            </NavigationLink>
                        )}
                        <QuoteDialog products={products} triggerClassName={siteButton({variant: 'outline', size: 'lg', className: 'cursor-pointer'})} />
                    </div>
                    <ul className="flex flex-wrap gap-x-6 gap-y-3 xl:justify-end text-sm font-semibold text-foreground/80">
                        <li className="flex items-center gap-2"><Search className="size-4 text-brand" />{t('heroPointBrowse')}</li>
                        <li className="flex items-center gap-2"><ShoppingBag className="size-4 text-brand" />{t('heroPointCart')}</li>
                        <li className="flex items-center gap-2"><Lock className="size-4 text-brand" />{t('heroPointCheckout')}</li>
                    </ul>
                </div>
            </div>
        </section>
    );
}
