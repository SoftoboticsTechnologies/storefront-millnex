import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {getCollectionNames, getShopCategories} from '@/features/collections/data';
import {SearchResults} from '@/features/search/routes/search-results';
import {SearchTerm} from '@/features/search/routes/search-term';
import {ListingBanner} from '@/components/listing-banner';
import {SITE_NAME, noIndexRobots} from '@/config/metadata';

// searchParams can't be read server-side under output: 'export' (no
// per-request server) — the query-specific heading is resolved client-side
// (see search-term.tsx); metadata stays a generic, build-time fallback. The
// route is already noindex, so this has no SEO cost.
export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Search'});

    return {
        title: t('pageTitle'),
        description: t('metaCatalogDescription', {siteName: SITE_NAME}),
        robots: noIndexRobots(),
    };
}

/**
 * `/search?q=` — same listing system as the shop (band, sidebar/drawer
 * filters incl. categories, toolbar, grid). No build-time products: the
 * content depends entirely on the query string, so the grid shows its
 * skeleton until the live Vendure fetch resolves.
 */
export default async function SearchPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Search'});
    const [categories, collectionNames] = await Promise.all([
        getShopCategories(locale),
        getCollectionNames(locale),
    ]);

    return (
        <div>
            <ListingBanner
                breadcrumbs={[
                    {label: t('home'), href: '/'},
                    {label: t('shop'), href: '/shop'},
                    {label: t('title')},
                ]}
                title={<SearchTerm />}
                description={{text: t('intro')}}
            />
            <div className="site-container pb-16 lg:pb-24">
                <SearchResults
                    collectionNames={collectionNames}
                    categories={categories.map(({name, slug}) => ({name: name.trim(), slug}))}
                />
            </div>
        </div>
    );
}
