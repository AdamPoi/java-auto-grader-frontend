import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StudentCoursekeletonCard() {
    return (
        <Card className="flex flex-col">
            <CardHeader className="p-0">
                <Skeleton className="h-48 w-full rounded-t-lg" />
            </CardHeader>
            <CardContent className="flex-1 p-6">
                <Skeleton className="h-4 w-1/3 mb-4" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6 mt-1" />
            </CardContent>
            <CardFooter className="p-6 pt-0 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-10 w-24" />
            </CardFooter>
        </Card>
    );
}