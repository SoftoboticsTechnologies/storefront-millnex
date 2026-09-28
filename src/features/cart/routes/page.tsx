import type {Metadata} from 'next';
import {getRouteLocale} from '@/platform/i18n/server';
import {getTranslations} from 'next-intl/server';
import {Cart} from "@/features/cart/routes/cart";
import {noIndexRobots} from '@/config/metadata';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Cart'});
    return {
        title: t('title'),
        robots: noIndexRobots(),
    };
}

export default async function CartPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Cart'});

    return (
        <div className="site-container pb-16 pt-24 sm:pt-28">
            <h1 className="mb-8 text-3xl font-extrabold tracking-tight sm:text-4xl">{t('title')}</h1>

            <Cart/>
        </div>
    );
}
