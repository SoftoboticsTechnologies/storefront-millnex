import {getTranslations} from 'next-intl/server';
import {ArrowRight, PackageOpen} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {siteButton} from '@/site/ui/button-styles';

/**
 * Shown in place of the product rails when the Vendure channel has no
 * products yet — an honest empty state instead of placeholder cards.
 */
export async function CatalogEmpty() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    return (
        <section className="py-12 sm:py-16">
            <div className="site-container">
                <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
                    <span className="flex size-16 items-center justify-center rounded-full bg-surface text-muted-foreground">
                        <PackageOpen className="size-8" />
                    </span>
                    <h2 className="mt-5 text-2xl font-extrabold">{t('catalogEmptyTitle')}</h2>
                    <p className="mt-2 max-w-md text-muted-foreground">{t('catalogEmptyBody')}</p>
                    <NavigationLink href="/contact/" className={siteButton({variant: 'brand', size: 'md', className: 'mt-7'})}>
                        {t('contactUs')}
                        <ArrowRight />
                    </NavigationLink>
                </div>
            </div>
        </section>
    );
}
