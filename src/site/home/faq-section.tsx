import {getTranslations} from 'next-intl/server';
import {ArrowRight, MessageCircleQuestion} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {FAQ_COPY} from '@/site/content/home';
import {FAQ_ITEMS} from '@/site/content/faq';
import {SectionHeading} from '@/site/ui/section-heading';
import {siteButton} from '@/site/ui/button-styles';
import {externalLinkProps, resolveContactLinks} from '@/site/ui/contact-links';
import {WhatsAppIcon} from '@/site/ui/whatsapp-icon';
import {JsonLd} from '@/site/seo/json-ld';
import {faqPageSchema} from '@/site/seo/schemas';

/**
 * FAQ accordion + "still have questions" card. On the standalone /faq page the
 * PageHero already carries the heading, so `withHeading={false}` drops the
 * duplicate and the help card sticks beside the answers instead.
 */
export async function FaqSection({withSchema = false, withHeading = true}: {withSchema?: boolean; withHeading?: boolean}) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});
    const tNav = await getTranslations({locale, namespace: 'Navigation'});
    const {whatsapp} = resolveContactLinks(locale, tNav('whatsappGreeting'));

    return (
        <section id="faq" className={withHeading ? 'py-24 lg:py-32' : 'py-14 lg:py-20'}>
            {withSchema && <JsonLd data={faqPageSchema(FAQ_ITEMS)} />}
            <div className="site-container grid gap-12 lg:grid-cols-12 lg:gap-16">
                <div className={withHeading ? 'lg:col-span-5' : 'lg:order-last lg:col-span-5 lg:sticky lg:top-24 lg:self-start'}>
                    {withHeading && <SectionHeading eyebrow={FAQ_COPY.eyebrow} title={FAQ_COPY.title} body={FAQ_COPY.body} />}
                    <div data-reveal className="mt-10 rounded-2xl border border-border bg-surface p-6">
                        <MessageCircleQuestion aria-hidden="true" className="size-7 text-brand" />
                        <p className="mt-4 font-bold">{t('stillHaveQuestions')}</p>
                        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                            <NavigationLink href="/contact/#enquiry" className={siteButton({variant: 'brand', size: 'md'})}>
                                {t('sendMessage')}
                                <ArrowRight className="transition-transform group-hover/btn:translate-x-0.5" />
                            </NavigationLink>
                            <a href={whatsapp.href} {...externalLinkProps(whatsapp)} className={siteButton({variant: 'whatsapp', size: 'md'})}>
                                <WhatsAppIcon className="text-[#1c9e52]" />
                                {t('askOnWhatsApp')}
                            </a>
                        </div>
                    </div>
                </div>

                <div data-reveal className="lg:col-span-7">
                    <Accordion defaultValue={['faq-0']} className="rounded-2xl border border-border bg-card px-2 sm:px-4">
                        {FAQ_ITEMS.map((item, index) => (
                            <AccordionItem key={item.question} value={`faq-${index}`} className="border-border px-3">
                                <AccordionTrigger className="py-5 text-left text-base font-bold hover:no-underline">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
