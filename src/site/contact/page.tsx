import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {ArrowUpRight, Mail, MapPin, Phone} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {CONTACT_CONFIG, isPlaceholder} from '@/config/contact';
import {EnquiryForm} from '@/features/enquiry/enquiry-form';
import {getProductOptions} from '@/features/products/data';
import {PageHero} from '@/site/ui/page-hero';
import {siteButton} from '@/site/ui/button-styles';
import {CONTACT_DETAILS_ANCHOR, externalLinkProps, resolveContactLinks, type ContactLink} from '@/site/ui/contact-links';
import {WhatsAppIcon} from '@/site/ui/whatsapp-icon';
import {JsonLd} from '@/site/seo/json-ld';
import {breadcrumbSchema} from '@/site/seo/schemas';
import {marketingPageMetadata} from '@/site/seo/page-metadata';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'SiteMeta'});
    return marketingPageMetadata({locale, path: '/contact/', title: t('contactTitle'), description: t('contactDescription')});
}

interface ContactCard {
    key: string;
    icon: React.ReactNode;
    label: string;
    value: string;
    action?: string;
    link?: ContactLink;
}

function ContactCardItem({card, index}: {card: ContactCard; index: number}) {
    const body = (
        <>
            <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-lg border ${card.key === 'whatsapp' ? 'border-[#1c9e52]/20 bg-[#effaf3] text-[#1c9e52]' : 'border-border bg-surface text-brand'}`}
            >
                {card.icon}
            </span>
            <span className="min-w-0 flex-1">
                <span className="spec-label block text-steel">{card.label}</span>
                <span className="mt-1 block text-[15px] font-semibold break-words text-foreground">{card.value}</span>
                {card.link?.configured && card.action && (
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                        {card.action}
                        <ArrowUpRight aria-hidden="true" className="size-3.5 transition-transform group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
                    </span>
                )}
            </span>
        </>
    );
    const className = 'group/card flex h-full items-start gap-4 rounded-xl border border-border bg-card p-5 transition-[border-color,box-shadow,transform] duration-200';

    return (
        <li data-reveal style={{'--reveal-delay': `${60 * index}ms`} as React.CSSProperties}>
            {card.link?.configured ? (
                <a
                    href={card.link.href}
                    {...externalLinkProps(card.link)}
                    className={`${className} hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-[0_28px_50px_-34px_rgb(15_20_30/0.5)] focus-visible:ring-3 focus-visible:ring-brand/40 focus-visible:outline-none`}
                >
                    {body}
                </a>
            ) : (
                <div className={className}>{body}</div>
            )}
        </li>
    );
}

/**
 * /contact — contact cards (all values from CONTACT_CONFIG; `#contact-details`
 * is the fallback target for unconfigured CTAs site-wide) beside the enquiry
 * form (`#enquiry` — product pages link to `/contact?product=<slug>#enquiry`,
 * which the form reads after mount to pre-select the product).
 */
export default async function ContactPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});
    const tNav = await getTranslations({locale, namespace: 'Navigation'});
    const tFooter = await getTranslations({locale, namespace: 'Footer'});
    const tEnquiry = await getTranslations({locale, namespace: 'Enquiry'});
    const links = resolveContactLinks(locale, tNav('whatsappGreeting'));
    // Real Vendure products (build time); the picker is hidden when there are none.
    const products = await getProductOptions(locale);

    const hasAddress = !isPlaceholder(CONTACT_CONFIG.address);
    const mapsLink: ContactLink | undefined = hasAddress
        ? {href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_CONFIG.address)}`, external: true, configured: true}
        : undefined;

    const cards: ContactCard[] = [
        {key: 'phone', icon: <Phone aria-hidden="true" className="size-5" />, label: tFooter('phone'), value: CONTACT_CONFIG.phone, action: t('callNow'), link: links.phone},
        {key: 'whatsapp', icon: <WhatsAppIcon aria-hidden="true" className="size-5" />, label: 'WhatsApp', value: CONTACT_CONFIG.whatsapp, action: t('chatNow'), link: links.whatsapp},
        {key: 'email', icon: <Mail aria-hidden="true" className="size-5" />, label: tFooter('email'), value: CONTACT_CONFIG.email, action: t('emailNow'), link: links.email},
        {key: 'address', icon: <MapPin aria-hidden="true" className="size-5" />, label: tFooter('address'), value: CONTACT_CONFIG.address, action: t('openInMaps'), link: mapsLink},
    ];

    return (
        <>
            <JsonLd data={breadcrumbSchema([{name: tNav('home'), path: `/${locale}/`}, {name: tNav('contact'), path: `/${locale}/contact/`}])} />
            <PageHero
                title={t('contactTitle')}
                body={t('contactBody')}
                crumbs={[{label: tNav('home'), href: '/'}, {label: tNav('contact')}]}
            />

            <section id="contact" className="bg-background py-16 sm:py-20 lg:py-24">
                <div className="site-container grid gap-12 lg:grid-cols-12 lg:gap-14">
                    <div className="lg:col-span-5">
                        <div data-reveal>
                            <h2 className="font-display-wide text-2xl font-bold sm:text-3xl">{t('contactDirectTitle')}</h2>
                            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{t('contactDirectBody')}</p>
                        </div>
                        <ul id={CONTACT_DETAILS_ANCHOR} className="mt-8 grid scroll-mt-28 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                            {cards.map((card, index) => (
                                <ContactCardItem key={card.key} card={card} index={index} />
                            ))}
                        </ul>

                        {links.whatsapp.configured && (
                            <div data-reveal className="mt-8 rounded-xl border border-[#1c9e52]/20 bg-[#effaf3] p-6">
                                <div className="flex items-start gap-4">
                                    <WhatsAppIcon aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-[#1c9e52]" />
                                    <div className="min-w-0">
                                        <h3 className="text-lg font-bold text-[#0f4d2a]">{t('whatsappAltTitle')}</h3>
                                        <p className="mt-1.5 text-sm leading-relaxed text-[#0f4d2a]/80">{t('whatsappAltBody')}</p>
                                        <a
                                            href={links.whatsapp.href}
                                            {...externalLinkProps(links.whatsapp)}
                                            className={`mt-5 ${siteButton({variant: 'outline', size: 'md'})}`}
                                        >
                                            <WhatsAppIcon aria-hidden="true" className="text-[#1c9e52]" />
                                            {t('whatsappUs')}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div id="enquiry" data-reveal className="scroll-mt-28 lg:col-span-7">
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_30px_60px_-44px_rgb(15_20_30/0.45)] sm:p-10">
                            <h2 className="font-display-wide text-2xl font-bold sm:text-3xl">{t('recommendationTitle')}</h2>
                            <p className="mt-3 mb-8 text-[15px] leading-relaxed text-muted-foreground">{t('enquiryFormBody')}</p>
                            <EnquiryForm products={products} submitLabel={tEnquiry('submitRecommendation')} />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
