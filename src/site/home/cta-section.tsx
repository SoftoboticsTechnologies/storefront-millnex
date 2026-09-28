import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {ArrowRight, MessageCircle} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {CTA_COPY} from '@/site/content/home';
import {siteButton} from '@/site/ui/button-styles';

export async function CtaSection() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});
    const {image} = CTA_COPY;

    return (
        <section className="px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
            <div data-reveal className="relative isolate mx-auto max-w-[84rem] overflow-hidden rounded-[2rem] border border-border bg-surface text-foreground">
                <Image
                    src={image.src}
                    alt=""
                    width={image.width}
                    height={image.height}
                    sizes="100vw"
                    className="absolute inset-0 -z-10 size-full object-cover opacity-90"
                />
                <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-surface via-surface/80 to-surface/30" />
                <div aria-hidden="true" className="absolute inset-0 -z-10 bg-blueprint opacity-60" />

                <div className="grid gap-10 px-6 py-16 sm:px-12 sm:py-20 lg:grid-cols-12 lg:items-center lg:px-16 lg:py-24">
                    <div className="lg:col-span-7">
                        <h2 className="text-3xl leading-[1.08] font-extrabold text-foreground sm:text-4xl lg:text-5xl">{CTA_COPY.title}</h2>
                        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{CTA_COPY.body}</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
                        <NavigationLink href="/shop/" className={siteButton({variant: 'brand', size: 'lg'})}>
                            {t('shopNow')}
                            <ArrowRight className="transition-transform group-hover/btn:translate-x-0.5" />
                        </NavigationLink>
                        <NavigationLink href="/contact/" className={siteButton({variant: 'outline', size: 'lg'})}>
                            <MessageCircle />
                            {t('contactUs')}
                        </NavigationLink>
                    </div>
                </div>
            </div>
        </section>
    );
}
