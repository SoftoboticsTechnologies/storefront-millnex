import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {PageHero} from '@/site/ui/page-hero';
import {ContactSection} from '@/site/home/contact-section';
import {JsonLd} from '@/site/seo/json-ld';
import {breadcrumbSchema} from '@/site/seo/schemas';
import {marketingPageMetadata} from '@/site/seo/page-metadata';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'SiteMeta'});
    return marketingPageMetadata({locale, path: '/contact/', title: t('contactTitle'), description: t('contactDescription')});
}

export default async function ContactPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});
    const tNav = await getTranslations({locale, namespace: 'Navigation'});

    return (
        <>
            <JsonLd data={breadcrumbSchema([{name: tNav('home'), path: `/${locale}/`}, {name: tNav('contact'), path: `/${locale}/contact/`}])} />
            <PageHero
                eyebrow={t('contactEyebrow')}
                title={t('contactTitle')}
                body={t('contactBody')}
                crumbs={[{label: tNav('home'), href: '/'}, {label: tNav('contact')}]}
            />
            <ContactSection showHeading={false} />
        </>
    );
}
