import {PRODUCT_GRID_CLASS, PRODUCT_RAIL_GRID_CLASS} from './product-grid-layout';

export function ProductCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card" aria-hidden="true">
            <div className="aspect-square animate-pulse bg-muted" />
            <div className="space-y-2.5 p-3 sm:p-4">
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
            </div>
        </div>
    );
}

export function ProductGridSkeleton({count = 12, variant = 'grid'}: {count?: number; variant?: 'grid' | 'rail'}) {
    return (
        <div className="space-y-6" role="status" aria-busy="true">
            {variant === 'grid' && (
                <div className="flex items-center justify-between">
                    <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-9 w-44 animate-pulse rounded-lg bg-muted" />
                </div>
            )}
            <div className={variant === 'grid' ? PRODUCT_GRID_CLASS : PRODUCT_RAIL_GRID_CLASS}>
                {Array.from({length: count}).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
