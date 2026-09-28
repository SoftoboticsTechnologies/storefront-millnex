import type {MetadataRoute} from 'next';
import {routing} from '@/platform/i18n/routing';
import {buildCanonicalUrl} from '@/config/metadata';
import {getPopularProductSlugs} from '@/features/products/data';
import {getTopCollections} from '@/features/collections/data';

type SitemapPage = {path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']};

/**
 * sitemap.xml (exported statically at build): storefront + company pages,
 * plus every Vendure product and collection page that is prerendered.
 * Session-bound routes (cart, checkout, account, search) are excluded.
 */
const STATIC_PAGES: SitemapPage[] = [
    {path: '/', priority: 1, changeFrequency: 'daily'},
    {path: '/shop/', priority: 0.9, changeFrequency: 'daily'},
    {path: '/about/', priority: 0.5, changeFrequency: 'monthly'},
    {path: '/contact/', priority: 0.6, changeFrequency: 'monthly'},
    {path: '/faq/', priority: 0.5, changeFrequency: 'monthly'},
    {path: '/insights/', priority: 0.4, changeFrequency: 'weekly'},
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Slugs come from the default locale; product/collection slugs are shared
    // across locales unless translated, in which case the per-locale page
    // canonicalizes itself.
    const [productSlugs, collections] = await Promise.all([
        getPopularProductSlugs(routing.defaultLocale),
        getTopCollections(routing.defaultLocale),
    ]);

    const pages: SitemapPage[] = [
        ...STATIC_PAGES,
        ...[...new Set(collections.map((collection) => collection.slug))].map((slug) => ({path: `/collection/${slug}/`, priority: 0.8, changeFrequency: 'weekly' as const})),
        ...[...new Set(productSlugs)].map((slug) => ({path: `/product/${slug}/`, priority: 0.7, changeFrequency: 'weekly' as const})),
    ];

    return pages.flatMap(({path, priority, changeFrequency}) =>
        routing.locales.map((locale) => ({
            url: buildCanonicalUrl(`/${locale}${path}`),
            changeFrequency,
            priority: locale === routing.defaultLocale ? priority : Math.round(priority * 5) / 10,
            alternates: {
                languages: Object.fromEntries(routing.locales.map((l) => [l, buildCanonicalUrl(`/${l}${path}`)])),
            },
        })),
    );
}
