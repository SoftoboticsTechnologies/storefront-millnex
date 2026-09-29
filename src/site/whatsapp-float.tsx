import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {externalLinkProps, resolveContactLinks} from '@/site/ui/contact-links';
import {WhatsAppIcon} from '@/site/ui/whatsapp-icon';

/**
 * Small floating WhatsApp button, bottom RIGHT; raised 16px above the mobile
 * tab bar below `lg` so it never covers the tab bar or a sticky cart CTA.
 * "Chat with Millnex" slides out to the left on hover/focus. The wa.me URL
 * is built from CONTACT_CONFIG.whatsapp; until that's configured it links
 * to the contact page's details block instead.
 */
export async function WhatsAppFloat() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Navigation'});
    const {whatsapp} = resolveContactLinks(locale, t('whatsappGreeting'));

    return (
        <a
            href={whatsapp.href}
            {...externalLinkProps(whatsapp)}
            aria-label={t('chatWithMillnex')}
            className="group fixed bottom-[calc(4rem+16px+env(safe-area-inset-bottom))] right-4 z-30 flex items-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 lg:bottom-6 lg:right-6"
        >
            <span aria-hidden="true" className="animate-pulse-ring absolute right-0 top-0 size-[52px] rounded-full bg-[#25D366]" />
            <span className="relative flex h-[52px] flex-row-reverse items-center rounded-full bg-[#1fb855] text-white shadow-[0_12px_28px_-12px_rgb(18_140_74/0.75)] ring-1 ring-black/5 transition-[transform,box-shadow,background-color] duration-300 group-hover:bg-[#1aa84d] group-hover:shadow-[0_16px_36px_-12px_rgb(18_140_74/0.85)]">
                <span className="flex size-[52px] shrink-0 items-center justify-center">
                    <WhatsAppIcon className="size-6" />
                </span>
                <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-[max-width,opacity,padding] duration-300 group-hover:max-w-44 group-hover:pl-5 group-hover:opacity-100 group-focus-visible:max-w-44 group-focus-visible:pl-5 group-focus-visible:opacity-100">
                    {t('chatWithMillnex')}
                </span>
            </span>
        </a>
    );
}
