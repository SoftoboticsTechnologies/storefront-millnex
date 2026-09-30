import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {ArrowUpRight, ChevronDown, Globe, Mail, MapPin, Phone} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {getShopCategories} from '@/features/collections/data';
import {QuoteButton} from '@/features/enquiry/quote-dialog';
import {CONTACT_CONFIG, getSocialProfiles, isPlaceholder} from '@/config/contact';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {BRAND_LOGO, WEBSITE_QR} from '@/site/content/media';
import {FOOTER_COPY} from '@/site/content/home';
import {siteButton} from '@/site/ui/button-styles';
import {externalLinkProps, resolveContactLinks, type ContactLink} from '@/site/ui/contact-links';
import {WhatsAppIcon} from '@/site/ui/whatsapp-icon';
import {IsoBadge} from '@/site/ui/iso-badge';
import {cn} from '@/lib/utils';

const COPYRIGHT_YEAR = 2026;

// lucide-react ships no brand icons, so profiles render as labelled links.
// Only profiles configured in CONTACT_CONFIG.social (i.e. that really exist) render.
const SOCIAL_LABELS = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    youtube: 'YouTube',
    linkedin: 'LinkedIn',
} as const;

type FooterLinks = Array<{href: string; label: string}>;

function FooterLinkList({links, className}: {links: FooterLinks; className?: string}) {
    return (
        <ul className={cn('space-y-3', className)}>
            {links.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                    <NavigationLink
                        href={link.href}
                        className="group/link inline-flex items-center gap-1.5 text-[15px] text-foreground transition-colors hover:text-brand"
                    >
                        <span className="relative">
                            {link.label}
                            <span aria-hidden="true" className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-brand transition-transform duration-300 group-hover/link:scale-x-100" />
                        </span>
                    </NavigationLink>
                </li>
            ))}
        </ul>
    );
}

/** md+: a plain titled column. */
function FooterColumn({title, links}: {title: string; links: FooterLinks}) {
    return (
        <div>
            <p className="spec-label mb-5 text-muted-foreground">{title}</p>
            <FooterLinkList links={links} />
        </div>
    );
}

/**
 * < md: the same links as a native disclosure (no JS), so three link groups
 * don't stack into one long column on phones.
 */
function FooterAccordionItem({title, links, open}: {title: string; links: FooterLinks; open?: boolean}) {
    return (
        <details open={open} className="group/acc border-b border-border">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
                {title}
                <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open/acc:rotate-180" />
            </summary>
            <FooterLinkList links={links} className="pb-5" />
        </details>
    );
}

function ContactRow({icon, label, value, link, whatsapp}: {icon: React.ReactNode; label: string; value: string; link?: ContactLink; whatsapp?: boolean}) {
    const body = (
        <>
            <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg border', whatsapp ? 'border-[#1c9e52]/20 bg-[#effaf3] text-[#1c9e52]' : 'border-border bg-card text-brand')}>{icon}</span>
            <span className="min-w-0">
                <span className="spec-label block text-muted-foreground">{label}</span>
                <span className="mt-0.5 block text-sm font-semibold text-foreground [overflow-wrap:anywhere] sm:whitespace-nowrap lg:whitespace-normal xl:whitespace-nowrap">{value}</span>
            </span>
            {link?.configured && <ArrowUpRight aria-hidden="true" className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5 group-hover/row:text-brand" />}
        </>
    );
    return link?.configured ? (
        <a href={link.href} {...externalLinkProps(link)} className="group/row flex items-center gap-3">{body}</a>
    ) : (
        <div className="flex items-center gap-3">{body}</div>
    );
}

/**
 * Graphite site footer: a closing CTA band (quote modal + WhatsApp), brand
 * column, Shop (real Vendure categories) / Company / Customer link columns,
 * contact rows from CONTACT_CONFIG, and the credit bar.
 */
export async function Footer() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Footer'});
    const tNav = await getTranslations({locale, namespace: 'Navigation'});
    const contact = resolveContactLinks(locale, tNav('whatsappGreeting'));
    const socials = getSocialProfiles();
    const categories = (await getShopCategories(locale)).slice(0, 5);

    const linkGroups: Array<{key: string; title: string; links: FooterLinks}> = [
        {
            key: 'shop',
            title: t('shop'),
            links: [
                {href: '/shop/', label: t('allProducts')},
                ...categories.map((category) => ({href: `/collection/${category.slug}/`, label: category.name.trim()})),
                {href: '/compare/', label: tNav('compare')},
            ],
        },
        {
            key: 'company',
            title: t('company'),
            links: [
                {href: '/about/', label: tNav('about')},
                {href: '/manufacturing/', label: tNav('manufacturing')},
                {href: '/insights/', label: tNav('insights')},
                {href: '/faq/', label: tNav('faq')},
                {href: '/contact/', label: tNav('contact')},
            ],
        },
        {
            key: 'customer',
            title: t('customer'),
            links: [
                {href: '/account/', label: t('myAccount')},
                {href: '/account/orders/', label: t('myOrders')},
                {href: '/wishlist/', label: tNav('wishlist')},
                {href: '/cart/', label: t('cart')},
                {href: '/contact/', label: t('support')},
            ],
        },
    ];

    // Marketing credit, under the link columns (md+) / the link disclosures (phones).
    const marketedBy = (
        <div className="mt-6 flex flex-col items-center text-center md:mt-10 md:border-t md:border-border md:pt-5">
            {!isPlaceholder(CONTACT_CONFIG.marketedBy) && (
                <p className="text-sm text-muted-foreground">
                    {t('marketedBy')} <span className="font-semibold text-foreground">{CONTACT_CONFIG.marketedBy}</span>
                </p>
            )}
        </div>
    );

    return (
        <footer className="relative isolate mt-auto overflow-hidden border-t border-border bg-tint-sheen text-foreground">
            <div aria-hidden="true" className="absolute -right-40 -top-40 -z-10 size-[36rem] rounded-full bg-logo-blue/10 blur-[160px]" />

            {/* Top band: brand (left) and the closing CTA (right). */}
            <div className="site-container">
                <div className="grid gap-10 border-b border-border pb-8 pt-14 lg:grid-cols-12 lg:gap-12 lg:pb-10 lg:pt-16">
                    <div className="lg:col-span-4">
                        <NavigationLink href="/" className="inline-block rounded-md">
                            <Image src={BRAND_LOGO.src} alt={tNav('logoAlt')} width={BRAND_LOGO.width} height={BRAND_LOGO.height} className="h-16 w-auto lg:h-20" />
                        </NavigationLink>
                        <IsoBadge className="mt-4 flex w-fit" />
                        <p className="mt-6 font-display-wide text-lg font-bold leading-snug">{FOOTER_COPY.tagline}</p>
                        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{FOOTER_COPY.description}</p>
                        {socials.length > 0 && (
                            <ul className="mt-6 flex flex-wrap gap-2">
                                {socials.map(({network, url}) => (
                                    <li key={network}>
                                        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-xs font-semibold transition-colors hover:border-foreground/30">
                                            {SOCIAL_LABELS[network]}
                                            <ArrowUpRight aria-hidden="true" className="size-3.5" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="flex flex-col justify-center gap-8 lg:col-span-8 lg:border-l lg:border-border lg:pl-12">
                        <div className="max-w-2xl">
                            <p className="font-display-wide text-3xl font-bold leading-[1.05] sm:text-4xl lg:text-5xl">{t('ctaTitle')}</p>
                            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">{t('ctaBody')}</p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <QuoteButton className={siteButton({variant: 'brand', size: 'lg'})} />
                            {contact.whatsapp.configured && (
                                <a href={contact.whatsapp.href} {...externalLinkProps(contact.whatsapp)} className={siteButton({variant: 'whatsapp', size: 'lg'})}>
                                    <WhatsAppIcon aria-hidden="true" className="text-[#25D366]" />
                                    {t('whatsapp')}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="site-container pb-4 pt-8 lg:pb-6 lg:pt-10">
                <div className="grid gap-x-6 gap-y-10 md:grid-cols-2 md:gap-y-12 lg:grid-cols-12 lg:gap-8">
                    {/* Left: phone, WhatsApp, address. */}
                    <div className="lg:col-span-3">
                        <p className="spec-label mb-5 text-muted-foreground">{t('contact')}</p>
                        <div className="grid gap-5">
                            <ContactRow icon={<Phone aria-hidden="true" className="size-4" />} label={t('phone')} value={CONTACT_CONFIG.phone} link={contact.phone} />
                            <ContactRow icon={<WhatsAppIcon aria-hidden="true" className="size-4" />} label={t('whatsapp')} value={CONTACT_CONFIG.whatsapp} link={contact.whatsapp} whatsapp />
                            <div className="flex gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-brand">
                                    <MapPin aria-hidden="true" className="size-4" />
                                </span>
                                <span className="min-w-0">
                                    <span className="spec-label block text-muted-foreground">{t('address')}</span>
                                    <address className="mt-0.5 text-sm leading-relaxed not-italic text-foreground">{CONTACT_CONFIG.address}</address>
                                </span>
                            </div>
                            <QuoteButton className={cn(siteButton({variant: 'brand', size: 'md'}), 'w-full sm:w-auto sm:justify-self-start')} />
                        </div>
                    </div>

                    {/* Middle — phones: one disclosure per link group (Shop open). */}
                    <div className="md:hidden">
                        <div className="border-t border-border">
                            {linkGroups.map((group, index) => (
                                <FooterAccordionItem key={group.key} title={group.title} links={group.links} open={index === 0} />
                            ))}
                        </div>
                        {marketedBy}
                    </div>
                    {/* Middle — md+: titled columns, with the marketing credit under them (full row on tablets). */}
                    <div className="hidden md:col-span-2 md:row-start-1 md:block lg:col-span-6 lg:row-start-auto">
                        <div className="grid grid-cols-3 gap-x-6 lg:gap-x-8">
                            {linkGroups.map((group) => (
                                <FooterColumn key={group.key} title={group.title} links={group.links} />
                            ))}
                        </div>
                        {marketedBy}
                    </div>

                    {/* Right: website QR, website, email(s) — centred. */}
                    <div className="flex flex-col items-center lg:col-span-3">
                        {!isPlaceholder(CONTACT_CONFIG.website) && (
                            <a href={contact.website.href} {...externalLinkProps(contact.website)} className="inline-block rounded-xl border border-border bg-white p-2 shadow-sm transition-shadow hover:shadow-md">
                                <Image src={WEBSITE_QR.src} alt={WEBSITE_QR.alt} width={WEBSITE_QR.width} height={WEBSITE_QR.height} className="size-36" />
                            </a>
                        )}
                        <div className="mt-4 grid w-fit max-w-full gap-3.5">
                            {!isPlaceholder(CONTACT_CONFIG.website) && (
                                <ContactRow icon={<Globe aria-hidden="true" className="size-4" />} label={t('website')} value={CONTACT_CONFIG.website} link={contact.website} />
                            )}
                            <ContactRow icon={<Mail aria-hidden="true" className="size-4" />} label={t('email')} value={CONTACT_CONFIG.email} link={contact.email} />
                            {!isPlaceholder(CONTACT_CONFIG.secondaryEmail) && (
                                <ContactRow icon={<Mail aria-hidden="true" className="size-4" />} label={t('email')} value={CONTACT_CONFIG.secondaryEmail} link={contact.secondaryEmail} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-border">
                <div className="site-container flex flex-col gap-4 pb-24 pt-6 text-[13px] text-muted-foreground lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:py-6">
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
                        <p>&copy; {COPYRIGHT_YEAR} {t('copyright')}</p>
                        <p className="font-semibold text-foreground">{t('isoCompany')}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 lg:mr-16 lg:shrink-0 lg:flex-nowrap lg:justify-start">
                        <a
                            href="https://dripfunnel.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t('poweredByDripFunnel')}
                            className="flex items-center gap-2.5 font-semibold text-foreground transition-opacity hover:opacity-80"
                        >
                            <span aria-hidden="true">{t('poweredBy')}</span>
                            <Image src="/logo/dripfunnel-logo.png" alt="" width={845} height={143} className="h-5 w-auto" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
