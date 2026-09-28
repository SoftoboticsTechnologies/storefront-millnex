import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {ArrowRight, BookOpen} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {formatDate} from '@/platform/i18n/format';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {PageHero} from '@/site/ui/page-hero';
import {siteButton} from '@/site/ui/button-styles';
import {INSIGHTS, INSIGHTS_COPY} from '@/site/content/insights';
import {marketingPageMetadata} from '@/site/seo/page-metadata';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'SiteMeta'});
    return marketingPageMetadata({locale, path: '/insights/', title: t('insightsTitle'), description: t('insightsDescription')});
}

export default async function InsightsPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});
    const tNav = await getTranslations({locale, namespace: 'Navigation'});

    return (
        <>
            <PageHero
                eyebrow={INSIGHTS_COPY.eyebrow}
                title={INSIGHTS_COPY.title}
                body={INSIGHTS_COPY.body}
                crumbs={[{label: tNav('home'), href: '/'}, {label: tNav('insights')}]}
            />
            <section className="py-16 lg:py-24">
                <div className="site-container">
                    {INSIGHTS.length === 0 ? (
                        <div className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-dashed border-border bg-surface px-6 py-16 text-center sm:px-12">
                            <span className="flex size-14 items-center justify-center rounded-2xl bg-card text-brand shadow-sm">
                                <BookOpen className="size-6" />
                            </span>
                            <h2 className="mt-6 text-2xl font-extrabold">{INSIGHTS_COPY.emptyTitle}</h2>
                            <p className="mt-3 text-muted-foreground">{INSIGHTS_COPY.emptyBody}</p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <NavigationLink href="/contact/#enquiry" className={siteButton({variant: 'brand', size: 'lg'})}>
                                    {t('askOurTeam')}
                                    <ArrowRight className="transition-transform group-hover/btn:translate-x-0.5" />
                                </NavigationLink>
                                <NavigationLink href="/shop/" className={siteButton({variant: 'outline', size: 'lg'})}>
                                    {t('exploreProducts')}
                                </NavigationLink>
                            </div>
                        </div>
                    ) : (
                        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {INSIGHTS.map((article) => (
                                <li key={article.slug} className="rounded-2xl border border-border bg-card p-6">
                                    <p className="text-xs font-bold uppercase tracking-wider text-brand">{article.topic}</p>
                                    <h2 className="mt-3 text-lg font-extrabold">{article.title}</h2>
                                    <p className="mt-2 text-sm text-muted-foreground">{article.excerpt}</p>
                                    <p className="mt-4 text-xs text-muted-foreground">{formatDate(article.publishedAt, 'long', locale)}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </>
    );
}
