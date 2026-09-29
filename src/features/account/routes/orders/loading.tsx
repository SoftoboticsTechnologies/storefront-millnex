import {Skeleton} from '@/components/ui/skeleton';

/** Mirrors the orders list: heading band + order cards. */
export default function OrdersLoading() {
    return (
        <div aria-busy="true">
            <div className="mb-6 border-b border-border pb-6">
                <Skeleton className="h-10 w-56" />
            </div>

            <div className="space-y-3">
                {Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:p-5">
                        <div className="flex flex-1 items-center gap-4">
                            <Skeleton className="size-16 shrink-0 rounded-lg sm:size-20" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-1/2" />
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-5 w-24 rounded-md" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-9 w-28 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
