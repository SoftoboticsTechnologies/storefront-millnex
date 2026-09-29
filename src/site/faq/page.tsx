import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {ArrowRight, MessageCircleQuestion} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {PageHero} from '@/site/ui/page-hero';
import {siteButton, arrowNudge} from '@/site/ui/button-styles';
import {externalLinkProps, resolveContactLinks} from '@/site/ui/contact-links';
import {WhatsAppIcon} from '@/site/ui/whatsapp-icon';
import {FAQ_CATEGORIES, FAQ_ITEMS} from '@/site/content/faq';
import {JsonLd} from '@/site/seo/json-ld';
import {breadcrumbSchema, faqPageSchema} from '@/site/seo/schemas';
import {marketingPageMetadata} from '@/site/seo/page-metadata';
import {FaqBrowser, type FaqBrowserCategory} from './faq-browser';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'SiteMeta'});
    return marketingPageMetadata({locale, path: '/faq/', title: t('faqTitle'), description: t('faqDescription')});
}

/** Standalone FAQ page — the only place the FAQPage JSON-LD is emitted (all Q&As, independent of the category filter). */
export default async function FaqPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});
    const tNav = await getTranslations({locale, namespace: 'Navigation'});
    const {whatsapp} = resolveContactLinks(locale, tNav('whatsappGreeting'));

    const categories: FaqBrowserCategory[] = FAQ_CATEGORIES.map(({id, label}) => {
        const items = FAQ_ITEMS.filter((item) => item.category === id).map(({question, answer}) => ({question, answer}));
        return {id, label, items, countLabel: t('faqCount', {count: items.length})};
    }).filter((category) => category.items.length > 0);

    return (
        <>
            <JsonLd data={breadcrumbSchema([{name: tNav('home'), path: `/${locale}/`}, {name: tNav('faq'), path: `/${locale}/faq/`}])} />
            <JsonLd data={faqPageSchema(FAQ_ITEMS)} />
            <PageHero
                title={t('faqTitle')}
                body={t('faqBody')}
                crumbs={[{label: tNav('home'), href: '/'}, {label: tNav('faq')}]}
            />

            <section className="bg-background py-16 sm:py-20 lg:py-24">
                <div className="site-container">
                    <FaqBrowser
                        categories={categories}
                        allLabel={t('faqAll')}
                        allCountLabel={t('faqCount', {count: FAQ_ITEMS.length})}
                        navLabel={t('faqCategoriesLabel')}
                    />
                </div>
            </section>

            <section className="bg-surface py-20 sm:py-24">
                <div className="site-container">
                    <div data-reveal className="flex flex-col gap-8 rounded-2xl border border-border bg-card p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-12">
                        <div className="flex max-w-2xl gap-5">
                            <span className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-surface text-brand sm:flex">
                                <MessageCircleQuestion aria-hidden="true" className="size-6" />
                            </span>
                            <div>
                                <h2 className="font-display-wide text-[1.75rem] leading-tight font-bold sm:text-4xl">{t('stillHaveQuestionsTitle')}</h2>
                                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{t('stillHaveQuestionsBody')}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <NavigationLink href="/contact/#enquiry" className={siteButton({variant: 'brand', size: 'lg'})}>
                                {t('talkToExpert')}
                                <ArrowRight aria-hidden="true" className={arrowNudge} />
                            </NavigationLink>
                            <a href={whatsapp.href} {...externalLinkProps(whatsapp)} className={siteButton({variant: 'whatsapp', size: 'lg'})}>
                                <WhatsAppIcon aria-hidden="true" className="text-[#1c9e52]" />
                                {t('whatsappUs')}
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
