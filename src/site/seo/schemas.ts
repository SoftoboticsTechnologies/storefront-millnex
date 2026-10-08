import {CONTACT_CONFIG, getSocialProfiles, isPlaceholder} from '@/config/contact';
import {SITE_NAME, buildCanonicalUrl} from '@/config/metadata';
import {BRAND_LOGO} from '@/site/content/media';

/**
 * schema.org builders. Rules: no ratings, reviews, prices or offers are ever
 * emitted (none are published), and contact fields are only included once
 * CONTACT_CONFIG holds real values rather than placeholders.
 */

export function organizationSchema(locale: string) {
    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: buildCanonicalUrl(`/${locale}/`),
        logo: buildCanonicalUrl(BRAND_LOGO.src),
        // Hidden 2026-10-08: 'Manufacturer of domestic flour mills, pulverizers, masala machinery and food-processing machines.'
        description: 'Manufacturer of the Millnex Atta Chakki — fully automatic domestic flour mills for fresh, hygienic atta at home.',
    };

    if (!isPlaceholder(CONTACT_CONFIG.email)) schema.email = CONTACT_CONFIG.email;
    if (!isPlaceholder(CONTACT_CONFIG.phone)) {
        schema.contactPoint = [{
            '@type': 'ContactPoint',
            telephone: CONTACT_CONFIG.phone,
            contactType: 'sales',
            ...(isPlaceholder(CONTACT_CONFIG.email) ? {} : {email: CONTACT_CONFIG.email}),
        }];
    }
    if (!isPlaceholder(CONTACT_CONFIG.address)) {
        schema.address = {'@type': 'PostalAddress', streetAddress: CONTACT_CONFIG.address};
    }
    const sameAs = getSocialProfiles().map((profile) => profile.url);
    if (sameAs.length > 0) schema.sameAs = sameAs;

    return schema;
}

export function faqPageSchema(items: Array<{question: string; answer: string}>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {'@type': 'Answer', text: item.answer},
        })),
    };
}

export function breadcrumbSchema(items: Array<{name: string; path: string}>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: buildCanonicalUrl(item.path),
        })),
    };
}
