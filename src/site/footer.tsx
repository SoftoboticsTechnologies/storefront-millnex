import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {ArrowUpRight, ChevronRight, Mail, MapPin, Phone} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {getShopCategories} from '@/features/collections/data';
import {CONTACT_CONFIG, getSocialProfiles, isPlaceholder} from '@/config/contact';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {BRAND_LOGO} from '@/site/content/media';
import {FOOTER_COPY} from '@/site/content/home';
import {externalLinkProps, resolveContactLinks} from '@/site/ui/contact-links';
import {WhatsAppIcon} from '@/site/ui/whatsapp-icon';

const COPYRIGHT_YEAR = 2026;

// lucide-react ships no brand icons, so profiles render as labelled links.
const SOCIAL_LABELS = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    youtube: 'YouTube',
    linkedin: 'LinkedIn',
} as const;

function FooterHeading({children}: {children: React.ReactNode}) {
    return (
        <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white">
            <span aria-hidden="true" className="h-0.5 w-5 rounded-full bg-logo-orange" />
            {children}
        </p>
    );
}

/**
 * A footer link column: heading above divided rows. The frosted panel is the
 * single sheet behind the whole footer, so columns carry no background of their own.
 */
function FooterLinkPanel({title, links}: {title: string; links: Array<{href: string; label: string}>}) {
    return (
        <div className="flex flex-col lg:h-full">
            <FooterHeading>{title}</FooterHeading>
            <ul className="divide-y divide-white/10">
                {links.map((link) => (
                    <li key={link.href}>
                        <NavigationLink
                            href={link.href}
                            className="group/link flex items-center gap-2 py-2.5 text-sm font-medium text-white/90 transition-colors hover:text-white"
                        >
                            <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-logo-orange transition-transform group-hover/link:translate-x-0.5" />
                            <span className="min-w-0">{link.label}</span>
                        </NavigationLink>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export async function Footer() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Footer'});
    const tNav = await getTranslations({locale, namespace: 'Navigation'});
    const contact = resolveContactLinks(locale, tNav('whatsappGreeting'));
    const socials = getSocialProfiles();
    const categories = (await getShopCategories(locale)).slice(0, 6);

    // Address and WhatsApp get their own treatment in the contact panel.
    const directRows = [
        {icon: Phone, label: t('phone'), value: CONTACT_CONFIG.phone, link: contact.phone},
        {icon: Mail, label: t('email'), value: CONTACT_CONFIG.email, link: contact.email},
    ];

    return (
        <footer className="relative isolate mt-auto overflow-hidden footer-gradient text-white">
            <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-10 -z-10 size-[28rem] rounded-full bg-logo-blue/40 blur-[140px]" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-24 -z-10 size-[36rem] rounded-full bg-logo-orange/50 blur-[150px]" />

            {/* One full-width frosted-glass sheet over the whole footer gradient. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-black/20 backdrop-blur-sm" />

            <div className="site-container relative pt-8 pb-10 lg:pt-10">
                <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-12 lg:gap-6">
                    <div className="col-span-2 flex flex-col md:col-span-3 lg:col-span-3 lg:row-span-2">
                        <div className="flex flex-1 flex-col">
                            <NavigationLink href="/" className="block w-fit">
                                <Image src={BRAND_LOGO.src} alt={tNav('logoAlt')} width={BRAND_LOGO.width} height={BRAND_LOGO.height} className="h-20 w-auto drop-shadow-[0_12px_24px_rgb(0_0_0/0.35)] lg:h-24" />
                            </NavigationLink>
                            <p className="mt-4 text-sm leading-relaxed text-white/90">{FOOTER_COPY.description}</p>
                            <p className="mt-4 border-l-2 border-logo-orange pl-3 text-sm font-bold leading-snug text-white sm:text-base">{FOOTER_COPY.tagline}</p>
                            {socials.length > 0 && (
                                <ul className="mt-4 flex flex-wrap gap-2">
                                    {socials.map(({network, url}) => (
                                        <li key={network}>
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-white/20">
                                                {SOCIAL_LABELS[network]}
                                                <ArrowUpRight className="size-3.5" />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <FooterLinkPanel
                            title={t('shop')}
                            links={[
                                {href: '/shop/', label: t('allProducts')},
                                ...categories.map((category) => ({href: `/collection/${category.slug}/`, label: category.name.trim()})),
                            ]}
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <FooterLinkPanel
                            title={t('customer')}
                            links={[
                                {href: '/account/', label: t('myAccount')},
                                {href: '/account/orders/', label: t('myOrders')},
                                {href: '/wishlist/', label: tNav('wishlist')},
                                {href: '/cart/', label: t('cart')},
                                {href: '/sign-in/', label: t('signIn')},
                            ]}
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1 lg:col-span-2">
                        <FooterLinkPanel
                            title={t('company')}
                            links={[
                                {href: '/about/', label: tNav('about')},
                                {href: '/insights/', label: tNav('insights')},
                                {href: '/faq/', label: tNav('faq')},
                                {href: '/contact/', label: tNav('contact')},
                            ]}
                        />
                    </div>

                    <div className="col-span-2 flex flex-col md:col-span-3 lg:col-span-3 lg:row-span-2">
                        <FooterHeading>{t('contact')}</FooterHeading>
                        <div className="flex flex-1 flex-col">
                            <div className="flex gap-3 pb-3">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-logo-orange/90">
                                    <MapPin aria-hidden="true" className="size-4 text-white" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/75">{t('address')}</p>
                                    <address className="mt-0.5 text-sm leading-relaxed not-italic text-white">{CONTACT_CONFIG.address}</address>
                                </div>
                            </div>
                            <ul className="divide-y divide-white/10 border-t border-white/10">
                                {directRows.map(({icon: Icon, label, value, link}) => {
                                    const body = (
                                        <>
                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 transition-colors group-hover/row:bg-white/25">
                                                <Icon aria-hidden="true" className="size-4 text-white" />
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block text-[11px] font-bold uppercase tracking-wider text-white/75">{label}</span>
                                                <span className="block text-sm font-semibold break-words text-white">{value}</span>
                                            </span>
                                            {link?.configured && <ArrowUpRight aria-hidden="true" className="ml-auto size-4 shrink-0 text-white/60 transition-transform group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5 group-hover/row:text-white" />}
                                        </>
                                    );
                                    return (
                                        <li key={label}>
                                            {link?.configured ? (
                                                <a href={link.href} {...externalLinkProps(link)} className="group/row flex items-center gap-3 py-3">{body}</a>
                                            ) : (
                                                <div className="flex items-center gap-3 py-3">{body}</div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                            {/* WhatsApp as the primary action. #128C4B keeps white text above 4.5:1. */}
                            <div className="mt-auto border-t border-white/10 pt-3">
                                {contact.whatsapp.configured ? (
                                    <a
                                        href={contact.whatsapp.href}
                                        {...externalLinkProps(contact.whatsapp)}
                                        className="flex items-center gap-3 rounded-xl bg-[#128C4B] px-4 py-3 text-white shadow-[0_12px_28px_-16px_rgb(0_0_0/0.7)] transition-colors hover:bg-[#0f7a41]"
                                    >
                                        <WhatsAppIcon aria-hidden="true" className="size-5 shrink-0" />
                                        {/* No visible label (the icon says WhatsApp); kept for screen readers. */}
                                        <span className="min-w-0 text-sm font-bold sm:text-base">
                                            <span className="sr-only">WhatsApp </span>
                                            {CONTACT_CONFIG.whatsapp}
                                        </span>
                                        <ArrowUpRight aria-hidden="true" className="ml-auto size-4 shrink-0" />
                                    </a>
                                ) : (
                                    <p className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm text-white">
                                        <WhatsAppIcon aria-hidden="true" className="size-5 shrink-0" />
                                        {CONTACT_CONFIG.whatsapp}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Marketing credit: directly under the link panels, spanning their full width, from lg up; last on smaller screens. */}
                    {!isPlaceholder(CONTACT_CONFIG.marketedBy) && (
                        <p className="col-span-2 md:col-span-3 lg:col-span-6 lg:col-start-4 lg:row-start-2 lg:self-start">
                            <span className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-white/10 pt-4 text-center text-sm font-bold text-white sm:text-base">
                                {t('marketedBy')}
                                <span className="font-extrabold">{CONTACT_CONFIG.marketedBy}</span>
                            </span>
                        </p>
                    )}
                </div>
            </div>

            {/* Bottom bar: copyright, marketing credit, agency credit. */}
            <div className="relative border-t border-white/15 bg-black/30">
                <div className="site-container flex flex-col items-center gap-3 py-4 text-center text-xs text-white/90 sm:flex-row sm:justify-between sm:text-left sm:text-[13px]">
                    <p>&copy; {COPYRIGHT_YEAR} {t('copyright')}</p>
                    <a
                        href="https://dripfunnel.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t('poweredByDripFunnel')}
                        className="flex items-center gap-2.5 font-semibold text-white transition-opacity hover:opacity-80 sm:border-l sm:border-white/20 sm:pl-4"
                    >
                        <span aria-hidden="true">{t('poweredBy')}</span>
                        <Image src="/logo/dripfunnel-logo-white.png" alt="" width={2077} height={369} className="h-5 w-auto" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
