import { Skeleton } from '@/components/ui/skeleton';

export default function AddressesLoading() {
    return (
        <div className="space-y-6" aria-busy="true">
            <div className="border-b border-border pb-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="mt-3 h-4 w-72 max-w-full" />
            </div>

            <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-40 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-4 rounded-xl border border-border bg-card p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-5 w-32 rounded-md" />
                            </div>
                            <Skeleton className="size-9 rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-56 max-w-full" />
                            <Skeleton className="h-4 w-44" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
