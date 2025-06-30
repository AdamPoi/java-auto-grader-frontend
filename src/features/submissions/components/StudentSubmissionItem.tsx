import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import CodeEditor from '@/features/code-editor';
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { Trash2 } from "lucide-react";
import React, { useState } from 'react';
import type { Submission } from '../data/types';

interface StudentSubmissionItemProps {
    submission: Submission;
    onViewDetails: (submission: Submission) => void;
    onDeleteSubmission: (id: string) => void;
    onResubmitSubmission: (id: string) => void;
}

const StudentSubmissionItem: React.FC<StudentSubmissionItemProps> = ({
    submission,
    onViewDetails,
    onDeleteSubmission,
    onResubmitSubmission,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'GRADED':
                return 'default';
            case 'PENDING':
                return 'secondary';
            case 'FAILED':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={(open) => setIsOpen(open)}
            className="w-full space-y-2 border rounded-md p-4"
        >
            <div className="flex items-center justify-between space-x-4 px-4">
                <h4 className="text-sm font-semibold flex-grow">
                    Submission ID: {submission.id.substring(0, 8)}... - Attempt: {submission.attemptNumber}
                </h4>
                <div className="flex items-center space-x-2">
                    <Badge variant={getStatusBadgeVariant(submission.status)}>
                        {submission.status}
                    </Badge>
                    {submission.submissionTime && (
                        <span className="text-sm text-gray-500">
                            {format(new Date(submission.submissionTime), 'PPP p')}
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(submission)}
                        title="View details"
                    >
                        View Details
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                title="Delete submission"
                            >
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    submission and remove its data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDeleteSubmission(submission.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResubmitSubmission(submission.id)}
                        title="Resubmit submission"
                    >
                        Resubmit
                    </Button>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                            {isOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                            <span className="sr-only">Toggle</span>
                        </Button>
                    </CollapsibleTrigger>
                </div>
            </div>
            <CollapsibleContent className="space-y-2">
                {submission.submissionCodes && submission.submissionCodes.length > 0 && (
                    <div className="border rounded-md p-2">
                        <h5 className="text-sm font-medium mb-2">Submitted Code:</h5>
                        <CodeEditor
                            initialFilesData={submission.submissionCodes.map(code => ({
                                fileName: code.fileName,
                                content: code.sourceCode,
                            }))}
                            onFileChange={() => { }} // Read-only in this view
                            readOnly={true}
                        />
                    </div>
                )}
                {submission.graderFeedback && (
                    <div className="border rounded-md p-2">
                        <h5 className="text-sm font-medium mb-2">Grader Feedback:</h5>
                        <p className="text-sm text-gray-700">{submission.graderFeedback}</p>
                    </div>
                )}
            </CollapsibleContent>
        </Collapsible>
    );
};

export default StudentSubmissionItem;