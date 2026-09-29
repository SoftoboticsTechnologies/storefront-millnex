import {ProductGridSkeleton} from '@/features/products/product-grid-skeleton';
import {LISTING_LAYOUT_CLASS} from '@/features/search/listing-layout';

export function FilterSidebarSkeleton() {
    return (
        <div aria-hidden="true" className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
            <div className="divide-y divide-border px-5 py-5">
                {[3, 4, 1].map((rows, section) => (
                    <div key={section} className="space-y-3 py-4 first:pt-0 last:pb-0">
                        <div className="h-2.5 w-24 animate-pulse rounded bg-muted" />
                        {Array.from({length: rows}).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="size-4 animate-pulse rounded bg-muted" />
                                <div className="h-3 flex-1 animate-pulse rounded bg-muted" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ListingToolbarSkeleton() {
    return (
        <div aria-hidden="true" className="flex items-center gap-2 border-b border-border pb-4 sm:gap-3">
            <div className="h-11 flex-1 animate-pulse rounded-lg bg-muted sm:w-32 sm:flex-none lg:hidden" />
            <div className="hidden h-3 w-40 animate-pulse rounded bg-muted sm:block" />
            <div className="h-11 flex-1 animate-pulse rounded-lg bg-muted sm:ml-auto sm:w-60 sm:flex-none" />
        </div>
    );
}

/** Sidebar + toolbar + grid placeholder with the live listing's footprint. */
export function SearchResultsSkeleton() {
    return (
        <div className={LISTING_LAYOUT_CLASS}>
            <aside className="hidden lg:block">
                <FilterSidebarSkeleton />
            </aside>
            <div className="min-w-0 space-y-6">
                <ListingToolbarSkeleton />
                <ProductGridSkeleton />
            </div>
        </div>
    );
}
