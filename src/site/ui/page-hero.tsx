import type {ReactNode} from 'react';
import Image from 'next/image';
import {ChevronRight} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {Eyebrow} from '@/site/ui/section-heading';
import {BRAND_LOGO} from '@/site/content/media';

export interface Crumb {
    label: string;
    /** Locale-less path; omit for the current page. */
    href?: string;
}

/**
 * Light title band for inner marketing pages, with the Millnex logo on the
 * right from md up. Carries its own top padding for the fixed header.
 */
export async function PageHero({
    eyebrow,
    title,
    body,
    crumbs,
    children,
}: {
    eyebrow?: string;
    title: string;
    body?: string;
    crumbs: Crumb[];
    children?: ReactNode;
}) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});

    return (
        <section className="relative isolate overflow-hidden border-b border-border bg-surface text-foreground">
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-blueprint [mask-image:radial-gradient(ellipse_at_top_right,black_10%,transparent_70%)]" />
            <div aria-hidden="true" className="absolute -right-24 -top-24 -z-10 size-[32rem] rounded-full bg-brand/10 blur-[130px]" />
            <div className="site-container pt-28 pb-14 lg:pt-32 lg:pb-20">
                <nav aria-label={t('breadcrumb')}>
                    <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                        {crumbs.map((crumb, index) => (
                            <li key={crumb.label} className="flex items-center gap-1.5">
                                {index > 0 && <ChevronRight aria-hidden="true" className="size-3.5 opacity-60" />}
                                {crumb.href ? (
                                    <NavigationLink href={crumb.href} className="transition-colors hover:text-foreground">{crumb.label}</NavigationLink>
                                ) : (
                                    <span aria-current="page" className="font-semibold text-foreground">{crumb.label}</span>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
                <div className="mt-10 flex items-center justify-between gap-10">
                    <div className="min-w-0 max-w-3xl">
                        {eyebrow && <Eyebrow className="animate-hero-in">{eyebrow}</Eyebrow>}
                        <h1 className="animate-hero-rise mt-4 text-4xl leading-[1.05] font-extrabold text-foreground sm:text-5xl lg:text-6xl" style={{'--hero-delay': '60ms'} as React.CSSProperties}>
                            {title}
                        </h1>
                        {body && (
                            <p className="animate-hero-rise mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg" style={{'--hero-delay': '120ms'} as React.CSSProperties}>
                                {body}
                            </p>
                        )}
                    </div>
                    {/* Decorative (the header already names the brand); hidden on
                        phones so it doesn't push the title down. */}
                    <div aria-hidden="true" className="animate-hero-in hidden shrink-0 rounded-3xl border border-border bg-card p-8 shadow-[0_30px_60px_-40px_rgb(0_0_0/0.45)] md:block lg:p-10" style={{'--hero-delay': '180ms'} as React.CSSProperties}>
                        <Image src={BRAND_LOGO.src} alt="" width={BRAND_LOGO.width} height={BRAND_LOGO.height} priority className="h-24 w-auto lg:h-36 xl:h-40" />
                    </div>
                </div>
                {children}
            </div>
        </section>
    );
}
