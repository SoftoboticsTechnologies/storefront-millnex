import type {Metadata} from 'next';
import {toOgLocale} from '@/platform/i18n/locale-utils';
import {routing} from '@/platform/i18n/routing';
import {buildCanonicalUrl} from '@/config/metadata';

/**
 * Metadata for a locale-prefixed marketing page: self-referencing canonical,
 * hreflang alternates for every locale, and matching Open Graph fields.
 * `path` is locale-less with a trailing slash, e.g. "/about/".
 */
export function marketingPageMetadata({
    locale,
    path,
    title,
    description,
    images,
}: {
    locale: string;
    path: string;
    title: string;
    description: string;
    images?: Array<{url: string; width?: number; height?: number; alt?: string}>;
}): Metadata {
    const url = buildCanonicalUrl(`/${locale}${path}`);
    return {
        title,
        description,
        alternates: {
            canonical: url,
            languages: Object.fromEntries(routing.locales.map((l) => [l, buildCanonicalUrl(`/${l}${path}`)])),
        },
        openGraph: {
            title,
            description,
            type: 'website',
            locale: toOgLocale(locale),
            url,
            ...(images ? {images} : {}),
        },
    };
}
