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
};