import {getTranslations} from 'next-intl/server';
import {Mail, MapPin, Phone} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {CONTACT_CONFIG} from '@/config/contact';
import {EnquiryForm} from '@/features/enquiry/enquiry-form';
import {CONTACT_COPY} from '@/site/content/home';
import {getProductOptions} from '@/features/products/data';
import {SectionHeading} from '@/site/ui/section-heading';
import {CONTACT_DETAILS_ANCHOR, externalLinkProps, resolveContactLinks, type ContactLink} from '@/site/ui/contact-links';
import {WhatsAppIcon} from '@/site/ui/whatsapp-icon';

/** `showHeading={false}` where a PageHero above already carries the same heading (contact page). */
export async function ContactSection({headingLevel = 'h2', showHeading = true}: {headingLevel?: 'h1' | 'h2'; showHeading?: boolean}) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});
    const tFooter = await getTranslations({locale, namespace: 'Footer'});
    const tNav = await getTranslations({locale, namespace: 'Navigation'});
    const links = resolveContactLinks(locale, tNav('whatsappGreeting'));

    const details: Array<{icon: typeof MapPin; label: string; value: string; action?: {label: string; link: ContactLink}}> = [
        {icon: Phone, label: tFooter('phone'), value: CONTACT_CONFIG.phone, action: {label: t('callNow'), link: links.phone}},
        {icon: WhatsAppIcon as typeof MapPin, label: 'WhatsApp', value: CONTACT_CONFIG.whatsapp, action: {label: t('chatNow'), link: links.whatsapp}},
        {icon: Mail, label: tFooter('email'), value: CONTACT_CONFIG.email, action: {label: t('emailNow'), link: links.email}},
        {icon: MapPin, label: tFooter('address'), value: CONTACT_CONFIG.address},
    ];

    // Real Vendure products (build time); the picker is hidden when there are none.
    const products = await getProductOptions(locale);

    return (
        <section id="contact" className={showHeading ? 'bg-surface py-24 lg:py-32' : 'bg-surface py-12 lg:py-20'}>
            <div className="site-container grid gap-12 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-5">
                    {showHeading && <SectionHeading as={headingLevel} eyebrow={CONTACT_COPY.eyebrow} title={CONTACT_COPY.title} body={CONTACT_COPY.body} />}
                    <ul id={CONTACT_DETAILS_ANCHOR} className={`grid scroll-mt-24 gap-3 sm:grid-cols-2 lg:grid-cols-1 ${showHeading ? 'mt-10' : ''}`}>
                        {details.map(({icon: Icon, label, value, action}) => (
                            <li key={label} data-reveal className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                                {/* WhatsApp keeps its brand green; other channels use the site accent. */}
                                <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${label === 'WhatsApp' ? 'bg-[#25D366]/12 text-[#1c9e52]' : 'bg-surface text-brand'}`}>
                                    <Icon className="size-5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                                    <p className="mt-0.5 break-words text-sm font-bold">{value}</p>
                                </div>
                                {action?.link.configured && (
                                    <a
                                        href={action.link.href}
                                        {...externalLinkProps(action.link)}
                                        className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-bold transition-colors hover:border-brand/40 hover:text-brand"
                                    >
                                        {action.label}
                                    </a>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div id="enquiry" data-reveal className="scroll-mt-24 lg:col-span-7">
                    <div className="rounded-3xl border border-border bg-card p-6 shadow-[0_30px_60px_-40px_rgb(0_0_0/0.3)] sm:p-10">
                        <h3 className="text-2xl font-extrabold">{t('enquiryFormTitle')}</h3>
                        <p className="mt-2 mb-8 text-sm text-muted-foreground">{t('enquiryFormBody')}</p>
                        <EnquiryForm products={products} />
                    </div>
                </div>
            </div>
        </section>
    );
}
