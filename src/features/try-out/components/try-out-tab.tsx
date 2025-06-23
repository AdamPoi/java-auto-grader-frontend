import type { FileData } from '@/features/code-editor/hooks/use-file-management';
import { useCreateSubmission, useDeleteSubmission, useSubmissionsList, useUpdateSubmission } from '@/features/submissions/hooks/use-submission';
import { useParams } from '@tanstack/react-router';
import React, { useCallback } from 'react';
import FileUploadArea from './file-upload-area';
import TryOutSubmissionList from './try-out-submission-list';

const TryOutTab: React.FC = () => {
    const { assignmentId } = useParams({ from: '/_authenticated/assignments/$assignmentId/' });
    const { data: submissionsData, isLoading: isLoadingSubmissions, refetch } = useSubmissionsList({
        page: 0,
        size: 100,
        filter: `assignment=eq:${assignmentId}`,
    });

    const submissions = submissionsData?.content || [];

    const createSubmissionMutation = useCreateSubmission();
    const updateSubmissionMutation = useUpdateSubmission();
    const deleteSubmissionMutation = useDeleteSubmission();

    const handleFilesUpload = useCallback((files: FileData[]) => {
        if (files.length === 0) {
            return;
        }

        const submissionData = {
            submissionCodes: files.map(file => ({
                fileName: file.fileName,
                sourceCode: file.content,
            })),
            status: 'uploaded',
            assignmentId,
        };

        createSubmissionMutation.mutate(submissionData, {
            onSuccess: () => {
                refetch();
            },
            onError: (error) => {
                console.error('Failed to create submission:', error);
            }
        });
    }, [createSubmissionMutation, refetch, assignmentId]);

    const handleDeleteSubmission = useCallback((id: string) => {
        deleteSubmissionMutation.mutate(id, {
            onSuccess: () => {
                refetch();
            },
            onError: (error) => {
                console.error('Failed to delete submission:', error);
            }
        });
    }, [deleteSubmissionMutation, refetch]);

    const handleCodeChange = useCallback((id: string, files: FileData[]) => {
        const submissionCodes = files.map(file => ({
            fileName: file.fileName,
            sourceCode: file.content,
        }));

        updateSubmissionMutation.mutate({
            id,
            data: { submissionCodes }
        }, {
            onSuccess: () => {
                refetch();
            },
            onError: (error) => {
                console.error('Failed to update submission code:', error);
            }
        });
    }, [updateSubmissionMutation, refetch]);

    const handleTestSubmission = useCallback((id: string, submissionCodes: FileData[]) => {
        updateSubmissionMutation.mutate({
            id,
            data: {
                status: 'testing',
                submissionCodes: submissionCodes.map(file => ({
                    fileName: file.fileName,
                    sourceCode: file.content,
                }))
            }
        }, {
            onSuccess: () => {
                refetch();

                setTimeout(() => {
                    const passed = Math.random() > 0.5;
                    updateSubmissionMutation.mutate({
                        id,
                        data: {
                            status: passed ? 'completed' : 'failed',
                            feedback: passed ? 'All tests passed!' : 'Some tests failed.',
                        }
                    }, {
                        onSuccess: () => {
                            refetch();
                        },
                        onError: (error) => {
                            console.error('Failed to update submission test result:', error);
                        }
                    });
                }, 2000);
            },
            onError: (error) => {
                console.error('Failed to start submission test:', error);
            }
        });
    }, [updateSubmissionMutation, refetch]);

    const handleStudentChange = useCallback((id: string, studentId: string) => {
        updateSubmissionMutation.mutate({
            id,
            data: { studentId }
        }, {
            onSuccess: () => {
                refetch();
            },
            onError: (error) => {
                console.error('Failed to update student assignment:', error);
            }
        });
    }, [updateSubmissionMutation, refetch]);

    return (
        <div className="space-y-6 p-4">
            <FileUploadArea onFilesUpload={handleFilesUpload} />
            <TryOutSubmissionList
                submissions={submissions}
                onTestSubmission={handleTestSubmission}
                onCodeChange={handleCodeChange}
                onDeleteSubmission={handleDeleteSubmission}
                onStudentChange={handleStudentChange}
                onRefetch={refetch}
                assignmentId={assignmentId}
            />
        </div>
    );
};

export default TryOutTab;