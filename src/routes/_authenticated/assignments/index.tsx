import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AssignmentsList } from '@/features/assignments/components/assignments-list';
import { getAllAssignments } from '@/features/assignments/data/api';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

function AssignmentsPage() {
    const { data: assignments, isLoading, isError } = useQuery({
        queryKey: ['assignments'],
        queryFn: getAllAssignments,
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-24 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 text-center text-red-500">
                Failed to load assignments. Please try again later.
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Assignments</h2>
            {assignments && assignments.length > 0 ? (
                <AssignmentsList assignments={assignments} />
            ) : (
                <p className="text-center text-gray-500">No assignments found.</p>
            )}
        </div>
    );
}

export const Route = createFileRoute('/_authenticated/assignments/')({
    component: AssignmentsPage,
});
