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
        <div className="site-container pb-16 pt-24 sm:pt-28">
            <header className="mb-6">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('title')}</h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">{t('subtitle')}</p>
            </header>
            <WishlistList />
        </div>
    );
}
