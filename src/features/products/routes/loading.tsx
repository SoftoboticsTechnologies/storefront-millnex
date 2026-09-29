import { Skeleton } from '@/components/ui/skeleton';

/** Mirrors routes/page.tsx: breadcrumb, gallery + thumbnails, info column, tabs. */
export default function ProductLoading() {
    return (
        <div aria-busy="true" role="status">
            <div className="site-container pb-16 pt-24 sm:pt-28 lg:pb-24">
                <Skeleton className="mb-6 h-4 w-64 max-w-full sm:mb-8" />

                <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-14 xl:gap-20">
                    {/* Gallery */}
                    <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
                        <Skeleton className="aspect-square w-full rounded-2xl" />
                        <div className="mt-3 flex gap-2.5 overflow-hidden sm:mt-4 sm:gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="size-16 shrink-0 rounded-lg sm:size-20" />
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 space-y-7">
                        <div className="space-y-4">
                            <Skeleton className="h-7 w-40 rounded-md" />
                            <Skeleton className="h-10 w-11/12 sm:h-12" />
                            <Skeleton className="h-10 w-2/3 sm:h-12" />
                            <Skeleton className="h-3 w-28" />
                        </div>
                        <div className="flex items-center justify-between border-y border-border py-5">
                            <Skeleton className="h-8 w-36" />
                            <Skeleton className="h-7 w-28 rounded-full" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-3 w-16" />
                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-11 w-full rounded-lg" />
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Skeleton className="h-12 w-full rounded-lg" />
                            <Skeleton className="h-12 w-full rounded-lg" />
                        </div>
                        <div className="grid gap-2.5 min-[420px]:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-11 w-full rounded-lg" />
                            ))}
                        </div>
                        <div className="grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-5 w-4/5" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-border py-16 sm:py-20">
                <div className="site-container">
                    <Skeleton className="h-3 w-32" />
                    <div className="mt-6 flex gap-6 overflow-hidden border-b border-border pb-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-5 w-28 shrink-0" />
                        ))}
                    </div>
                    <Skeleton className="mt-8 h-48 w-full rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
