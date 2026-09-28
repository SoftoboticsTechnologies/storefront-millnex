import {getEmailHref, getPhoneHref, getWhatsAppUrl} from '@/config/contact';

export interface ContactLink {
    href: string;
    /** True for wa.me links (open in a new tab); false for tel:/mailto:/internal links. */
    external: boolean;
    /** False while the underlying CONTACT_CONFIG value is still a placeholder. */
    configured: boolean;
}

/** Anchor on the contact page that lists every contact detail. */
export const CONTACT_DETAILS_ANCHOR = 'contact-details';

/**
 * Resolves WhatsApp / phone / email CTAs from CONTACT_CONFIG. While a value
 * is still a placeholder, its CTA falls back to the contact page's details
 * block instead of rendering a broken tel:/wa.me link, so layouts stay
 * complete and no link is ever dead.
 */
export function resolveContactLinks(locale: string, whatsappMessage?: string) {
    const fallback = `/${locale}/contact/#${CONTACT_DETAILS_ANCHOR}`;
    const whatsapp = getWhatsAppUrl(whatsappMessage);
    const phone = getPhoneHref();
    const email = getEmailHref();

    return {
        whatsapp: {href: whatsapp ?? fallback, external: whatsapp !== null, configured: whatsapp !== null},
        phone: {href: phone ?? fallback, external: false, configured: phone !== null},
        email: {href: email ?? fallback, external: false, configured: email !== null},
    } satisfies Record<string, ContactLink>;
}

export function externalLinkProps(link: ContactLink) {
    return link.external ? {target: '_blank', rel: 'noopener noreferrer'} : {};
}
