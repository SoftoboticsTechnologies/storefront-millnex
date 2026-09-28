import type {ReactNode} from 'react';
import Image from 'next/image';
import {ArrowDown} from 'lucide-react';
import {cn} from '@/lib/utils';

export interface ListingBannerImage {
    /** Vendure asset preview URL (without a preset query). */
    src: string;
    alt: string;
}

/**
 * Full-width dark title banner for product listing pages (shop, collection).
 * Render it outside `site-container`; its content re-aligns to the container.
 *
 * Artwork is always real Vendure imagery, never stock:
 * - `cover` — a collection's own featured image, bled in from the right
 *   behind a charcoal scrim (full-bleed behind the text on phones).
 * - `tiles` — product images, shown whole on white cards from md up; they
 *   are portrait promo tiles with captions, so they are never cropped to a
 *   landscape frame. On phones the first one sits faintly behind the scrim.
 */
export function ListingBanner({
    eyebrow,
    title,
    description,
    ctaLabel,
    ctaHref = '#products',
    cover,
    tiles = [],
    children,
}: {
    eyebrow: string;
    title: string;
    /** Plain text, or trusted Vendure rich-text HTML. */
    description?: {text: string} | {html: string};
    ctaLabel: string;
    ctaHref?: string;
    cover?: ListingBannerImage | null;
    tiles?: ListingBannerImage[];
    children?: ReactNode;
}) {
    const shownTiles = cover ? [] : tiles.slice(0, 3);
    const backdrop = cover ?? shownTiles[0] ?? null;

    return (
        <section className="relative isolate mb-8 overflow-hidden bg-ink text-ink-foreground">
            {backdrop && (
                <div aria-hidden="true" className={cn('absolute inset-0 -z-10', !cover && 'md:hidden', cover && 'md:left-[45%]')}>
                    <Image
                        src={`${backdrop.src}?preset=large`}
                        alt=""
                        fill
                        priority
                        sizes="(min-width: 768px) 60vw, 100vw"
                        className={cn('object-cover', !cover && 'object-top opacity-60')}
                    />
                    {/* Scrim: solid behind the text, fading out towards the image. */}
                    <div className="absolute inset-0 bg-ink/75 md:bg-transparent md:bg-gradient-to-r md:from-ink md:via-ink/60 md:to-transparent" />
                </div>
            )}
            <div aria-hidden="true" className="absolute -left-24 -top-24 -z-10 size-72 rounded-full bg-brand/25 blur-[110px]" />

            <div className="site-container flex items-center gap-8 py-6 sm:py-8 lg:py-9">
                <div className="min-w-0 max-w-xl flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-bright">{eyebrow}</p>
                    <h1 className="mt-2 text-2xl font-extrabold leading-[1.1] tracking-tight sm:text-3xl lg:text-4xl">{title}</h1>
                    {description && ('html' in description ? (
                        <div
                            className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted sm:text-base [&_*]:text-inherit"
                            dangerouslySetInnerHTML={{__html: description.html}}
                        />
                    ) : (
                        <p className="mt-2 text-sm leading-relaxed text-ink-muted sm:text-base">{description.text}</p>
                    ))}
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-5">
                        <a
                            href={ctaHref}
                            className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-brand-foreground transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-bright/50"
                        >
                            {ctaLabel}
                            <ArrowDown className="size-4" />
                        </a>
                        {children && <div className="text-sm font-semibold text-ink-muted">{children}</div>}
                    </div>
                </div>

                {shownTiles.length > 0 && (
                    // Negative margins let the tiles use the banner's vertical padding,
                    // so they grow without making the banner any taller.
                    <ul aria-hidden="true" className="-my-6 ml-auto hidden shrink-0 items-center md:flex lg:-my-[25.5px]">
                        {shownTiles.map((tile, index) => (
                            <li
                                key={tile.src}
                                className={cn(
                                    'relative aspect-[3/4] w-28 overflow-hidden rounded-xl bg-white shadow-[0_18px_40px_-18px_rgb(0_0_0/0.7)] ring-1 ring-white/10 lg:w-[150px]',
                                    index > 0 && '-ml-5 lg:-ml-7',
                                    index === 0 && '-rotate-3',
                                    index === 2 && 'rotate-3',
                                    index === 2 && 'hidden lg:block',
                                )}
                                style={{zIndex: index === 1 ? 3 : 2 - index}}
                            >
                                <Image src={`${tile.src}?preset=medium`} alt="" fill sizes="(min-width: 1024px) 150px, 112px" className="object-contain" />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

/** Loading placeholder with the banner's footprint, for route `loading.tsx` files. */
export function ListingBannerSkeleton() {
    return (
        <div aria-hidden="true" className="mb-8 bg-ink py-6 sm:py-8 lg:py-9">
            <div className="site-container">
                <div className="max-w-xl space-y-3">
                    <div className="h-3 w-24 animate-pulse rounded bg-white/15" />
                    <div className="h-8 w-2/3 animate-pulse rounded bg-white/15 lg:h-10" />
                    <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                    <div className="h-10 w-40 animate-pulse rounded-full bg-white/15" />
                </div>
            </div>
        </div>
    );
}
