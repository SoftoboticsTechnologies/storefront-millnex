import {PROCESS_COPY} from '@/site/content/home';
import {SectionHeading} from '@/site/ui/section-heading';

/**
 * Six-step browse-to-support ordering timeline. Horizontal on desktop (the
 * connecting line draws in as the section scrolls into view), vertical on
 * mobile. The line uses `.reveal-line` from globals.css.
 */
export function ProcessTimeline() {
    return (
        <section className="bg-surface py-24 lg:py-32">
            <div className="site-container">
                <SectionHeading align="center" eyebrow={PROCESS_COPY.eyebrow} title={PROCESS_COPY.title} />

                <ol className="relative mt-16 grid gap-8 lg:grid-cols-6 lg:gap-6">
                    <span aria-hidden="true" className="absolute top-6 left-[8.33%] right-[8.33%] hidden h-px bg-border lg:block" />
                    <span aria-hidden="true" data-reveal className="reveal-line absolute top-6 left-[8.33%] right-[8.33%] hidden h-px bg-brand lg:block" />
                    <span aria-hidden="true" className="absolute top-6 bottom-6 left-6 w-px bg-border lg:hidden" />

                    {PROCESS_COPY.steps.map((step, index) => (
                        <li
                            key={step.title}
                            data-reveal
                            style={{'--reveal-delay': `${index * 120}ms`} as React.CSSProperties}
                            className="relative flex gap-5 lg:flex-col lg:items-center lg:gap-0 lg:text-center"
                        >
                            <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-brand bg-card font-mono text-sm font-bold text-brand shadow-[0_0_0_6px_var(--surface)]">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="pt-2 lg:mt-6 lg:pt-0">
                                <h3 className="text-base font-bold">{step.title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
