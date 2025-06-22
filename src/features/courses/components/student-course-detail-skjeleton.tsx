import { Skeleton } from "@/components/ui/skeleton";

export function StudentCourseDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                <div className="md:col-span-2 space-y-6">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-96 w-full rounded-lg" />
                    <Skeleton className="h-8 w-1/4 mt-8" />
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-5/6" />
                        <Skeleton className="h-5 w-full" />
                    </div>
                </div>

                <div className="space-y-6">
                    <Skeleton className="h-80 w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
}