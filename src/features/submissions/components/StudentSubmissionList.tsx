import { DataTablePagination } from '@/components/datatable/data-table-pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useSearch } from '@tanstack/react-router';
import React from 'react';
import type { Submission } from '../data/types';
import { useSubmissionsList } from '../hooks/use-submission';
import StudentSubmissionItem from './StudentSubmissionItem';

interface StudentSubmissionListProps {
    assignmentId?: string;
}

const StudentSubmissionList: React.FC<StudentSubmissionListProps> = ({ assignmentId }) => {
    const searchParams = useSearch({
        from: '/_authenticated/submissions/',
    }) as { page?: number; size?: number }; // Cast to include page and size

    const setSearchParams = (updater: (prev: { page?: number; size?: number }) => { page?: number; size?: number }) => {
        const newParams = updater({ page: searchParams.page, size: searchParams.size });
        // In a real application, you would use router.navigate or similar to update the URL.
        // For this mock implementation, we'll just log the change.
        console.log('Setting new search params:', newParams);
    };

    const { data: submissionsData, isLoading } = useSubmissionsList({
        page: searchParams.page as number || 0,
        size: searchParams.size as number || 10,
        filter: assignmentId ? `assignmentId=${assignmentId}` : undefined,
    });

    const handleViewDetails = (submission: Submission) => {
        // Implement navigation to submission details page or open a dialog
        console.log('View details for submission:', submission.id);
    };

    const handleDeleteSubmission = (id: string) => {
        // Implement actual delete logic here
        console.log('Delete submission:', id);
    };

    const handleResubmitSubmission = (id: string) => {
        // Implement actual resubmit logic here
        console.log('Resubmit submission:', id);
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading submissions...</div>;
    }

    const submissions = submissionsData?.content || [];
    const totalPages = submissionsData?.totalPages || 0;
    const currentPage = submissionsData?.number || 0;
    const totalElements = submissionsData?.totalElements || 0;
    const pageSize = submissionsData?.size || 10;

    return (
        <div className="space-y-4">
            <ScrollArea className="h-[calc(100vh-200px)] w-full rounded-md border p-4">
                <div className="space-y-4">
                    {submissions.length === 0 ? (
                        <p className="text-center text-gray-500">No submissions yet.</p>
                    ) : (
                        submissions.map((submission) => (
                            <React.Fragment key={submission.id}>
                                <StudentSubmissionItem
                                    submission={submission}
                                    onViewDetails={handleViewDetails}
                                    onDeleteSubmission={handleDeleteSubmission}
                                    onResubmitSubmission={handleResubmitSubmission}
                                />
                                <Separator />
                            </React.Fragment>
                        ))
                    )}
                </div>
            </ScrollArea>
            {totalElements > 0 && (
                <DataTablePagination
                    pageIndex={currentPage}
                    pageSize={pageSize}
                    pageCount={totalPages}
                    canPreviousPage={submissionsData?.hasPrevious || false}
                    canNextPage={submissionsData?.hasNext || false}
                    setPageIndex={(index) => setSearchParams((prev) => ({ ...prev, page: index }))}
                    setPageSize={(size) => setSearchParams((prev) => ({ ...prev, size: size, page: 0 }))}
                    totalElements={totalElements}
                />
            )}
        </div>
    );
};

export default StudentSubmissionList;