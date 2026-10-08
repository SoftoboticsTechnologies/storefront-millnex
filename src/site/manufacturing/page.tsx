import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {ArrowRight, Check} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {QuoteButton} from '@/features/enquiry/quote-dialog';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {PageHero} from '@/site/ui/page-hero';
import {SectionHeading} from '@/site/ui/section-heading';
import {LivePhotos} from '@/site/ui/live-photos';
import {siteButton, arrowNudge} from '@/site/ui/button-styles';
import {MACHINE_GALLERY, MANUFACTURING_PAGE_COPY} from '@/site/content/company';
import {MILL_GALLERY} from '@/site/content/media';
import {JsonLd} from '@/site/seo/json-ld';
import {breadcrumbSchema} from '@/site/seo/schemas';
import {marketingPageMetadata} from '@/site/seo/page-metadata';
import {MachineStage} from '@/site/about/machine-stage';
import {CompanyCta} from '@/site/about/company-cta';
import {ProcessTimeline} from './process-timeline';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'SiteMeta'});
    return marketingPageMetadata({
        locale,
        path: '/manufacturing/',
        title: t('manufacturingTitle'),
        description: t('manufacturingDescription'),
    });
}

/** Hero visual: one large atta chakki stage flanked by two smaller mills (was a pulverizer + gravy machine until 2026-10-08). */
function HeroVisual() {
    const {heroImage} = MANUFACTURING_PAGE_COPY;
    return (
        <div className="animate-hero-image-in grid grid-cols-3 grid-rows-2 gap-3 sm:gap-4" style={{'--hero-delay': '160ms'} as React.CSSProperties}>
            <MachineStage image={heroImage} priority sizes="(min-width: 1024px) 30vw, 64vw" className="col-span-2 row-span-2 aspect-auto h-full" />
            <MachineStage image={MILL_GALLERY[0]} priority sizes="(min-width: 1024px) 14vw, 30vw" />
            <MachineStage image={MACHINE_GALLERY[3]} priority sizes="(min-width: 1024px) 14vw, 30vw" />
        </div>
    );
}

/** Ink band: what the process adds up to — ABOUT_COPY's own words and highlights. */
function OutcomeBand() {
    const {outcome} = MANUFACTURING_PAGE_COPY;
    return (
        <section className="relative isolate overflow-hidden bg-tint-green py-20 text-foreground sm:py-24 lg:py-28">
            <div className="site-container grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
                <div className="lg:col-span-6">
                    <SectionHeading title={outcome.title} body={outcome.body} />
                </div>
                <ul className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:col-span-6">
                    {outcome.items.map((item, index) => (
                        <li
                            key={item}
                            data-reveal
                            style={{'--reveal-delay': `${80 * index}ms`} as React.CSSProperties}
                            className="flex gap-3 bg-card p-6 text-[15px] font-semibold leading-snug"
                        >
                            <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function Gallery() {
    const {gallery} = MANUFACTURING_PAGE_COPY;
    return (
        <section className="bg-surface py-20 sm:py-24 lg:py-28">
            <div className="site-container">
                <SectionHeading title={gallery.title} body={gallery.body} />
                <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:mt-16">
                    {MACHINE_GALLERY.map((image, index) => (
                        <li key={image.src} data-reveal style={{'--reveal-delay': `${50 * (index % 3)}ms`} as React.CSSProperties}>
                            <figure>
                                <MachineStage image={image} sizes="(min-width: 768px) 30vw, 45vw" className="border border-border" />
                                <figcaption className="mt-3 text-sm leading-snug text-muted-foreground">{image.alt}</figcaption>
                            </figure>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/**
 * /manufacturing — transparent header over the ink hero (site-header
 * TRANSPARENT_ROUTES), so it opens with PageHero tone="tint".
 */
export default async function ManufacturingPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});
    const tNav = await getTranslations({locale, namespace: 'Navigation'});

    return (
        <>
            <JsonLd data={breadcrumbSchema([{name: tNav('home'), path: `/${locale}/`}, {name: tNav('about'), path: `/${locale}/about/`}, {name: tNav('manufacturing'), path: `/${locale}/manufacturing/`}])} />
            <PageHero
                tone="tint"
                title={t('manufacturingTitle')}
                body={t('manufacturingBody')}
                crumbs={[{label: tNav('home'), href: '/'}, {label: tNav('about'), href: '/about/'}, {label: tNav('manufacturing')}]}
                aside={<HeroVisual />}
            >
                <div className="animate-hero-rise mt-9 flex flex-col gap-3 sm:flex-row" style={{'--hero-delay': '180ms'} as React.CSSProperties}>
                    <QuoteButton className={siteButton({variant: 'brand', size: 'lg'})} />
                    <NavigationLink href="/shop/" className={siteButton({variant: 'outline', size: 'lg'})}>
                        {t('exploreMachines')}
                        <ArrowRight aria-hidden="true" className={arrowNudge} />
                    </NavigationLink>
                </div>
            </PageHero>
            <ProcessTimeline />
            <OutcomeBand />
            <LivePhotos className="bg-background" />
            <Gallery />
            <CompanyCta />
        </>
    );
}
