import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {noIndexRobots} from '@/config/metadata';
import {PageHero} from '@/site/ui/page-hero';
import {SITE_MEDIA, type SiteImage} from '@/site/content/media';

const LICENSE_URLS: Record<string, string> = {
    'CC0 1.0': 'https://creativecommons.org/publicdomain/zero/1.0/',
    'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
    'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
};

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'SiteMeta'});
    return {title: t('creditsTitle'), robots: noIndexRobots()};
}

/** Attribution for the openly licensed stock photos in SITE_MEDIA (required by CC BY). */
export default async function CreditsPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});
    const tNav = await getTranslations({locale, namespace: 'Navigation'});
    const credited = (Object.values(SITE_MEDIA) as SiteImage[]).filter((image) => image.credit);

    return (
        <>
            <PageHero
                title={t('creditsTitle')}
                body={t('creditsBody')}
                crumbs={[{label: tNav('home'), href: '/'}, {label: t('creditsTitle')}]}
            />
            <section className="bg-background py-16 sm:py-20 lg:py-24">
                <div className="site-container">
                    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                        {credited.map(({src, credit}) => credit && (
                            <li key={src} className="flex flex-col gap-1.5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
                                <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="min-w-0 font-semibold break-words transition-colors hover:text-brand">
                                    “{credit.title}”
                                </a>
                                <span className="flex shrink-0 flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                                    {credit.author}
                                    <a href={LICENSE_URLS[credit.license]} target="_blank" rel="noopener noreferrer license" className="spec-label rounded border border-border px-1.5 py-0.5 text-steel transition-colors hover:text-foreground">
                                        {credit.license}
                                    </a>
                                </span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-6 text-sm text-muted-foreground">{t('creditsNote')}</p>
                </div>
            </section>
        </>
    );
}
