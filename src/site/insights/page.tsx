import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {ArrowRight, BookOpen} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {formatDate} from '@/platform/i18n/format';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {PageHero} from '@/site/ui/page-hero';
import {siteButton, arrowNudge} from '@/site/ui/button-styles';
import {INSIGHT_TOPICS, INSIGHTS, INSIGHTS_COPY} from '@/site/content/insights';
import {marketingPageMetadata} from '@/site/seo/page-metadata';
import {InsightsBrowser} from './insights-browser';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'SiteMeta'});
    return marketingPageMetadata({locale, path: '/insights/', title: t('insightsTitle'), description: t('insightsDescription')});
}

/**
 * /insights — renders only real `INSIGHTS` entries. With none published
 * (today), the topics are shown as a static preview beside an empty state;
 * no sample or placeholder articles.
 */
export default async function InsightsPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});
    const tNav = await getTranslations({locale, namespace: 'Navigation'});

    return (
        <>
            <PageHero
                title={INSIGHTS_COPY.title}
                body={INSIGHTS_COPY.body}
                crumbs={[{label: tNav('home'), href: '/'}, {label: tNav('insights')}]}
            />
            <section className="bg-background py-16 sm:py-20 lg:py-24">
                <div className="site-container">
                    {INSIGHTS.length === 0 ? (
                        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
                            <div data-reveal className="lg:col-span-4">
                                <h2 className="spec-label text-steel">{INSIGHTS_COPY.topicsTitle}</h2>
                                <ul aria-label={t('insightsTopicsLabel')} className="mt-5 flex flex-wrap gap-2 lg:flex-col lg:gap-0 lg:divide-y lg:divide-border lg:border-y lg:border-border">
                                    {INSIGHT_TOPICS.map((topic) => (
                                        <li
                                            key={topic}
                                            className="inline-flex items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-3.5 lg:text-[15px]"
                                        >
                                            {topic}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div data-reveal style={{'--reveal-delay': '80ms'} as React.CSSProperties} className="relative isolate overflow-hidden rounded-2xl border border-border bg-surface px-6 py-14 sm:px-12 sm:py-20 lg:col-span-8">
                                <span className="flex size-14 items-center justify-center rounded-xl border border-border bg-card text-brand">
                                    <BookOpen aria-hidden="true" className="size-6" />
                                </span>
                                <h2 className="mt-8 max-w-xl font-display-wide text-[1.75rem] leading-tight font-bold sm:text-4xl">{INSIGHTS_COPY.emptyTitle}</h2>
                                <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">{INSIGHTS_COPY.emptyBody}</p>
                                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                    <NavigationLink href="/contact/#enquiry" className={siteButton({variant: 'brand', size: 'lg'})}>
                                        {t('talkToTeam')}
                                        <ArrowRight aria-hidden="true" className={arrowNudge} />
                                    </NavigationLink>
                                    <NavigationLink href="/shop/" className={siteButton({variant: 'outline', size: 'lg'})}>
                                        {t('exploreMachines')}
                                    </NavigationLink>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="sr-only">{t('insightsLatest')}</h2>
                            <InsightsBrowser
                                articles={INSIGHTS.map((article) => ({
                                    slug: article.slug,
                                    title: article.title,
                                    excerpt: article.excerpt,
                                    topic: article.topic,
                                    href: article.href,
                                    dateTime: article.publishedAt,
                                    date: formatDate(article.publishedAt, 'long', locale),
                                }))}
                                topics={INSIGHT_TOPICS}
                                allLabel={t('insightsAllTopics')}
                                navLabel={t('insightsTopicsLabel')}
                                noResults={t('insightsNoResults')}
                                readLabel={t('readArticle')}
                            />
                        </>
                    )}
                </div>
            </section>
        </>
    );
}
