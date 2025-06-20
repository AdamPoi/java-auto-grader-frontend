export type TestResult = {
    testName: string;
    passed: boolean;
    output: string;
    error?: string;
};

export type SubmissionCode = {
    fileName: string;
    content: string;
};

export type TryOutSubmission = {
    id: string;
    studentId?: string;
    submissionCodes: SubmissionCode[];
    testResults?: TestResult[];
    status: 'pending' | 'testing' | 'completed' | 'failed';
};