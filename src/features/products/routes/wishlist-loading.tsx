import {ProductGridSkeleton} from '@/features/products/product-grid-skeleton';

export default function WishlistLoading() {
    return (
        <div className="site-container pb-16 pt-24 sm:pt-28">
            <div className="mb-8 h-9 w-48 animate-pulse rounded bg-muted" />
            <ProductGridSkeleton count={4} />
        </div>
    );
}
