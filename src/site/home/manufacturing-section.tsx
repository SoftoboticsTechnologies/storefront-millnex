import type {CSSProperties} from 'react';
import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {ArrowRight} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {MANUFACTURING_STEPS} from '@/site/content/home';
import {SectionHeading} from '@/site/ui/section-heading';

/**
 * "Built With Engineering Discipline": the five-step manufacturing journey
 * as a timeline (horizontal with a drawing connector from lg, vertical on
 * phones), over Millnex's own machine photography. There is no facility
 * photography yet, so no factory images are shown.
 */
export async function ManufacturingSection() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});
    const steps = MANUFACTURING_STEPS.steps;

    return (
        <section id="manufacturing" className="relative isolate overflow-hidden bg-tint-orange py-20 text-foreground sm:py-24 lg:py-28">
            <div aria-hidden="true" className="absolute -left-40 bottom-0 -z-10 size-[34rem] rounded-full bg-brand/15 blur-[160px]" />

            <div className="site-container">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <SectionHeading title={MANUFACTURING_STEPS.title} body={MANUFACTURING_STEPS.body} />
                    <NavigationLink href="/manufacturing" className="group/btn inline-flex shrink-0 items-center gap-2 text-sm font-bold text-foreground hover:text-brand" data-reveal>
                        {t('manufacturingCta')}
                        <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </NavigationLink>
                </div>

                <ol className="relative mt-16 grid gap-0 lg:grid-cols-5 lg:gap-6">
                    {/* Connectors: vertical on phones/tablets, horizontal from lg. */}
                    <span aria-hidden="true" data-reveal className="reveal-line-y absolute bottom-8 left-[19px] top-8 w-px bg-gradient-to-b from-brand via-border to-border lg:hidden" />
                    <span aria-hidden="true" data-reveal className="reveal-line absolute left-5 right-5 top-5 hidden h-px bg-gradient-to-r from-brand via-logo-orange/50 to-logo-green/40 lg:block" />
                    {steps.map((step, index) => (
                        <li
                            key={step.title}
                            data-reveal
                            style={{'--reveal-delay': `${index * 110}ms`} as CSSProperties}
                            className="relative flex gap-5 pb-10 last:pb-0 lg:flex-col lg:gap-0 lg:pb-0"
                        >
                            <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card font-mono text-xs font-semibold text-brand shadow-[0_0_0_6px_var(--tint-orange)]">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="pt-1.5 lg:pt-7">
                                <h3 className="font-display-wide text-lg font-bold">{step.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                            </div>
                        </li>
                    ))}
                </ol>

                <div className="mt-16 grid grid-cols-3 gap-3 sm:gap-4">
                    {MANUFACTURING_STEPS.images.map((image, index) => (
                        <div
                            key={image.src}
                            data-reveal="image"
                            style={{'--reveal-delay': `${index * 120}ms`} as CSSProperties}
                            className="relative aspect-[4/3] overflow-hidden rounded-xl bg-stage"
                        >
                            <Image src={image.src} alt={image.alt} fill sizes="(max-width: 1024px) 33vw, 400px" className="object-contain p-4 mix-blend-multiply sm:p-6" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
