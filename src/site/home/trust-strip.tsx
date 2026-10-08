import type {CSSProperties} from 'react';
import Image from 'next/image';
import {CalendarCheck, Headset, ShieldCheck, Truck, Zap, type LucideIcon} from 'lucide-react';
import {cn} from '@/lib/utils';
import {CERTIFICATION, TRUST_STRIP, WHY_SECTION} from '@/site/content/home';
import {ISO_MARK} from '@/site/content/media';

// Hidden 2026-10-08 (previous items): ruler: Cog, wrench: Wrench, scale: Building2.
const ICONS: Record<(typeof TRUST_STRIP)[number]['icon'], LucideIcon> = {
    demo: CalendarCheck,
    truck: Truck,
    zap: Zap,
    shield: ShieldCheck,
    headset: Headset,
};

/** Icon circles in the logo ring's colours: ISO blue, energy/support green, the rest orange. */
const ORANGE = {ring: 'ring-logo-orange/30', fill: 'from-white to-tint-orange', icon: 'text-logo-orange-deep'};
const GREEN = {ring: 'ring-logo-green/30', fill: 'from-white to-tint-green', icon: 'text-logo-green-deep'};
const ISO_TONE = {ring: 'ring-logo-blue/30', fill: 'from-white to-tint-blue', icon: ''};
const TONES: Record<(typeof TRUST_STRIP)[number]['icon'], typeof ORANGE> = {
    demo: ORANGE,
    truck: ORANGE,
    zap: GREEN,
    shield: ORANGE,
    headset: GREEN,
};

/** "Free Home Demo" → ["Free Home", "Demo"]: first part in brand orange, last word dark. */
function splitTitle(title: string): [string, string] {
    const cut = title.lastIndexOf(' ');
    return cut > 0 ? [title.slice(0, cut), title.slice(cut + 1)] : [title, ''];
}

/**
 * Trust strip directly under the hero: the ISO 9001:2015 certification first
 * (home.ts#CERTIFICATION), then the customer offers (free home demo, free
 * shipping radius) and Atta Chakki qualities — deliberately no numeric
 * statistics (none are published). Centered items:
 * logo-tinted icon circle, two-tone title, short brand rule, description;
 * full-width warm gradient band, hairline dividers between items, wheat
 * art at the screen edges from 2xl.
 */
export function TrustStrip() {
    const items = [{icon: 'certified' as const, title: CERTIFICATION.label, body: CERTIFICATION.body}, ...TRUST_STRIP];

    return (
        <section
            aria-labelledby="trust-strip-title"
            className="relative isolate overflow-hidden border-y border-border bg-gradient-to-b from-card to-tint-orange/70 text-foreground"
        >
            <h2 id="trust-strip-title" className="sr-only">{WHY_SECTION.label}</h2>
            {/* Decorative wheat (Millnex's own illustration) at the screen edges, wide screens only. */}
            <Image aria-hidden="true" src="/site/wheat-ear.svg" alt="" width={120} height={160} className="pointer-events-none absolute -left-4 top-1/2 -z-10 hidden h-auto w-40 -translate-y-1/2 -rotate-12 opacity-60 2xl:block" />
            <Image aria-hidden="true" src="/site/wheat-ear.svg" alt="" width={120} height={160} className="pointer-events-none absolute -right-4 top-1/2 -z-10 hidden h-auto w-40 -translate-y-1/2 -scale-x-100 rotate-12 opacity-60 2xl:block" />
            <div className="site-container">
                <div className="overflow-hidden">
                <ul className="-mb-px -mr-px grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
                        {items.map((item, index) => {
                            const certified = item.icon === 'certified';
                            const Icon = certified ? null : ICONS[item.icon];
                            const tone = certified ? ISO_TONE : TONES[item.icon];
                            const [lead, last] = splitTitle(item.title);
                            return (
                                <li
                                    key={item.title}
                                    data-reveal
                                    style={{'--reveal-delay': `${index * 70}ms`} as CSSProperties}
                                    // Right + bottom hairlines on every item; the list's -1px margin and the
                                    // card's overflow-hidden clip the outer ones, so dividers stay right at any column count.
                                    className="group/trust flex flex-col items-center border-b border-r border-border px-3 py-4 text-center sm:px-4"
                                >
                                    <span
                                        className={cn(
                                            'flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-b shadow-[0_8px_18px_-10px_rgb(20_30_50/0.45)] ring-4 transition-transform duration-300 group-hover/trust:-translate-y-0.5',
                                            tone.ring,
                                            tone.fill,
                                        )}
                                    >
                                        {Icon ? (
                                            <Icon aria-hidden="true" className={cn('size-5', tone.icon)} strokeWidth={2.2} />
                                        ) : (
                                            <Image src={ISO_MARK.src} alt={ISO_MARK.alt} width={ISO_MARK.width} height={ISO_MARK.height} className="size-9 rounded-full object-contain" />
                                        )}
                                    </span>
                                    <h3 className="mt-3 font-display text-[15px] font-bold leading-tight">
                                        <span className="block text-brand">{lead}</span>
                                        {last && <span className="block">{last}</span>}
                                    </h3>
                                    <span aria-hidden="true" className="mt-2 h-0.5 w-7 rounded-full bg-brand/80" />
                                    <p className="mt-2 max-w-[13rem] text-xs leading-relaxed text-muted-foreground">{item.body}</p>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </section>
    );
}
