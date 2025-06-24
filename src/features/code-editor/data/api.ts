import type { Submission, TestExecutionForm, TestSubmitRequest } from '@/features/submissions/data/types';
import { apiClient } from '@/lib/apiClient';
import type { ExecutionResult, JavaProject, TestExecutionResult, TestJavaProject } from './types';

export const CodeRunnerApi = {
    runCode: async (javaProject: JavaProject): Promise<ExecutionResult> => {
        const response = await apiClient.post<JavaProject, ExecutionResult>({
            url: '/submission-codes/run',
            data: javaProject,
        });
        return response;
    },
    testCode: async (javaProject: TestJavaProject): Promise<TestExecutionResult> => {
        const response = await apiClient.post<TestJavaProject, TestExecutionResult>({
            url: '/submission-codes/test',
            data: javaProject,
        });
        return response;
    },

    testSubmissionCode: async (submission: TestSubmitRequest): Promise<Submission> => {
        const response = await apiClient.post<TestSubmitRequest, Submission>({
            url: '/test-executions/test',
            data: submission,
        });
        return response;
    },
};