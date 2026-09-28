/**
 * Single source of truth for Millnex contact details.
 *
 * Every phone link, WhatsApp link, email link, address block, footer column,
 * JSON-LD Organization entry and floating WhatsApp button reads from here —
 * edit these values once and the whole site updates.
 *
 * Values wrapped in square brackets (e.g. "[YOUR PHONE NUMBER]") are
 * placeholders. While a value is still a placeholder it is shown as-is in
 * the UI but never turned into a tel:/wa.me/mailto: link, and it is left out
 * of structured data — so an unconfigured site never ships a broken link.
 *
 * Formats:
 * - phone:    human-readable, e.g. "+91 98765 43210" (digits are extracted for tel:)
 * - whatsapp: international number, digits only or formatted, e.g. "919876543210"
 *             (country code required; wa.me rejects local-format numbers)
 * - email:    plain address
 */
export const CONTACT_CONFIG = {
    companyName: 'Millnex',
    address: 'Gokul Industries Area Plot No-3/1, Dist. Rajkot, Gujarat 360004',
    phone: '+91 92716 30646',
    whatsapp: '+91 92716 30646',
    email: 'info@millnex.in',
    /** Promotion & marketing partner, credited in the footer and on /about. */
    marketedBy: 'Swarnim Enterprises, Maharashtra',
    /**
     * Where the enquiry form POSTs its JSON payload. This storefront is a
     * static export with no server of its own, so enquiries need an external
     * receiver (a form service, a serverless function, a CRM webhook).
     * When unset, the form hands the enquiry off to WhatsApp (or email)
     * instead — see features/enquiry/submit-enquiry.ts.
     */
    enquiryEndpoint: process.env.NEXT_PUBLIC_ENQUIRY_ENDPOINT ?? '',
    /** Only list profiles that actually exist. Empty strings are skipped. */
    social: {
        facebook: '',
        instagram: '',
        youtube: '',
        linkedin: '',
    },
} as const;

export function isPlaceholder(value: string | null | undefined): boolean {
    const trimmed = value?.trim() ?? '';
    return trimmed === '' || /^\[.*\]$/.test(trimmed);
}

function digitsOnly(value: string): string {
    return value.replace(/\D/g, '');
}

/** `tel:` href for the configured phone number, or null while it's a placeholder. */
export function getPhoneHref(phone: string = CONTACT_CONFIG.phone): string | null {
    if (isPlaceholder(phone)) return null;
    const digits = digitsOnly(phone);
    if (!digits) return null;
    return `tel:${phone.trim().startsWith('+') ? '+' : ''}${digits}`;
}

/** `mailto:` href for the configured email, or null while it's a placeholder. */
export function getEmailHref(email: string = CONTACT_CONFIG.email, subject?: string): string | null {
    if (isPlaceholder(email) || !email.includes('@')) return null;
    return `mailto:${email.trim()}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
}

/**
 * `https://wa.me/<number>` link (optionally with a prefilled message), or
 * null while the WhatsApp number is a placeholder.
 */
export function getWhatsAppUrl(message?: string, whatsapp: string = CONTACT_CONFIG.whatsapp): string | null {
    if (isPlaceholder(whatsapp)) return null;
    const digits = digitsOnly(whatsapp);
    if (digits.length < 8) return null;
    return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export function getSocialProfiles(): Array<{network: keyof typeof CONTACT_CONFIG.social; url: string}> {
    return (Object.entries(CONTACT_CONFIG.social) as Array<[keyof typeof CONTACT_CONFIG.social, string]>)
        .filter(([, url]) => url.trim() !== '')
        .map(([network, url]) => ({network, url}));
}
