import { apiClient } from '@/lib/apiClient';
import type { ExecutionResult, JavaProject } from './types';

export const CodeRunnerApi = {
    runCode: async (javaProject: JavaProject): Promise<ExecutionResult> => {
        const response = await apiClient.post<JavaProject, ExecutionResult>({
            url: '/submission-codes/run',
            data: javaProject,
        });
        return response;
    },
};