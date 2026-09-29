import {getTranslations} from 'next-intl/server';
import {ArrowRight, Home} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {Link} from '@/platform/i18n/navigation';
import {getShopCategories} from '@/features/collections/data';
import {siteButton, arrowNudge} from '@/site/ui/button-styles';

/** Light 404 band — below the solid header, with real Vendure categories as ways back in. */
export default async function NotFound() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'NotFound'});
    let categories: Array<{id: string; name: string; slug: string}> = [];
    try {
        categories = await getShopCategories(locale);
    } catch {
        // Collections unavailable — the page still offers home and shop.
    }

    return (
        <section className="relative isolate flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden bg-background pt-28 pb-20 lg:pt-36">
            <div className="site-container">
                <div className="mx-auto max-w-2xl text-center">
                    <p aria-hidden="true" className="font-display-wide text-[6.5rem] leading-none font-bold text-foreground/10 sm:text-[9rem]">404</p>
                    <h1 className="mt-4 font-display-wide text-[2rem] leading-[1.05] font-bold text-balance sm:text-5xl">{t('title')}</h1>
                    <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground">{t('message')}</p>

                    <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link href="/shop" prefetch={false} className={siteButton({variant: 'brand', size: 'lg'})}>
                            {t('browseProducts')}
                            <ArrowRight aria-hidden="true" className={arrowNudge} />
                        </Link>
                        <Link href="/" prefetch={false} className={siteButton({variant: 'outline', size: 'lg'})}>
                            <Home aria-hidden="true" />
                            {t('goHome')}
                        </Link>
                    </div>

                    {categories.length > 0 && (
                        <div className="mt-12 border-t border-border pt-8">
                            <p className="spec-label text-steel">{t('popularCollections')}</p>
                            <ul className="mt-4 flex flex-wrap justify-center gap-2">
                                {categories.slice(0, 6).map((category) => (
                                    <li key={category.id}>
                                        <Link
                                            href={`/collection/${category.slug}`}
                                            prefetch={false}
                                            className="inline-flex rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold transition-colors hover:border-foreground/35"
                                        >
                                            {category.name.trim()}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
