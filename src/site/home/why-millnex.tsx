import {BadgeCheck, Headset, Ruler, Scale, Wrench, Zap} from 'lucide-react';
import {WHY_COPY} from '@/site/content/home';
import {SectionHeading} from '@/site/ui/section-heading';

const ICONS = {ruler: Ruler, badge: BadgeCheck, zap: Zap, wrench: Wrench, headset: Headset, scale: Scale} as const;

export function WhyMillnex() {
    return (
        <section id="why-millnex" className="relative isolate overflow-hidden bg-surface py-24 text-foreground lg:py-32">
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-blueprint [mask-image:linear-gradient(to_bottom,black,transparent)]" />
            <div aria-hidden="true" className="absolute -left-32 top-1/3 -z-10 size-[30rem] rounded-full bg-brand/10 blur-[130px]" />

            <div className="site-container">
                <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
                    <SectionHeading eyebrow={WHY_COPY.eyebrow} title={WHY_COPY.title} />
                    <p data-reveal className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg lg:justify-self-end">
                        {WHY_COPY.body}
                    </p>
                </div>

                <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {WHY_COPY.items.map((item, index) => {
                        const Icon = ICONS[item.icon];
                        return (
                            <li
                                key={item.title}
                                data-reveal
                                style={{'--reveal-delay': `${(index % 3) * 90}ms`} as React.CSSProperties}
                                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_22px_45px_-30px_rgb(0_0_0/0.45)] sm:p-7"
                            >
                                <span aria-hidden="true" className="absolute right-6 top-6 font-mono text-sm text-muted-foreground/70">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition-transform duration-300 group-hover:-translate-y-0.5">
                                    <Icon className="size-6" />
                                </span>
                                <h3 className="mt-5 text-lg font-bold text-foreground sm:mt-8">{item.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                                <span aria-hidden="true" className="absolute inset-x-7 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-brand to-transparent transition-transform duration-500 group-hover:scale-x-100" />
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
