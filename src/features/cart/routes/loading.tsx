import { Skeleton } from '@/components/ui/skeleton';
import { CartSkeleton } from '@/features/cart/components/cart-skeleton';

export default function CartLoading() {
    return (
        <div className="site-container pb-20 pt-24 sm:pt-28 lg:pt-36">
            <div className="mb-8 border-b border-border pb-6 sm:mb-10">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-3 h-10 w-64 sm:h-12" />
            </div>
            <CartSkeleton />
        </div>
    );
}
