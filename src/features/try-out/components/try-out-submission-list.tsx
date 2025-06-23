import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { FileData } from '@/features/code-editor/hooks/use-file-management';
import type { Submission } from '@/features/submissions/data/types';
import React from 'react';
import TryOutSubmissionItem from './try-out-submission-item';

interface TryOutSubmissionListProps {
    submissions: Submission[];
    assignmentId: string;
    onTestSubmission: (id: string, submissionCodes: FileData[]) => void;
    onCodeChange: (id: string, files: FileData[]) => void;
    onDeleteSubmission: (id: string) => void;
    onStudentChange: (id: string, studentId: string) => void;
    onRefetch: () => void;
}

const TryOutSubmissionList: React.FC<TryOutSubmissionListProps> = ({ submissions,
    assignmentId,
    onTestSubmission,
    onCodeChange,
    onDeleteSubmission,
    onStudentChange,
    onRefetch }) => {
    return (
        <ScrollArea className="h-full w-full rounded-md border p-4">
            <div className="space-y-4">
                {/* Add button to create new submission */}
                <TryOutSubmissionItem
                    isNew={true}
                    assignmentId={assignmentId}
                    onRefetch={onRefetch}
                />
                <Separator />

                {submissions.length === 0 ? (
                    <p className="text-center text-gray-500">No submissions yet. Create one above to get started!</p>
                ) : (
                    submissions.map((submission) => (
                        <React.Fragment key={submission.id}>
                            <TryOutSubmissionItem
                                submission={submission}
                                onTestSubmission={onTestSubmission}
                                onCodeChange={onCodeChange}
                                onDeleteSubmission={onDeleteSubmission}
                                onStudentChange={(studentId) => onStudentChange(submission.id, studentId)}
                            />
                            <Separator />
                        </React.Fragment>
                    ))
                )}
            </div>
        </ScrollArea>
    );
};
export default TryOutSubmissionList;