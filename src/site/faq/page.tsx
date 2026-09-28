import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {PageHero} from '@/site/ui/page-hero';
import {FaqSection} from '@/site/home/faq-section';
import {JsonLd} from '@/site/seo/json-ld';
import {breadcrumbSchema} from '@/site/seo/schemas';
import {marketingPageMetadata} from '@/site/seo/page-metadata';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'SiteMeta'});
    return marketingPageMetadata({locale, path: '/faq/', title: t('faqTitle'), description: t('faqDescription')});
}

/** Standalone FAQ page — the only place the FAQPage JSON-LD is emitted. */
export default async function FaqPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});
    const tNav = await getTranslations({locale, namespace: 'Navigation'});

    return (
        <>
            <JsonLd data={breadcrumbSchema([{name: tNav('home'), path: `/${locale}/`}, {name: tNav('faq'), path: `/${locale}/faq/`}])} />
            <PageHero
                eyebrow={t('faqEyebrow')}
                title={t('faqTitle')}
                body={t('faqBody')}
                crumbs={[{label: tNav('home'), href: '/'}, {label: tNav('faq')}]}
            />
            <FaqSection withSchema withHeading={false} />
        </>
    );
}
