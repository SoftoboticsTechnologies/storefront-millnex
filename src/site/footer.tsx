import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {ArrowRight, ArrowUpRight, ChevronDown, Mail, MapPin, Phone} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
// Hidden 2026-10-08 — category links are no longer listed in the footer:
// import {getShopCategories} from '@/features/collections/data';
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

/** Logo colour per link group — the small bar beside each column title. */
const GROUP_ACCENTS = ['bg-logo-blue', 'bg-logo-green', 'bg-logo-orange'] as const;

function FooterLinkList({links, className}: {links: FooterLinks; className?: string}) {
    return (
        <ul className={cn('space-y-2.5', className)}>
            {links.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                    <NavigationLink
                        href={link.href}
                        className="group/link inline-flex items-center text-[15px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowRight aria-hidden="true" className="mr-0 size-3.5 w-0 text-brand opacity-0 transition-all duration-200 group-hover/link:mr-1.5 group-hover/link:w-3.5 group-hover/link:opacity-100" />
                        {link.label}
                    </NavigationLink>
                </li>
            ))}
        </ul>
    );
}

function GroupTitle({title, accent}: {title: string; accent: string}) {
    return (
        <span className="flex items-center gap-2.5">
            <span aria-hidden="true" className={cn('h-4 w-1 rounded-full', accent)} />
            {title}
        </span>
    );
}

/** md+: a titled column with a logo-colour accent bar. */
function FooterColumn({title, links, accent}: {title: string; links: FooterLinks; accent: string}) {
    return (
        <div>
            <p className="mb-5 text-[15px] font-bold text-foreground">
                <GroupTitle title={title} accent={accent} />
            </p>
            <FooterLinkList links={links} />
        </div>
    );
}

/**
 * < md: the same links as a native disclosure (no JS), so three link groups
 * don't stack into one long column on phones.
 */
function FooterAccordionItem({title, links, accent, open}: {title: string; links: FooterLinks; accent: string; open?: boolean}) {
    return (
        <details open={open} className="group/acc border-b border-border last:border-b-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-bold [&::-webkit-details-marker]:hidden">
                <GroupTitle title={title} accent={accent} />
                <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open/acc:rotate-180" />
            </summary>
            <FooterLinkList links={links} className="pb-5 pl-3.5" />
        </details>
    );
}

function ContactRow({icon, tone, label, value, link}: {icon: React.ReactNode; tone: string; label: string; value: React.ReactNode; link?: ContactLink}) {
    const body = (
        <>
            <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', tone)}>{icon}</span>
            <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-muted-foreground">{label}</span>
                <span className="mt-0.5 block text-sm font-semibold leading-relaxed text-foreground [overflow-wrap:anywhere]">{value}</span>
            </span>
        </>
    );
    return link?.configured ? (
        <a href={link.href} {...externalLinkProps(link)} className="group/row -mx-2 flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-muted/60">
            {body}
            <ArrowUpRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5 group-hover/row:text-brand" />
        </a>
    ) : (
        <div className="-mx-2 flex items-start gap-3 p-2">{body}</div>
    );
}

/** Email cell: one icon/label, each configured address on its own line. */
function EmailRow({label, emails}: {label: string; emails: Array<{value: string; link: ContactLink}>}) {
    return (
        <div className="-mx-2 flex items-start gap-3 p-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tint-orange text-logo-orange-deep">
                <Mail aria-hidden="true" className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-muted-foreground">{label}</span>
                {emails.map(({value, link}) => link.configured ? (
                    <a key={value} href={link.href} {...externalLinkProps(link)} className="mt-0.5 block text-sm font-semibold leading-relaxed text-foreground transition-colors [overflow-wrap:anywhere] hover:text-brand">{value}</a>
                ) : (
                    <span key={value} className="mt-0.5 block text-sm font-semibold leading-relaxed text-foreground [overflow-wrap:anywhere]">{value}</span>
                ))}
            </span>
        </div>
    );
}

/**
 * Site footer (redesigned 2026-10-08): logo-colour stripe, a closing CTA card
 * (quote modal + WhatsApp), then brand column · Shop (Home, Atta Chakki,
 * compare) / Company / Customer link columns · contact card (CONTACT_CONFIG
 * rows + website QR), and the credit bar (copyright, ISO, marketing credit,
 * DripFunnel). The "Website" row was removed at client request; the QR still
 * links to the site.
 */
export async function Footer() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Footer'});
    const tNav = await getTranslations({locale, namespace: 'Navigation'});
    const contact = resolveContactLinks(locale, tNav('whatsappGreeting'));
    const socials = getSocialProfiles();
    // Hidden 2026-10-08 (Atta Chakki focus): the Shop column listed every Vendure
    // category (incl. Grinding Machines & Cutters) and "Compare machines".
    // const categories = (await getShopCategories(locale)).slice(0, 5);
    // links: [
    //     {href: '/shop/', label: t('allProducts')},
    //     ...categories.map((category) => ({href: `/collection/${category.slug}/`, label: category.name.trim()})),
    //     {href: '/compare/', label: tNav('compare')},
    // ],

    const linkGroups: Array<{key: string; title: string; links: FooterLinks}> = [
        {
            key: 'shop',
            title: t('shop'),
            links: [
                {href: '/', label: tNav('home')},
                {href: '/shop/', label: tNav('attaChakki')},
                {href: '/compare/', label: tNav('compareModels')},
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

    return (
        <>
            {/* Closing CTA band (2026-10-08): its own full-width section above the
                footer on every page — previously a rounded card inside the footer.
                `mt-auto` moved here from <footer> so short pages still push both down. */}
            <section aria-label={t('ctaTitle')} className="relative isolate mt-auto overflow-hidden border-t border-border bg-tint-sheen">
                <div aria-hidden="true" className="absolute -right-24 -top-24 -z-10 size-96 rounded-full bg-logo-orange/15 blur-3xl" />
                <div aria-hidden="true" className="absolute -bottom-32 left-1/3 -z-10 size-80 rounded-full bg-logo-blue/10 blur-3xl" />
                <div className="site-container py-10 sm:py-12 lg:py-14">
                    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
                        <div className="max-w-2xl">
                            <p className="font-display-wide text-3xl font-bold leading-[1.05] sm:text-4xl">{t('ctaTitle')}</p>
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
            </section>

            <footer className="relative isolate overflow-hidden border-t border-border bg-surface text-foreground">
                {/* Logo-colour stripe. */}
                <div aria-hidden="true" className="flex h-1">
                    <span className="flex-1 bg-logo-blue" />
                    <span className="flex-1 bg-logo-green" />
                    <span className="flex-1 bg-logo-orange" />
                </div>

                <div className="site-container py-12 lg:py-16">
                    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
                        {/* Brand. */}
                        <div className="lg:col-span-5">
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
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-semibold transition-colors hover:border-foreground/30">
                                                {SOCIAL_LABELS[network]}
                                                <ArrowUpRight aria-hidden="true" className="size-3.5" />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Links — phones: one disclosure per group (Shop open). */}
                        <div className="rounded-2xl border border-border bg-card px-5 md:hidden">
                            {linkGroups.map((group, index) => (
                                <FooterAccordionItem key={group.key} title={group.title} links={group.links} accent={GROUP_ACCENTS[index % GROUP_ACCENTS.length]} open={index === 0} />
                            ))}
                        </div>
                        {/* Links — md+: titled columns. */}
                        <div className="hidden md:block lg:col-span-7 lg:pt-2">
                            <div className="grid grid-cols-3 gap-x-6">
                                {linkGroups.map((group, index) => (
                                    <FooterColumn key={group.key} title={group.title} links={group.links} accent={GROUP_ACCENTS[index % GROUP_ACCENTS.length]} />
                                ))}
                            </div>
                        </div>

                        {/* Contact strip (full width): phone, WhatsApp, email(s), address, website QR + quote. */}
                        <div className="md:col-span-2 lg:col-span-12">
                            <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-[0_18px_40px_-30px_rgb(0_0_0/0.35)] sm:p-6 lg:flex-row lg:items-center lg:gap-8">
                                <div className="min-w-0 flex-1">
                                    <p className="mb-3 text-[15px] font-bold">
                                        <GroupTitle title={t('contact')} accent="bg-brand" />
                                    </p>
                                    <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                                        <ContactRow icon={<Phone aria-hidden="true" className="size-4" />} tone="bg-tint-blue text-logo-blue-deep" label={t('phone')} value={CONTACT_CONFIG.phone} link={contact.phone} />
                                        <ContactRow icon={<WhatsAppIcon aria-hidden="true" className="size-4" />} tone="bg-[#effaf3] text-[#1c9e52]" label={t('whatsapp')} value={CONTACT_CONFIG.whatsapp} link={contact.whatsapp} />
                                        <EmailRow label={t('email')} emails={[
                                            {value: CONTACT_CONFIG.email, link: contact.email},
                                            ...(!isPlaceholder(CONTACT_CONFIG.secondaryEmail) ? [{value: CONTACT_CONFIG.secondaryEmail, link: contact.secondaryEmail}] : []),
                                        ]} />
                                        <ContactRow
                                            icon={<MapPin aria-hidden="true" className="size-4" />}
                                            tone="bg-tint-green text-logo-green-deep"
                                            label={t('address')}
                                            value={<address className="font-normal not-italic">{CONTACT_CONFIG.address}</address>}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 border-t border-border pt-4 lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                                    {!isPlaceholder(CONTACT_CONFIG.website) && (
                                        <a href={contact.website.href} {...externalLinkProps(contact.website)} className="shrink-0 rounded-xl border border-border bg-white p-1.5 transition-shadow hover:shadow-md">
                                            <Image src={WEBSITE_QR.src} alt={WEBSITE_QR.alt} width={WEBSITE_QR.width} height={WEBSITE_QR.height} className="size-20" />
                                        </a>
                                    )}
                                    <QuoteButton className={cn(siteButton({variant: 'brand', size: 'md'}), 'flex-1 sm:flex-none')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Credit bar: one line from xl (client request) — 12px text, tight gaps, and right padding that keeps it clear of the
                    WhatsApp / back-to-top floats; below xl the lines stack, centred and narrow enough to stay clear of the floats. */}
                <div className="border-t border-border bg-card/70">
                    <div className="site-container flex flex-col items-center gap-3 pb-24 pt-6 text-center text-[13px] text-muted-foreground lg:pb-8 xl:flex-row xl:justify-center xl:gap-x-3.5 xl:pr-20 xl:text-xs xl:whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-4 xl:flex-nowrap xl:gap-x-3.5">
                            <p>&copy; {COPYRIGHT_YEAR} {t('copyright')}</p>
                            <span aria-hidden="true" className="hidden size-1 rounded-full bg-muted-foreground/40 sm:block" />
                            <p className="font-semibold text-foreground">{t('isoCompany')}</p>
                        </div>
                        <span aria-hidden="true" className="hidden h-5 w-px bg-foreground/25 xl:block" />
                        <div className="flex flex-col items-center justify-center gap-2.5 xl:flex-row xl:gap-x-3.5">
                            {!isPlaceholder(CONTACT_CONFIG.marketedBy) && (
                                <>
                                    <p>
                                        {t('marketedBy')} <span className="font-semibold text-foreground">{CONTACT_CONFIG.marketedBy}</span>
                                    </p>
                                    <span aria-hidden="true" className="hidden h-5 w-px bg-foreground/25 xl:block" />
                                </>
                            )}
                            <a
                                href="https://dripfunnel.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={t('poweredByDripFunnel')}
                                className="flex items-center gap-2.5 font-semibold text-foreground transition-opacity hover:opacity-80"
                            >
                                <span aria-hidden="true">{t('poweredBy')}</span>
                                <Image src="/logo/dripfunnel-logo.png" alt="" width={845} height={143} className="h-5 w-auto xl:h-[18px]" />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
