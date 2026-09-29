import type {ReactNode} from 'react';
import Image from 'next/image';
import {Link} from '@/platform/i18n/navigation';
import {cn} from '@/lib/utils';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface ListingBannerImage {
    /** Vendure asset preview URL (without a preset query). */
    src: string;
    alt: string;
}

export interface ListingBreadcrumb {
    label: string;
    /** Omit for the current page (last crumb). */
    href?: string;
}

const MAX_TILES = 3;

/**
 * Title band for product listing pages (shop, collection, search): a dark
 * graphite band with a faint blueprint grid, breadcrumb, headline, short
 * description, a live-data meta line and optional actions. It includes the
 * fixed header's height in its own top padding, so render it as the first
 * element of the page, outside `site-container`.
 *
 * Artwork is only ever real Vendure imagery (product photos / a collection's
 * own image), shown whole on white "stage" tiles — product photos carry
 * baked-in captions and white backgrounds, so they are never cropped.
 */
export function ListingBanner({
    breadcrumbs,
    title,
    description,
    meta,
    actions,
    tiles = [],
}: {
    breadcrumbs: ListingBreadcrumb[];
    /** Rendered inside the page's single <h1>. */
    title: ReactNode;
    /** Plain text, or trusted Vendure rich-text HTML. */
    description?: {text: string} | {html: string};
    /** Short live-data line, e.g. the product count. */
    meta?: ReactNode;
    actions?: ReactNode;
    tiles?: ListingBannerImage[];
}) {
    const shownTiles = dedupeTiles(tiles).slice(0, MAX_TILES);

    return (
        <section className="relative isolate overflow-hidden bg-tint-sheen text-foreground">

            <div className="site-container flex items-end gap-10 pb-10 pt-24 sm:pb-12 lg:pb-14 lg:pt-36">
                <div className="min-w-0 max-w-2xl flex-1">
                    <Breadcrumb>
                        <BreadcrumbList className="text-xs text-muted-foreground sm:text-[13px]">
                            {breadcrumbs.map((crumb, index) => (
                                <BreadcrumbCrumb key={`${crumb.label}-${index}`} crumb={crumb} first={index === 0} />
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>

                    <h1 className="animate-hero-rise mt-6 sm:mt-8 font-display-wide text-[2rem] font-bold leading-[1.05] text-balance text-foreground sm:text-5xl lg:text-[3.5rem]">
                        {title}
                    </h1>
                    {description && ('html' in description ? (
                        <div
                            className="mt-4 line-clamp-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base [&_*]:text-inherit"
                            dangerouslySetInnerHTML={{__html: description.html}}
                        />
                    ) : (
                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description.text}</p>
                    ))}

                    {(meta || actions) && (
                        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 sm:mt-8">
                            {actions}
                            {meta && (
                                <p className="spec-label flex items-center gap-2 text-muted-foreground">
                                    <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
                                    {meta}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {shownTiles.length > 0 && (
                    <ul aria-hidden="true" className="ml-auto hidden shrink-0 items-end gap-3 md:flex lg:gap-4">
                        {shownTiles.map((tile, index) => (
                            <li
                                key={tile.src}
                                className={cn(
                                    'frame-ticks relative aspect-[4/5] w-28 overflow-hidden rounded-xl bg-white ring-1 ring-border shadow-[0_28px_50px_-30px_rgb(10_40_80/0.3)] lg:w-36 xl:w-40',
                                    // Stepped heights read as a considered composition, not a stack of cards.
                                    index === 1 && 'mb-6 lg:mb-10',
                                    index === 2 && 'hidden lg:block',
                                )}
                            >
                                <Image
                                    src={`${tile.src}?preset=medium`}
                                    alt=""
                                    fill
                                    sizes="(min-width: 1280px) 160px, (min-width: 1024px) 144px, 112px"
                                    className="object-contain p-2 mix-blend-multiply"
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

function BreadcrumbCrumb({crumb, first}: {crumb: ListingBreadcrumb; first: boolean}) {
    return (
        <>
            {!first && <BreadcrumbSeparator className="text-muted-foreground">/</BreadcrumbSeparator>}
            <BreadcrumbItem>
                {crumb.href ? (
                    <BreadcrumbLink render={<Link href={crumb.href} />} className="hover:text-foreground">
                        {crumb.label}
                    </BreadcrumbLink>
                ) : (
                    <BreadcrumbPage className="font-medium text-foreground">{crumb.label}</BreadcrumbPage>
                )}
            </BreadcrumbItem>
        </>
    );
}

function dedupeTiles(tiles: ListingBannerImage[]): ListingBannerImage[] {
    const seen = new Set<string>();
    return tiles.filter((tile) => {
        if (seen.has(tile.src)) return false;
        seen.add(tile.src);
        return true;
    });
}

/** Loading placeholder with the band's footprint, for route `loading.tsx` files. */
export function ListingBannerSkeleton() {
    return (
        <div aria-hidden="true" className="bg-tint-sheen">
            <div className="site-container pb-10 pt-24 sm:pb-12 lg:pb-14 lg:pt-36">
                <div className="max-w-2xl">
                    <div className="h-3 w-32 animate-pulse rounded bg-foreground/10" />
                    <div className="mt-6 h-3 w-24 animate-pulse rounded bg-foreground/10 sm:mt-8" />
                    <div className="mt-4 h-9 w-4/5 animate-pulse rounded-lg bg-foreground/10 sm:h-12 lg:h-14" />
                    <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-foreground/10" />
                    <div className="mt-2 h-4 w-2/3 max-w-md animate-pulse rounded bg-foreground/10" />
                    <div className="mt-6 h-3 w-40 animate-pulse rounded bg-foreground/10 sm:mt-8" />
                </div>
            </div>
        </div>
    );
}
