import type {Metadata} from 'next';
import {getRouteLocale} from '@/platform/i18n/server';
import {noIndexRobots} from '@/config/metadata';
import {ClientRedirect} from '@/site/legacy/client-redirect';

export const metadata: Metadata = {
    robots: noIndexRobots(),
};

/**
 * `/machines/` was the old hardcoded machine catalog. Products now come from
 * Vendure, so the URL forwards to the shop instead of 404ing for existing
 * links/bookmarks. Static export has no server redirects: this is a
 * meta-refresh (works without JS) plus a client-side replace.
 */
export default async function LegacyMachinesPage() {
    const locale = await getRouteLocale();
    const target = `/${locale}/shop/`;

    return (
        <>
            <meta httpEquiv="refresh" content={`0; url=${target}`} />
            <link rel="canonical" href={target} />
            <ClientRedirect href={target} />
        </>
    );
}
