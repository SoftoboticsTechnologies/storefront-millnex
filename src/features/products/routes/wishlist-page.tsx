import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {noIndexRobots} from '@/config/metadata';
import {WishlistList} from '@/features/products/components/wishlist-list';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Wishlist'});
    return {
        title: t('title'),
        robots: noIndexRobots(),
    };
}

export default async function WishlistPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Wishlist'});

    return (
        <>
            {/* Title band — same light hero language as the other inner pages. */}
            <header className="relative isolate overflow-hidden border-b border-border bg-surface pb-10 pt-28 sm:pb-14 sm:pt-32 lg:pt-40">
                <div className="site-container">
                    <h1 className="animate-hero-rise font-display-wide text-[2.25rem] font-bold leading-[1.02] sm:text-5xl lg:text-[4rem]">{t('title')}</h1>
                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{t('subtitle')}</p>
                </div>
            </header>
            <div className="site-container py-10 sm:py-14 lg:py-16">
                <WishlistList />
            </div>
        </>
    );
}
