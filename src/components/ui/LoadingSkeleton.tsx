export default function LoadingSkeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded-2xl ${className}`}></div>
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="animate-pulse space-y-4">
                <LoadingSkeleton className="h-6 w-3/4" />
                <LoadingSkeleton className="h-4 w-1/2" />
                <LoadingSkeleton className="h-32 w-full" />
                <div className="flex gap-2">
                    <LoadingSkeleton className="h-10 w-24" />
                    <LoadingSkeleton className="h-10 w-24" />
                </div>
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                    <LoadingSkeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <LoadingSkeleton className="h-4 w-3/4" />
                        <LoadingSkeleton className="h-3 w-1/2" />
                    </div>
                    <LoadingSkeleton className="h-8 w-20" />
                </div>
            ))}
        </div>
    );
}

