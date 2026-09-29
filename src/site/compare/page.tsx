import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {ChevronRight, Scale} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {QuoteButton} from '@/features/enquiry/quote-dialog';
import {COMPARE_COPY} from '@/site/content/home';
import {getComparisonGroups} from '@/site/home/comparison-data';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {marketingPageMetadata} from '@/site/seo/page-metadata';
import {siteButton} from '@/site/ui/button-styles';
import {MachineComparison} from '@/site/ui/machine-comparison';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});
    return marketingPageMetadata({locale, path: '/compare/', title: t('compareMetaTitle'), description: t('compareMetaDescription')});
}

/**
 * /compare — every Vendure collection's machines side by side (same
 * component as the homepage section). Rows are only the fields the catalog
 * has; everything else is a quote/enquiry away.
 */
export default async function ComparePage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});
    const tNav = await getTranslations({locale, namespace: 'Navigation'});
    const tSite = await getTranslations({locale, namespace: 'Site'});
    const groups = await getComparisonGroups(locale);

    return (
        <>
            <section className="relative isolate overflow-hidden border-b border-border bg-surface">
                <div className="site-container pb-12 pt-28 lg:pb-16 lg:pt-36">
                    <nav aria-label={tSite('breadcrumb')}>
                        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                            <li><NavigationLink href="/" className="hover:text-foreground">{tNav('home')}</NavigationLink></li>
                            <li className="flex items-center gap-1.5"><ChevronRight aria-hidden="true" className="size-3.5 opacity-60" /><NavigationLink href="/shop" className="hover:text-foreground">{tNav('shop')}</NavigationLink></li>
                            <li className="flex items-center gap-1.5"><ChevronRight aria-hidden="true" className="size-3.5 opacity-60" /><span aria-current="page" className="font-semibold text-foreground">{t('compareMetaTitle')}</span></li>
                        </ol>
                    </nav>
                    <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <h1 className="animate-hero-rise font-display-wide text-[2.25rem] font-bold leading-[1.02] sm:text-5xl lg:text-[4rem]">{COMPARE_COPY.title}</h1>
                            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{COMPARE_COPY.body}</p>
                        </div>
                        <QuoteButton className={siteButton({variant: 'brand', size: 'lg'})} />
                    </div>
                </div>
            </section>

            <section className="py-14 sm:py-20">
                <div className="site-container">
                    {groups.length > 0 ? (
                        <MachineComparison groups={groups} />
                    ) : (
                        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
                            <Scale aria-hidden="true" className="size-9 text-steel" />
                            <p className="mt-4 max-w-md text-muted-foreground">{t('compareEmpty')}</p>
                            <NavigationLink href="/shop" className={siteButton({variant: 'secondary', size: 'md', className: 'mt-6'})}>{t('viewAllMachines')}</NavigationLink>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
