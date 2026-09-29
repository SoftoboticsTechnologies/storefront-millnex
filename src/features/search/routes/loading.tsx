import {ListingBannerSkeleton} from '@/components/listing-banner';
import {SearchResultsSkeleton} from '@/features/search/search-results-skeleton';

export default function SearchLoading() {
    return (
        <div>
            <ListingBannerSkeleton />
            <div className="site-container pb-16 lg:pb-24">
                <SearchResultsSkeleton />
            </div>
        </div>
    );
}
