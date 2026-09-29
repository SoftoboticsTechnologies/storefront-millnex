import {ListingBannerSkeleton} from '@/components/listing-banner';
import {CategoryTabsSkeleton} from '@/features/search/category-tabs';
import {SearchResultsSkeleton} from '@/features/search/search-results-skeleton';

export default function ShopLoading() {
    return (
        <div>
            <ListingBannerSkeleton />
            <CategoryTabsSkeleton />
            <div className="site-container pb-16 lg:pb-24">
                <SearchResultsSkeleton />
            </div>
        </div>
    );
}
