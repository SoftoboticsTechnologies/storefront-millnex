import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {ArrowRight, MessageCircle} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {SITE_MEDIA} from '@/site/content/media';
import {siteButton} from '@/site/ui/button-styles';

/**
 * Promotional band. Promotes what the store genuinely offers (an account
 * with order tracking and saved addresses — both real Vendure features)
 * instead of an invented discount.
 */
export async function PromoBanner() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});
    const image = SITE_MEDIA.grainProcessing;

    return (
        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="relative isolate mx-auto max-w-[84rem] overflow-hidden rounded-[2rem] border border-border bg-surface text-foreground">
                <Image src={image.src} alt="" width={image.width} height={image.height} sizes="100vw" className="absolute inset-0 -z-10 size-full object-cover opacity-90" />
                <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-surface via-surface/85 to-surface/40" />
                <div className="grid gap-8 px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-12 lg:items-center lg:px-16">
                    <div className="lg:col-span-7">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">{t('promoEyebrow')}</p>
                        <h2 className="mt-3 text-3xl leading-tight font-extrabold text-foreground sm:text-4xl">{t('promoTitle')}</h2>
                        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">{t('promoBody')}</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
                        <NavigationLink href="/register/" className={siteButton({variant: 'brand', size: 'lg'})}>
                            {t('promoCta')}
                            <ArrowRight className="transition-transform group-hover/btn:translate-x-0.5" />
                        </NavigationLink>
                        <NavigationLink href="/contact/" className={siteButton({variant: 'outline', size: 'lg'})}>
                            <MessageCircle />
                            {t('needHelp')}
                        </NavigationLink>
                    </div>
                </div>
            </div>
        </section>
    );
}
