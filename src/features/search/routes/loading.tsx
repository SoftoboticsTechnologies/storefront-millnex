import { SearchTermSkeleton } from '@/features/search/routes/search-term';
import { SearchResultsSkeleton } from '@/features/search/search-results-skeleton';

export default function SearchLoading() {
    return (
        <div className="site-container pb-16 pt-24 sm:pt-28">
            <SearchTermSkeleton />
            <SearchResultsSkeleton />
        </div>
    );
}
