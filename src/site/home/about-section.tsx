import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {ArrowRight, Check} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {ABOUT_COPY, COMPANY_STATS} from '@/site/content/home';
import {SectionHeading} from '@/site/ui/section-heading';
import {siteButton} from '@/site/ui/button-styles';
import {AnimatedCounter} from '@/site/ui/animated-counter';

export async function AboutSection({showCta = true}: {showCta?: boolean}) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});
    const {image} = ABOUT_COPY;

    return (
        <section id="about" className="border-y border-border bg-surface pb-16 pt-10 lg:pb-24 lg:pt-14">
            <div className="site-container">
                <SectionHeading align="center" eyebrow={ABOUT_COPY.eyebrow} title={ABOUT_COPY.title} />

                {/* Two equal columns: story text | artwork + highlights. The
                    highlight grid stretches (auto-rows-fr) so both columns end level. */}
                <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-2 lg:gap-12">
                    <div data-reveal className="flex flex-col rounded-3xl border border-border bg-card p-6 sm:p-8 lg:p-10">
                        <div className="space-y-5 text-base leading-relaxed text-muted-foreground sm:text-[1.05rem]">
                            {ABOUT_COPY.paragraphs.map((paragraph) => (
                                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                            ))}
                        </div>

                        {COMPANY_STATS.length > 0 && (
                            <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-3">
                                {COMPANY_STATS.map((stat) => (
                                    <div key={stat.label}>
                                        <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                                        <dd className="mt-1 text-3xl font-extrabold tracking-tight">
                                            <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        )}

                        {showCta && (
                            <div className="mt-auto pt-8">
                                <NavigationLink href="/about/" className={siteButton({variant: 'brand', size: 'lg'})}>
                                    {t('discoverMillnex')}
                                    <ArrowRight className="transition-transform group-hover/btn:translate-x-0.5" />
                                </NavigationLink>
                            </div>
                        )}
                    </div>

                    <div data-reveal className="flex flex-col gap-4 sm:gap-5">
                        {/* Millnex's banner artwork has its headline baked in: shown whole, never cropped. */}
                        <Image
                            src={image.src}
                            alt={image.alt}
                            width={image.width}
                            height={image.height}
                            sizes="(min-width: 1024px) 45vw, 100vw"
                            className="h-auto w-full rounded-3xl shadow-[0_30px_60px_-40px_rgb(0_0_0/0.5)]"
                        />
                        <ul className="grid flex-1 auto-rows-fr grid-cols-2 gap-4 sm:gap-5">
                            {ABOUT_COPY.highlights.map((highlight) => (
                                <li key={highlight} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm font-semibold sm:p-5 sm:text-[0.95rem]">
                                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
                                        <Check className="size-4" strokeWidth={3} />
                                    </span>
                                    {highlight}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
