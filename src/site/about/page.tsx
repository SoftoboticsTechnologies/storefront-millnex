import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {CONTACT_CONFIG, isPlaceholder} from '@/config/contact';
import {PageHero} from '@/site/ui/page-hero';
import {AboutSection} from '@/site/home/about-section';
import {StorySection} from '@/site/home/story-section';
import {WhyMillnex} from '@/site/home/why-millnex';
import {ManufacturingSection} from '@/site/home/manufacturing-section';
import {ProcessTimeline} from '@/site/home/process-timeline';
import {CtaSection} from '@/site/home/cta-section';
import {JsonLd} from '@/site/seo/json-ld';
import {breadcrumbSchema, organizationSchema} from '@/site/seo/schemas';
import {marketingPageMetadata} from '@/site/seo/page-metadata';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'SiteMeta'});
    return marketingPageMetadata({locale, path: '/about/', title: t('aboutTitle'), description: t('aboutDescription')});
}

export default async function AboutPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});
    const tNav = await getTranslations({locale, namespace: 'Navigation'});

    return (
        <>
            <JsonLd data={organizationSchema(locale)} />
            <JsonLd data={breadcrumbSchema([{name: tNav('home'), path: `/${locale}/`}, {name: tNav('about'), path: `/${locale}/about/`}])} />
            <PageHero
                eyebrow={t('aboutEyebrow')}
                title={t('aboutTitle')}
                body={t('aboutBody')}
                crumbs={[{label: tNav('home'), href: '/'}, {label: tNav('about')}]}
            >
                {!isPlaceholder(CONTACT_CONFIG.marketedBy) && (
                    <p className="mt-8 inline-flex flex-wrap items-center gap-x-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
                        {t('marketedBy')}
                        <span className="font-semibold text-foreground">{CONTACT_CONFIG.marketedBy}</span>
                    </p>
                )}
            </PageHero>
            <StorySection />
            <AboutSection showCta={false} />
            <WhyMillnex />
            <ManufacturingSection />
            <ProcessTimeline />
            <div className="pt-24 lg:pt-32">
                <CtaSection />
            </div>
        </>
    );
}
