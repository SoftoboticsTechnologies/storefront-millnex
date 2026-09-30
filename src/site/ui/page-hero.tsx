import type {ReactNode} from 'react';
import {ChevronRight} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {cn} from '@/lib/utils';
import {NavigationLink} from '@/site/navigation/navigation-link';

export interface Crumb {
    label: string;
    /** Locale-less path; omit for the current page. */
    href?: string;
}

/**
 * Title band for inner marketing pages: breadcrumb, the page's one `<h1>`,
 * lead text, optional CTAs (`children`) and an optional visual on the right
 * (`aside`, from lg beside the text, below it on smaller screens).
 *
 * - `tone="light"` (FAQ, Contact, Insights, Credits) — warm surface band that
 *   sits below the solid header (`pt-28 lg:pt-36`).
 * - `tone="tint"` (About, Manufacturing) — logo-tint wash. The header is
 *   transparent over it on those routes, so the band's own padding includes
 *   the header + utility bar space (`pt-32 lg:pt-44`).
 */
export async function PageHero({
    title,
    body,
    crumbs,
    tone = 'light',
    aside,
    asideClassName,
    children,
}: {
    title: string;
    body?: string;
    crumbs: Crumb[];
    tone?: 'light' | 'tint';
    aside?: ReactNode;
    /** Extra classes for the aside's grid cell (e.g. `hidden lg:block`). */
    asideClassName?: string;
    children?: ReactNode;
}) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});
    const tint = tone === 'tint';

    return (
        <section
            className={cn(
                'relative isolate overflow-hidden border-b border-border text-foreground',
                tint ? 'bg-tint-sheen' : 'bg-surface',
            )}
        >
            <div aria-hidden="true" className="absolute -right-32 -top-32 -z-10 size-[34rem] rounded-full bg-logo-blue/10 blur-[140px]" />

            <div className={cn('site-container', tint ? 'pt-32 pb-16 sm:pb-20 lg:pt-44 lg:pb-28' : 'pt-28 pb-14 lg:pt-36 lg:pb-20')}>
                <nav aria-label={t('breadcrumb')}>
                    <ol className="spec-label flex flex-wrap items-center gap-2 text-steel">
                        {crumbs.map((crumb, index) => (
                            <li key={crumb.label} className="flex items-center gap-2">
                                {index > 0 && <ChevronRight aria-hidden="true" className="size-3 opacity-60" />}
                                {crumb.href ? (
                                    <NavigationLink href={crumb.href} className="transition-colors hover:text-foreground">
                                        {crumb.label}
                                    </NavigationLink>
                                ) : (
                                    <span aria-current="page" className="text-foreground">{crumb.label}</span>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>

                <div className={cn('mt-10 grid gap-12 lg:mt-14 lg:items-center', aside && 'lg:grid-cols-12 lg:gap-16')}>
                    <div className={cn('min-w-0', aside ? 'lg:col-span-6' : 'max-w-4xl')}>
                        <h1
                            className="animate-hero-rise font-display-wide text-[2.25rem] leading-[1.02] font-bold text-balance text-foreground sm:text-5xl lg:text-[4rem]"
                            style={{'--hero-delay': '60ms'} as React.CSSProperties}
                        >
                            {title}
                        </h1>
                        {body && (
                            <p
                                className="animate-hero-rise mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
                                style={{'--hero-delay': '120ms'} as React.CSSProperties}
                            >
                                {body}
                            </p>
                        )}
                        {children}
                    </div>
                    {aside && <div className={cn('min-w-0 lg:col-span-6', asideClassName)}>{aside}</div>}
                </div>
            </div>
        </section>
    );
}
