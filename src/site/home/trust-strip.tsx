import type {CSSProperties} from 'react';
import {BadgeCheck, Headset, Ruler, Scale, Wrench, Zap, type LucideIcon} from 'lucide-react';
import {cn} from '@/lib/utils';
import {CERTIFICATION, TRUST_STRIP, WHY_SECTION} from '@/site/content/home';

const ICONS: Record<(typeof TRUST_STRIP)[number]['icon'] | 'certified', LucideIcon> = {
    certified: BadgeCheck,
    ruler: Ruler,
    zap: Zap,
    wrench: Wrench,
    scale: Scale,
    headset: Headset,
};

/**
 * Trust strip directly under the hero: the ISO 9001:2015 certification
 * first (home.ts#CERTIFICATION), then qualities restated from millnex.in —
 * deliberately no numeric statistics (none are published). Cells are
 * separated by 1px gaps over a border-coloured grid, so the lines stay
 * right at any column count.
 */
export function TrustStrip() {
    const items = [{icon: 'certified' as const, title: CERTIFICATION.label, body: CERTIFICATION.body}, ...TRUST_STRIP];

    return (
        <section aria-labelledby="trust-strip-title" className="border-t border-border bg-tint-green text-foreground">
            <h2 id="trust-strip-title" className="sr-only">{WHY_SECTION.label}</h2>
            <div className="site-container">
                <ul className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {items.map((item, index) => {
                        const Icon = ICONS[item.icon];
                        const certified = item.icon === 'certified';
                        return (
                            <li
                                key={item.title}
                                data-reveal
                                style={{'--reveal-delay': `${index * 70}ms`} as CSSProperties}
                                className="group/trust bg-tint-green py-6 sm:px-6 sm:py-8 xl:px-5"
                            >
                                <span
                                    className={cn(
                                        'flex size-10 items-center justify-center rounded-lg transition-colors duration-300',
                                        certified
                                            ? 'bg-success text-white'
                                            : 'border border-border bg-card text-brand group-hover/trust:border-brand group-hover/trust:bg-brand group-hover/trust:text-brand-foreground',
                                    )}
                                >
                                    <Icon aria-hidden="true" className="size-[18px]" />
                                </span>
                                <h3 className="mt-4 font-display text-base font-semibold">{item.title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
