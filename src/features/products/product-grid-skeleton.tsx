import {PRODUCT_GRID_CLASS, PRODUCT_RAIL_GRID_CLASS} from './product-grid-layout';

/** Placeholder with ProductCard's footprint (4:5 stage, text block, actions). */
export function ProductCardSkeleton() {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card" aria-hidden="true">
            <div className="aspect-[4/5] animate-pulse bg-stage" />
            <div className="flex flex-1 flex-col border-t border-border p-3 sm:p-4">
                <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted" />
                <div className="mt-2.5 h-4 w-4/5 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-2.5 w-2/5 animate-pulse rounded bg-muted" />
                <div className="mt-5 h-6 w-1/2 animate-pulse rounded bg-muted" />
                <div className="mt-3 flex gap-2">
                    <div className="h-10 flex-1 animate-pulse rounded-lg bg-muted" />
                    <div className="size-10 animate-pulse rounded-lg bg-muted" />
                </div>
            </div>
        </div>
    );
}

export function ProductGridSkeleton({count = 12, variant = 'grid'}: {count?: number; variant?: 'grid' | 'rail'}) {
    return (
        <div role="status" aria-busy="true" className={variant === 'grid' ? PRODUCT_GRID_CLASS : PRODUCT_RAIL_GRID_CLASS}>
            {Array.from({length: count}).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}
