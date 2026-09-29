import {ProductGridSkeleton} from '@/features/products/product-grid-skeleton';

export default function WishlistLoading() {
    return (
        <>
            <div className="border-b border-border bg-surface pb-10 pt-28 sm:pb-14 sm:pt-32 lg:pt-40" aria-hidden="true">
                <div className="site-container">
                    <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                    <div className="mt-5 h-12 w-64 animate-pulse rounded-lg bg-muted sm:h-14 sm:w-80" />
                    <div className="mt-4 h-5 w-full max-w-xl animate-pulse rounded bg-muted" />
                </div>
            </div>
            <div className="site-container py-10 sm:py-14 lg:py-16">
                <ProductGridSkeleton count={4} />
            </div>
        </>
    );
}
