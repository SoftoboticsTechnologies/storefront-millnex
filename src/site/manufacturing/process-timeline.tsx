import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {SectionHeading} from '@/site/ui/section-heading';
import {MANUFACTURING_PAGE_COPY} from '@/site/content/company';

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Five-stage process. Horizontal from lg with a connector that draws
 * left-to-right (`reveal-line`); vertical below lg with one that draws
 * top-to-bottom (`reveal-line-y`). Both lines sit on the node centres
 * (nodes are size-12 → 1.5rem).
 */
export async function ProcessTimeline() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});
    const {process} = MANUFACTURING_PAGE_COPY;

    return (
        <section className="bg-background py-20 sm:py-24 lg:py-28">
            <div className="site-container">
                <SectionHeading title={process.title} body={process.body} />

                <div className="relative mt-14 lg:mt-20">
                    {/* Vertical connector (phones/tablets) */}
                    <span aria-hidden="true" className="absolute top-6 bottom-6 left-6 w-px bg-border lg:hidden" />
                    <span aria-hidden="true" data-reveal className="reveal-line-y absolute top-6 bottom-6 left-6 w-px bg-brand lg:hidden" />
                    {/* Horizontal connector (desktop) */}
                    <span aria-hidden="true" className="absolute inset-x-0 top-6 hidden h-px bg-border lg:block" />
                    <span aria-hidden="true" data-reveal className="reveal-line absolute inset-x-0 top-6 hidden h-px bg-brand lg:block" />

                    <ol className="relative flex flex-col gap-10 lg:grid lg:grid-cols-5 lg:gap-8">
                        {process.steps.map((step, index) => (
                            <li
                                key={step.title}
                                data-reveal
                                style={{'--reveal-delay': `${120 * index}ms`} as React.CSSProperties}
                                className="relative pl-20 lg:pl-0"
                            >
                                <span className="absolute top-0 left-0 flex size-12 items-center justify-center rounded-full border border-border bg-card font-display-wide text-sm font-bold text-foreground shadow-[0_10px_24px_-18px_rgb(15_20_30/0.5)] lg:static">
                                    <span className="sr-only">{t('stepIndex', {index: index + 1})}: </span>
                                    <span aria-hidden="true">{pad(index + 1)}</span>
                                </span>
                                <div className="pt-2.5 lg:pt-0">
                                    <h3 className="font-display-wide text-lg font-bold lg:mt-7 lg:text-xl">{step.title}</h3>
                                    <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">{step.body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
