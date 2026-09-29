import {Link} from '@/platform/i18n/navigation';
import {cn} from '@/lib/utils';

export interface CategoryTab {
    name: string;
    slug: string;
}

interface CategoryTabsProps {
    /** Real Vendure collections (top-level shop categories), in Vendure order. */
    categories: CategoryTab[];
    /** Slug of the collection being viewed; omit on the unscoped shop ("All"). */
    activeSlug?: string;
    allLabel: string;
    label: string;
}

/**
 * Category tab strip under the listing band: "All" (= /shop) plus one tab per
 * real Vendure collection, each a link to its prerendered collection page.
 * Scrolls horizontally on phones rather than wrapping. Server-renderable —
 * the active tab is known at build time from the route.
 */
export function CategoryTabs({categories, activeSlug, allLabel, label}: CategoryTabsProps) {
    if (categories.length === 0) return null;

    const tabs = [{name: allLabel, href: '/shop', active: !activeSlug}].concat(
        categories.map((category) => ({
            name: category.name,
            href: `/collection/${category.slug}`,
            active: category.slug === activeSlug,
        })),
    );

    return (
        <nav aria-label={label} className="border-b border-border bg-background">
            <div className="site-container">
                <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:gap-2 sm:px-0 [&::-webkit-scrollbar]:hidden">
                    {tabs.map((tab) => (
                        <li key={tab.href} className="shrink-0">
                            <Link
                                href={tab.href}
                                aria-current={tab.active ? 'page' : undefined}
                                className={cn(
                                    'relative inline-flex h-14 items-center gap-2 px-3 text-sm font-semibold whitespace-nowrap transition-colors outline-none focus-visible:bg-muted sm:px-4',
                                    'after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:bg-brand after:transition-transform after:duration-300 sm:after:inset-x-4',
                                    tab.active
                                        ? 'text-foreground after:scale-x-100'
                                        : 'text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-100 hover:after:bg-foreground/20',
                                )}
                            >
                                {tab.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}

/** Placeholder with the tab strip's footprint, for route `loading.tsx` files. */
export function CategoryTabsSkeleton() {
    return (
        <div aria-hidden="true" className="border-b border-border bg-background">
            <div className="site-container flex h-14 items-center gap-6">
                {[12, 36, 44].map((width) => (
                    <div key={width} className="h-3.5 animate-pulse rounded bg-muted" style={{width: `${width * 0.25}rem`}} />
                ))}
            </div>
        </div>
    );
}
