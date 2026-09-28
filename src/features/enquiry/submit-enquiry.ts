import {CONTACT_CONFIG, getEmailHref, getWhatsAppUrl} from '@/config/contact';

export interface EnquiryPayload {
    name: string;
    phone: string;
    email?: string;
    company?: string;
    /** Human-readable product name (not the slug). */
    product?: string;
    message: string;
}

export type EnquiryDeliveryKind = 'endpoint' | 'whatsapp' | 'email';

export type EnquiryResult =
    | {kind: 'endpoint'}
    | {kind: 'whatsapp' | 'email'; handoffUrl: string};

export class EnquiryNotConfiguredError extends Error {
    constructor() {
        super('No enquiry delivery channel is configured (endpoint, WhatsApp or email).');
        this.name = 'EnquiryNotConfiguredError';
    }
}

/**
 * How an enquiry will be delivered, in priority order:
 * 1. `CONTACT_CONFIG.enquiryEndpoint` (NEXT_PUBLIC_ENQUIRY_ENDPOINT) — JSON POST
 *    to a form service / serverless function / CRM webhook. This storefront
 *    is a static export, so there is no first-party server to receive it.
 * 2. WhatsApp hand-off with the enquiry prefilled, if a number is configured.
 * 3. Email hand-off (mailto:) with the enquiry prefilled.
 * Returns null when none of these is configured yet.
 */
export function getEnquiryDeliveryKind(): EnquiryDeliveryKind | null {
    if (CONTACT_CONFIG.enquiryEndpoint) return 'endpoint';
    if (getWhatsAppUrl()) return 'whatsapp';
    if (getEmailHref()) return 'email';
    return null;
}

export function formatEnquiryText(payload: EnquiryPayload, labels: Record<keyof EnquiryPayload, string>, intro: string): string {
    const lines = (Object.keys(labels) as Array<keyof EnquiryPayload>)
        .filter((key) => payload[key])
        .map((key) => `${labels[key]}: ${payload[key]}`);
    return [intro, '', ...lines].join('\n');
}

export async function submitEnquiry(payload: EnquiryPayload, text: string, subject: string): Promise<EnquiryResult> {
    const kind = getEnquiryDeliveryKind();

    if (kind === 'endpoint') {
        const response = await fetch(CONTACT_CONFIG.enquiryEndpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', Accept: 'application/json'},
            body: JSON.stringify({
                ...payload,
                subject,
                source: 'millnex-website',
                page: window.location.href,
                submittedAt: new Date().toISOString(),
            }),
        });
        if (!response.ok) {
            throw new Error(`Enquiry endpoint responded with ${response.status}`);
        }
        return {kind: 'endpoint'};
    }

    if (kind === 'whatsapp') {
        return {kind, handoffUrl: getWhatsAppUrl(text)!};
    }

    if (kind === 'email') {
        const mailto = getEmailHref(CONTACT_CONFIG.email, subject)!;
        return {kind, handoffUrl: `${mailto}&body=${encodeURIComponent(text)}`};
    }

    throw new EnquiryNotConfiguredError();
}
