import type {MetadataRoute} from 'next';
import {routing} from '@/platform/i18n/routing';
import {buildCanonicalUrl} from '@/config/metadata';

const PRIVATE_SEGMENTS = ['account', 'cart', 'checkout', 'order-confirmation', 'sign-in', 'register', 'forgot-password', 'reset-password', 'verify', 'verify-pending'];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: routing.locales.flatMap((locale) => PRIVATE_SEGMENTS.map((segment) => `/${locale}/${segment}/`)),
        },
        sitemap: buildCanonicalUrl('/sitemap.xml'),
    };
}
