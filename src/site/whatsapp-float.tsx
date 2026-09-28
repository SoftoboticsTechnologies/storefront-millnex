import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {externalLinkProps, resolveContactLinks} from '@/site/ui/contact-links';
import {WhatsAppIcon} from '@/site/ui/whatsapp-icon';

/**
 * Fixed WhatsApp support button, bottom RIGHT; raised 18px above the mobile
 * tab bar below `lg`. The hover label opens to the left, toward the page. It's a support channel, not a navbar action. The wa.me URL is built
 * from CONTACT_CONFIG.whatsapp; until that's configured it links to the
 * contact page's details block instead.
 */
export async function WhatsAppFloat() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Navigation'});
    const {whatsapp} = resolveContactLinks(locale, t('whatsappGreeting'));

    return (
        <a
            href={whatsapp.href}
            {...externalLinkProps(whatsapp)}
            aria-label={t('chatWithUs')}
            className="group fixed bottom-[calc(4rem+18px+env(safe-area-inset-bottom))] right-[18px] z-30 lg:bottom-6 lg:right-6 flex items-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
        >
            <span aria-hidden="true" className="animate-pulse-ring absolute right-0 top-0 size-[58px] rounded-full bg-[#25D366] sm:size-[62px]" />
            <span className="relative flex h-[58px] flex-row-reverse items-center rounded-full bg-[#25D366] text-white shadow-[0_14px_32px_-12px_rgb(18_140_74/0.7)] transition-[transform,box-shadow] duration-300 group-hover:scale-[1.04] group-hover:shadow-[0_18px_40px_-12px_rgb(18_140_74/0.8)] sm:h-[62px]">
                <span className="flex size-[58px] shrink-0 items-center justify-center sm:size-[62px]">
                    <WhatsAppIcon className="size-7" />
                </span>
                <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold text-[#0b3d20] opacity-0 transition-[max-width,opacity,padding] duration-300 group-hover:max-w-40 group-hover:pl-5 group-hover:opacity-100 group-focus-visible:max-w-40 group-focus-visible:pl-5 group-focus-visible:opacity-100">
                    {t('chatWithUs')}
                </span>
            </span>
        </a>
    );
}
