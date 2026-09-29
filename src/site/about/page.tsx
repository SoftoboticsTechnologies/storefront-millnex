import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {ArrowRight} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {CONTACT_CONFIG, isPlaceholder} from '@/config/contact';
import {getShopCategories} from '@/features/collections/data';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {PageHero} from '@/site/ui/page-hero';
import {siteButton, arrowNudge} from '@/site/ui/button-styles';
import {MILL_GALLERY} from '@/site/content/media';
import {JsonLd} from '@/site/seo/json-ld';
import {breadcrumbSchema, organizationSchema} from '@/site/seo/schemas';
import {marketingPageMetadata} from '@/site/seo/page-metadata';
import {MachineStage} from './machine-stage';
import {CompanyCta} from './company-cta';
import {ApproachSection, WhatWeBuild, WhoWeAre, WhyChoose} from './sections';
import {MachineFeatures} from '@/site/ui/machine-features';
import {IsoBadge} from '@/site/ui/iso-badge';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'SiteMeta'});
    return marketingPageMetadata({locale, path: '/about/', title: t('aboutTitle'), description: t('aboutDescription')});
}

/** Hero visual: Millnex's own mill photos on light stages, staggered like a spec sheet. */
function HeroGallery() {
    return (
        <div className="animate-hero-image-in grid grid-cols-2 gap-3 sm:gap-4" style={{'--hero-delay': '160ms'} as React.CSSProperties}>
            {MILL_GALLERY.map((image, index) => (
                <MachineStage
                    key={image.src}
                    image={image}
                    priority
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    className={index % 2 === 1 ? 'translate-y-6 sm:translate-y-10' : undefined}
                />
            ))}
        </div>
    );
}

/**
 * /about — the header is transparent over the ink hero on this route (see
 * site-header TRANSPARENT_ROUTES), so the page must open with PageHero tone="tint".
 */
export default async function AboutPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});
    const tNav = await getTranslations({locale, namespace: 'Navigation'});
    const categories = await getShopCategories(locale);

    return (
        <>
            <JsonLd data={organizationSchema(locale)} />
            <JsonLd data={breadcrumbSchema([{name: tNav('home'), path: `/${locale}/`}, {name: tNav('about'), path: `/${locale}/about/`}])} />
            <PageHero
                tone="tint"
                title={t('aboutTitle')}
                body={t('aboutBody')}
                crumbs={[{label: tNav('home'), href: '/'}, {label: tNav('about')}]}
                aside={<HeroGallery />}
            >
                <IsoBadge className="animate-hero-rise mt-6" />
                <div className="animate-hero-rise mt-9 flex flex-col gap-3 sm:flex-row" style={{'--hero-delay': '180ms'} as React.CSSProperties}>
                    <NavigationLink href="/shop/" className={siteButton({variant: 'brand', size: 'lg'})}>
                        {t('exploreMachines')}
                        <ArrowRight aria-hidden="true" className={arrowNudge} />
                    </NavigationLink>
                    <NavigationLink href="/contact/" className={siteButton({variant: 'outline', size: 'lg'})}>
                        {t('talkToTeam')}
                    </NavigationLink>
                </div>
                {!isPlaceholder(CONTACT_CONFIG.marketedBy) && (
                    <p className="mt-10 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-border pt-6 text-sm">
                        <span className="spec-label text-muted-foreground">{t('marketedBy')}</span>
                        <span className="font-semibold text-foreground">{CONTACT_CONFIG.marketedBy}</span>
                    </p>
                )}
            </PageHero>
            <WhoWeAre />
            <WhatWeBuild categories={categories} />
            <MachineFeatures className="bg-background" />
            <ApproachSection />
            <WhyChoose />
            <CompanyCta />
        </>
    );
}
