import {getTranslations} from 'next-intl/server';
import {ArrowRight} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {QuoteButton} from '@/features/enquiry/quote-dialog';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {siteButton, arrowNudge} from '@/site/ui/button-styles';
import {COMPANY_CTA_COPY} from '@/site/content/company';
import {MILL_GALLERY} from '@/site/content/media';
import {MachineStage} from './machine-stage';

/**
 * Closing CTA for the company pages (/about, /manufacturing). A contained
 * ink panel on a light band, so it reads as its own block above the
 * graphite footer rather than merging into it.
 */
export async function CompanyCta() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});
    const [first, second] = MILL_GALLERY;

    return (
        <section className="bg-background py-20 sm:py-24 lg:py-28">
            <div className="site-container">
                <div data-reveal className="relative isolate overflow-hidden rounded-2xl bg-tint-blue text-foreground">
                    <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-12 lg:items-center lg:gap-12 lg:p-14">
                        <div className="lg:col-span-7">
                            <h2 className="font-display-wide text-[2rem] leading-[1.02] font-bold text-balance sm:text-[2.5rem] lg:text-[3.25rem]">
                                {COMPANY_CTA_COPY.title}
                            </h2>
                            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{COMPANY_CTA_COPY.body}</p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <NavigationLink href="/shop/" className={siteButton({variant: 'brand', size: 'lg'})}>
                                    {t('exploreMachines')}
                                    <ArrowRight aria-hidden="true" className={arrowNudge} />
                                </NavigationLink>
                                <NavigationLink href="/contact/" className={siteButton({variant: 'outline', size: 'lg'})}>
                                    {t('talkToTeam')}
                                </NavigationLink>
                                <QuoteButton className={siteButton({variant: 'secondary', size: 'lg'})} />
                            </div>
                        </div>
                        {/* Decorative: the same photos appear with alt text elsewhere on the page. */}
                        <div aria-hidden="true" className="hidden grid-cols-2 gap-4 sm:grid lg:col-span-5">
                            <MachineStage image={{...first, alt: ''}} sizes="(min-width: 1024px) 18vw, 40vw" />
                            <MachineStage image={{...second, alt: ''}} sizes="(min-width: 1024px) 18vw, 40vw" className="translate-y-8" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
