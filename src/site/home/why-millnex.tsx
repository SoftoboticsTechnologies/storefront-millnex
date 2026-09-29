'use client';

import {useState, type CSSProperties} from 'react';
import Image from 'next/image';
import {BadgeCheck, Headset, Ruler, Scale, Wrench, Zap} from 'lucide-react';
import {cn} from '@/lib/utils';
import {WHY_COPY, WHY_SECTION} from '@/site/content/home';

const ICONS = {ruler: Ruler, badge: BadgeCheck, zap: Zap, wrench: Wrench, headset: Headset, scale: Scale} as const;

/**
 * "Why Businesses Choose Millnex": a Millnex machine on a stage (left, sticky
 * on desktop) and the six numbered strengths (right). Hovering, focusing or
 * tapping a strength makes it the active one, which the image panel echoes
 * with its number. Copy restated from millnex.in (WHY_COPY).
 */
export function WhyMillnex() {
    const [active, setActive] = useState(0);
    const current = WHY_COPY.items[active];
    const CurrentIcon = ICONS[current.icon];

    return (
        <section id="why-millnex" aria-labelledby="why-title" className="bg-background py-20 sm:py-24 lg:py-28">
            <div className="site-container grid gap-12 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-5">
                    <div className="lg:sticky lg:top-28">
                        <div data-reveal="image" className="frame-ticks relative aspect-[4/5] overflow-hidden rounded-2xl bg-stage">
                            <Image
                                src={WHY_SECTION.image.src}
                                alt={WHY_SECTION.image.alt}
                                fill
                                sizes="(max-width: 1024px) 90vw, 480px"
                                className="object-contain p-8 mix-blend-multiply"
                            />
                            <div className="absolute inset-x-4 bottom-4 flex items-center gap-4 rounded-xl bg-background/92 p-4 text-foreground backdrop-blur">
                                <span key={active} className="animate-fade-up flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
                                    <CurrentIcon aria-hidden="true" className="size-5" />
                                </span>
                                <span className="min-w-0">
                                    <span key={current.title} className="animate-fade-up block truncate font-semibold">{current.title}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7">
                    <div data-reveal className="flex flex-col gap-5">
                        <h2 id="why-title" className="font-display-wide text-[2rem] font-bold leading-[1.02] sm:text-[2.5rem] lg:text-[3.25rem]">{WHY_SECTION.title}</h2>
                        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{WHY_SECTION.body}</p>
                    </div>

                    <ol className="mt-10 border-t border-border">
                        {WHY_COPY.items.map((item, index) => {
                            const Icon = ICONS[item.icon];
                            const isActive = index === active;
                            return (
                                <li
                                    key={item.title}
                                    data-reveal
                                    style={{'--reveal-delay': `${index * 60}ms`} as CSSProperties}
                                    className="border-b border-border"
                                >
                                    <button
                                        type="button"
                                        onMouseEnter={() => setActive(index)}
                                        onFocus={() => setActive(index)}
                                        onClick={() => setActive(index)}
                                        aria-pressed={isActive}
                                        className="group/why relative flex w-full items-start gap-5 py-6 text-left sm:gap-8"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={cn('absolute inset-y-0 left-0 w-0.5 origin-top bg-brand transition-transform duration-300', isActive ? 'scale-y-100' : 'scale-y-0')}
                                        />
                                        <span className="min-w-0 flex-1 pl-4">
                                            <span className={cn('block font-display-wide text-xl font-bold transition-colors sm:text-2xl', isActive ? 'text-foreground' : 'text-foreground/70 group-hover/why:text-foreground')}>
                                                {item.title}
                                            </span>
                                            <span className="mt-2 block text-[15px] leading-relaxed text-muted-foreground">{item.body}</span>
                                        </span>
                                        <span
                                            className={cn(
                                                'hidden size-11 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300 sm:flex',
                                                isActive ? 'border-brand bg-brand text-brand-foreground' : 'border-border text-steel',
                                            )}
                                        >
                                            <Icon aria-hidden="true" className="size-5" />
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </div>
        </section>
    );
}
