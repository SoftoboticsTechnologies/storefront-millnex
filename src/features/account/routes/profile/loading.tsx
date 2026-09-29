import {Skeleton} from '@/components/ui/skeleton';

/** Mirrors the profile page: heading band + three form cards. */
export default function ProfileLoading() {
    return (
        <div className="space-y-6" aria-busy="true">
            <div className="border-b border-border pb-6">
                <Skeleton className="h-10 w-56" />
                <Skeleton className="mt-3 h-4 w-64 max-w-full" />
            </div>

            {[2, 3, 3].map((fields, i) => (
                <div key={i} className="space-y-5 rounded-xl border border-border bg-card p-6">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-44" />
                        <Skeleton className="h-4 w-64 max-w-full" />
                    </div>
                    {Array.from({length: fields}).map((_, j) => (
                        <div key={j} className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-10 w-full rounded-lg" />
                        </div>
                    ))}
                    <Skeleton className="h-10 w-36 rounded-lg" />
                </div>
            ))}
        </div>
    );
}
