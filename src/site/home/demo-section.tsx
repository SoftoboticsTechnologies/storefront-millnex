import type {CSSProperties} from 'react';
import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {BadgeCheck, CalendarCheck, Truck} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {QuoteButton} from '@/features/enquiry/quote-dialog';
import {DEMO_COPY} from '@/site/content/home';
import {siteButton} from '@/site/ui/button-styles';
import {externalLinkProps, resolveContactLinks} from '@/site/ui/contact-links';
import {SectionHeading} from '@/site/ui/section-heading';
import {WhatsAppIcon} from '@/site/ui/whatsapp-icon';

/**
 * "See the Millnex Atta Chakki at Your Home Before You Buy" (2026-10-08):
 * the free home demo as three steps, the try-before-you-buy message and the
 * free-shipping radius, beside a real photo of the machine. CTAs open the
 * site-wide demo modal or WhatsApp. Copy: home.ts#DEMO_COPY — the client's
 * stated offer only, no invented payment terms.
 */
export async function DemoSection() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});
    const tNav = await getTranslations({locale, namespace: 'Navigation'});
    const contact = resolveContactLinks(locale, tNav('whatsappGreeting'));

    return (
        <section id="free-demo" aria-labelledby="free-demo-title" className="relative isolate scroll-mt-28 overflow-hidden border-y border-border bg-tint-green py-20 sm:py-24 lg:py-28">
            <div aria-hidden="true" className="absolute -right-40 -top-40 -z-10 size-[32rem] rounded-full bg-logo-green/15 blur-[160px]" />
            <div className="site-container grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-7">
                    <SectionHeading title={<span id="free-demo-title">{DEMO_COPY.title}</span>} body={DEMO_COPY.body} />

                    <ol className="mt-10 grid gap-4 sm:grid-cols-3">
                        {DEMO_COPY.steps.map((step, index) => (
                            <li
                                key={step.title}
                                data-reveal
                                style={{'--reveal-delay': `${index * 90}ms`} as CSSProperties}
                                className="rounded-xl border border-border bg-card p-5"
                            >
                                <span className="flex size-10 items-center justify-center rounded-lg bg-logo-green/15 font-mono text-xs font-semibold text-logo-green-deep">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <h3 className="mt-4 font-display-wide text-lg font-bold leading-tight">{step.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                            </li>
                        ))}
                    </ol>

                    <div data-reveal className="mt-10 flex flex-col gap-3 sm:flex-row">
                        <QuoteButton className={siteButton({variant: 'brand', size: 'lg'})}>
                            <CalendarCheck aria-hidden="true" />
                            {t('bookFreeHomeDemo')}
                        </QuoteButton>
                        {contact.whatsapp.configured && (
                            <a href={contact.whatsapp.href} {...externalLinkProps(contact.whatsapp)} className={siteButton({variant: 'whatsapp', size: 'lg'})}>
                                <WhatsAppIcon aria-hidden="true" className="text-[#25D366]" />
                                {t('whatsappUs')}
                            </a>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
                    <div data-reveal="image" className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-stage sm:col-span-2 lg:col-span-1">
                        <Image
                            src={DEMO_COPY.image.src}
                            alt={DEMO_COPY.image.alt}
                            fill
                            sizes="(min-width: 1024px) 36vw, 90vw"
                            className="object-contain"
                        />
                    </div>
                    <div data-reveal className="flex gap-4 rounded-xl border border-border bg-card p-5">
                        <BadgeCheck aria-hidden="true" className="size-6 shrink-0 text-logo-green-deep" />
                        <div>
                            <h3 className="font-display-wide text-lg font-bold leading-tight">{DEMO_COPY.tryTitle}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{DEMO_COPY.tryBody}</p>
                        </div>
                    </div>
                    <div data-reveal className="flex gap-4 rounded-xl border border-brand/25 bg-card p-5">
                        <Truck aria-hidden="true" className="size-6 shrink-0 text-brand" />
                        <div>
                            <h3 className="font-display-wide text-lg font-bold leading-tight">{DEMO_COPY.shippingTitle}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{DEMO_COPY.shippingBody}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
