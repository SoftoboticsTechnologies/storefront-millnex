import type {CSSProperties} from 'react';
import {Cog, Cpu, RefreshCcw, ShieldCheck, ThermometerSnowflake, Zap, type LucideIcon} from 'lucide-react';
import Image from 'next/image';
import {cn} from '@/lib/utils';
import type {CatalogImage} from '@/site/content/media';
import {MACHINE_FEATURES_COPY} from '@/site/content/home';
import {SectionHeading} from '@/site/ui/section-heading';

const ICONS: Record<(typeof MACHINE_FEATURES_COPY.items)[number]['icon'], LucideIcon> = {
    sensor: Cpu,
    shield: ShieldCheck,
    thermometer: ThermometerSnowflake,
    chamber: Cog,
    motor: Zap,
    auto: RefreshCcw,
};

/**
 * "Smart Features in Every Millnex Mill": Millnex's six published machine
 * features, each with an icon. Shared by the homepage and the About page;
 * `className` sets the section background/spacing for its context. With
 * `image`, a display photo sits beside the features (left from lg, on top
 * below), shown whole in a portrait frame.
 */
export function MachineFeatures({className, image}: {className?: string; image?: CatalogImage}) {
    const features = (
        <ul className={cn('mt-12 grid gap-4 sm:grid-cols-2', image ? 'lg:mt-10' : 'lg:grid-cols-3')}>
                {MACHINE_FEATURES_COPY.items.map((item, index) => {
                    const Icon = ICONS[item.icon];
                    return (
                        <li
                            key={item.title}
                            data-reveal
                            style={{'--reveal-delay': `${(index % 3) * 80}ms`} as CSSProperties}
                            className="group/feature flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_24px_44px_-32px_rgb(15_20_30/0.5)] sm:p-6"
                        >
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand transition-colors duration-300 group-hover/feature:bg-brand group-hover/feature:text-brand-foreground">
                                <Icon aria-hidden="true" className="size-6" />
                            </span>
                            <h3 className="font-display text-base font-semibold leading-snug sm:text-[17px]">{item.title}</h3>
                        </li>
                    );
                })}
        </ul>
    );

    return (
        <section id="machine-features" className={cn('scroll-mt-28 py-20 sm:py-24', className)}>
            <div className={cn('site-container', image && 'grid items-center gap-10 lg:grid-cols-12 lg:gap-14')}>
                {image && (
                    <div data-reveal="image" className="mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
                        <div className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-[0_40px_70px_-50px_rgb(15_20_30/0.45)]" style={{aspectRatio: `${image.width} / ${image.height}`}}>
                            <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 36vw, (min-width: 640px) 28rem, 90vw" className="object-contain" />
                        </div>
                    </div>
                )}
                <div className={cn(image && 'lg:col-span-7')}>
                    <SectionHeading title={MACHINE_FEATURES_COPY.title} body={MACHINE_FEATURES_COPY.body} />
                    {features}
                </div>
            </div>
        </section>
    );
}
