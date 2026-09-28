import {ProductGridSkeleton} from '@/features/products/product-grid-skeleton';

export function SearchResultsSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[16rem_1fr]">
            {/* Filters Sidebar */}
            <aside>
                <div className="h-11 animate-pulse rounded-xl bg-muted lg:h-72" />
            </aside>

            {/* Product Grid */}
            <ProductGridSkeleton />
        </div>
    );
}
