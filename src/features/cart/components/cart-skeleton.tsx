import { Skeleton } from '@/components/ui/skeleton';

/** Mirrors the cart page grid (items 8/12, summary 4/12, stacked on phones). */
export function CartSkeleton() {
    return (
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-10" aria-busy="true">
            <div className="lg:col-span-8">
                <Skeleton className="mb-3 h-3 w-28" />
                <div className="divide-y divide-border rounded-xl border border-border bg-card">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex gap-3 p-4 sm:gap-5 sm:p-6">
                            <Skeleton className="size-24 shrink-0 rounded-xl sm:size-32" />
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between gap-3">
                                    <Skeleton className="h-5 w-3/5" />
                                    <Skeleton className="h-5 w-16" />
                                </div>
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-4 w-28" />
                                <div className="flex items-center justify-between pt-3">
                                    <Skeleton className="h-9 w-28 rounded-lg" />
                                    <Skeleton className="h-8 w-32 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4 lg:col-span-4 lg:pt-8">
                <div className="space-y-4 rounded-xl border border-border bg-card p-6">
                    <Skeleton className="h-6 w-36" />
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex justify-between border-t border-border pt-4">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>
        </div>
    );
}
