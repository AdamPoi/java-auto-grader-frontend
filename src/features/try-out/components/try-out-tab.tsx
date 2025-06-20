import type { FileData } from '@/features/code-editor/hooks/use-file-management';
import React, { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { TestResult, TryOutSubmission } from '../data/types';
import FileUploadArea from './file-upload-area';
import TryOutSubmissionList from './try-out-submission-list';

const TryOutTab: React.FC = () => {
    const handleDeleteSubmission = useCallback((id: string) => {
        setSubmissions(prev => prev.filter(submission => submission.id !== id));
    }, []);
    const [submissions, setSubmissions] = useState<TryOutSubmission[]>([]);

    const handleFilesUpload = useCallback((files: FileData[]) => {
        if (files.length === 0) {
            return;
        }

        const submissionCodes = files.map(file => ({
            fileName: file.fileName,
            content: file.content,
        }));

        const newSubmission: TryOutSubmission = {
            id: uuidv4(),
            submissionCodes: submissionCodes,
            status: 'pending',
        };
        setSubmissions(prev => [...prev, newSubmission]);
    }, []);

    const handleCodeChange = useCallback((id: string, files: FileData[]) => {
        setSubmissions(prevSubmissions =>
            prevSubmissions.map(submission =>
                submission.id === id
                    ? { ...submission, submissionCodes: files }
                    : submission
            )
        );
    }, []);

    const handleTestSubmission = useCallback((id: string, submissionCodes: FileData[]) => {
        setSubmissions(prevSubmissions =>
            prevSubmissions.map(submission =>
                submission.id === id
                    ? {
                        ...submission,
                        status: 'testing',
                        submissionCodes: submissionCodes, // Update submissionCodes with the latest from editor
                    }
                    : submission
            )
        );

        setTimeout(() => {
            setSubmissions(prevSubmissions =>
                prevSubmissions.map(submission => {
                    if (submission.id === id) {
                        const passed = Math.random() > 0.5; // Simulate random pass/fail
                        const mockTestResults: TestResult[] = [
                            { testName: 'Test Case 1', passed: passed, output: passed ? 'Output for Test 1: Success' : 'Output for Test 1: Failure' },
                            { testName: 'Test Case 2', passed: !passed, output: !passed ? 'Output for Test 2: Success' : 'Output for Test 2: Failure' },
                        ];
                        return {
                            ...submission,
                            status: passed ? 'completed' : 'failed',
                            testResults: mockTestResults,
                        };
                    }
                    return submission;
                })
            );
        }, 2000); // Simulate 2-second test run
    }, []);
    const handleStudentChange = useCallback((id: string, studentId: string) => {
        setSubmissions(prevSubmissions =>
            prevSubmissions.map(submission =>
                submission.id === id
                    ? { ...submission, studentId: studentId }
                    : submission
            )
        );
    }, []);
    return (
        <div className="space-y-6 p-4">
            <FileUploadArea onFilesUpload={handleFilesUpload} />
            <TryOutSubmissionList
                submissions={submissions}
                onTestSubmission={handleTestSubmission}
                onCodeChange={handleCodeChange}
                onDeleteSubmission={handleDeleteSubmission}
                onStudentChange={handleStudentChange}
            />
        </div>
    );
};

export default TryOutTab;