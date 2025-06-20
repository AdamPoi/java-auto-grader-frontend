import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { FileData } from '@/features/code-editor/hooks/use-file-management';
import React from 'react';
import type { TryOutSubmission } from '../data/types';
import TryOutSubmissionItem from './try-out-submission-item';

interface TryOutSubmissionListProps {
    submissions: TryOutSubmission[];
    onTestSubmission: (id: string, submissionCodes: FileData[]) => void;
    onCodeChange: (id: string, files: FileData[]) => void;
    onDeleteSubmission: (id: string) => void;
    onStudentChange: (id: string, studentId: string) => void;
}

const TryOutSubmissionList: React.FC<TryOutSubmissionListProps> = ({ submissions, onTestSubmission, onCodeChange, onDeleteSubmission, onStudentChange }) => {
    return (
        <ScrollArea className="h-[calc(100vh-200px)] w-full rounded-md border p-4">
            <div className="space-y-4">
                {submissions.length === 0 ? (
                    <p className="text-center text-gray-500">No submissions yet. Upload a file to get started!</p>
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