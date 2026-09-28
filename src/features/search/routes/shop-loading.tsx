import {ListingBannerSkeleton} from '@/components/listing-banner';
import {SearchResultsSkeleton} from '@/features/search/search-results-skeleton';

export default function ShopLoading() {
    return (
        <div className="pb-16 pt-24 sm:pt-28">
            <div className="site-container">
                <div className="mb-4 h-4 w-40 animate-pulse rounded bg-muted" />
            </div>
            <ListingBannerSkeleton />
            <div className="site-container">
                <SearchResultsSkeleton />
            </div>
        </div>
    );
}
