import type {Metadata, Viewport} from "next";
import Script from "next/script";
import {locale as rootLocale} from "next/root-params";
import {hasLocale, NextIntlClientProvider} from "next-intl";
import {Archivo, Geist_Mono, Inter} from "next/font/google";
import {getMessages, getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import {routing} from "@/platform/i18n/routing";
import {toOgLocale} from "@/platform/i18n/locale-utils";
import {getRouteLocale} from "@/platform/i18n/server";
import {Toaster} from "@/components/ui/sonner";
import {Navbar} from '@/site/navigation/navbar';
import {Footer} from "@/site/footer";
import {WhatsAppFloat} from "@/site/whatsapp-float";
import {BackToTop} from "@/site/back-to-top";
import {RevealObserver} from "@/site/ui/reveal-observer";
import {BRAND_LOGO, OG_IMAGE} from "@/site/content/media";
import {BareRouteHome, SiteChrome} from "@/site/navigation/site-chrome";
import {AuthProvider} from "@/features/authentication/auth-context";
import {QuoteProvider} from "@/features/enquiry/quote-dialog";
import {getProductOptions} from "@/features/products/data";
import {getMrpCatalog} from "@/features/pricing/mrp";
import {MrpProvider} from "@/features/pricing/mrp-context";
import {SITE_NAME, SITE_URL} from "@/config/metadata";

// Display: Archivo (variable width axis — headlines run slightly expanded,
// see `font-display-wide`). Body: Inter.
const archivo = Archivo({
    variable: "--font-archivo",
    subsets: ["latin"],
    display: "swap",
    axes: ["wdth"],
});

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap",
});

export function generateStaticParams() {
    return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const ogLocale = toOgLocale(locale);
    const t = await getTranslations({locale, namespace: 'Common'});

    return {
        metadataBase: new URL(SITE_URL),
        title: {
            default: SITE_NAME,
            template: `%s | ${SITE_NAME}`,
        },
        description: t('siteDescription', {siteName: SITE_NAME}),
        openGraph: {
            type: "website",
            siteName: SITE_NAME,
            locale: ogLocale,
            images: [{url: OG_IMAGE.src, width: OG_IMAGE.width, height: OG_IMAGE.height, alt: SITE_NAME}],
        },
        twitter: {
            card: "summary_large_image",
            images: [OG_IMAGE.src],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
        alternates: {
            languages: Object.fromEntries(
                routing.locales.map((l) => [l, `/${l}`])
            ),
        },
    };
}

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: "#ffffff",
};

export default async function LocaleLayout({children}: {children: React.ReactNode}) {
    const locale = await rootLocale();

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    setRequestLocale(locale);
    const messages = await getMessages({locale});
    const t = await getTranslations({locale, namespace: 'Navigation'});
    // Real Vendure products for the site-wide quote form's picker.
    const quoteProducts = await getProductOptions(locale);
    // Vendure MRPs (display-only strikethrough + saving) for every price component.
    const mrpCatalog = await getMrpCatalog();

    // The Millnex site is light-only (no dark mode, no dark sections —
    // 2026-09-29); `color-scheme: light` is forced in globals.css.
    return (
        <html lang={locale} data-scroll-behavior="smooth">
            <body
                /* Bottom padding reserves room for the mobile tab bar (navbar/mobile-tab-bar.tsx);
                   dropped on auth routes, which render without it (site-chrome.tsx). */
                className={`${archivo.variable} ${inter.variable} ${geistMono.variable} font-sans antialiased flex flex-col min-h-screen pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0 has-[[data-bare-route]]:pb-0`}
            >
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-foreground"
                >
                    {t('skipToContent')}
                </a>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <AuthProvider>
                    <MrpProvider catalog={mrpCatalog}>
                    <QuoteProvider products={quoteProducts}>
                        <SiteChrome><Navbar /></SiteChrome>
                        <BareRouteHome logo={{...BRAND_LOGO, alt: t('logoAlt')}} />
                        <div id="main-content" className="flex flex-1 flex-col">
                            {children}
                        </div>
                        <SiteChrome><Footer/></SiteChrome>
                        <BackToTop label={t('backToTop')} />
                        <WhatsAppFloat />
                        <RevealObserver />
                        <Toaster theme="light" />
                    </QuoteProvider>
                    </MrpProvider>
                    </AuthProvider>
                </NextIntlClientProvider>
                <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
                <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="afterInteractive" />
            </body>
        </html>
    );
}
