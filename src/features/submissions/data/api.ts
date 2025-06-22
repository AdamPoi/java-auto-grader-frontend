import type { SearchRequestParams, SearchResponse } from '@/types/api.types';
import type { Submission, SubmissionForm } from './types';

export const submissionApi = {
    getSubmissions: async (params: SearchRequestParams): Promise<SearchResponse<Submission>> => {
        // Mock data for initial development
        const mockSubmissions: Submission[] = [
            {
                id: 'sub1',
                submissionTime: '2025-06-18T10:00:00Z',
                attemptNumber: 1,
                status: 'GRADED',
                assignmentId: 'assign1',
                studentId: 'student1',
                submissionCodes: [
                    { id: 'code1', fileName: 'Main.java', sourceCode: 'public class Main { public static void main(String[] args) { System.out.println("Hello World"); } }', submissionId: 'sub1' }
                ],
                graderFeedback: 'Good job!',
                gradingCompletedAt: '2025-06-18T10:05:00Z'
            },
            {
                id: 'sub2',
                submissionTime: '2025-06-19T11:00:00Z',
                attemptNumber: 2,
                status: 'PENDING',
                assignmentId: 'assign1',
                studentId: 'student2',
                submissionCodes: [
                    { id: 'code2', fileName: 'Solution.java', sourceCode: 'public class Solution { /* code here */ }', submissionId: 'sub2' }
                ]
            },
            {
                id: 'sub3',
                submissionTime: '2025-06-19T12:00:00Z',
                attemptNumber: 1,
                status: 'FAILED',
                assignmentId: 'assign2',
                studentId: 'student1',
                submissionCodes: [
                    { id: 'code3', fileName: 'Test.java', sourceCode: 'public class Test { /* code with errors */ }', submissionId: 'sub3' }
                ],
                graderFeedback: 'Compilation error.',
                gradingCompletedAt: '2025-06-19T12:02:00Z'
            },
        ];

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Apply basic filtering/pagination if needed for mock data
        const filteredSubmissions = mockSubmissions.filter(sub => {
            if (params.filter) {
                // Example: filter by assignmentId
                if (params.filter.includes('assignmentId')) {
                    const assignmentId = params.filter.split('=')[1];
                    return sub.assignmentId === assignmentId;
                }
            }
            return true;
        });

        const startIndex = (params.page || 0) * (params.size || 10);
        const endIndex = startIndex + (params.size || 10);
        const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);

        return {
            content: paginatedSubmissions,
            totalElements: filteredSubmissions.length,
            totalPages: Math.ceil(filteredSubmissions.length / (params.size || 10)),
            size: params.size || 10,
            number: params.page || 0,
            first: startIndex === 0,
            last: endIndex >= filteredSubmissions.length,
            empty: filteredSubmissions.length === 0,
            page: params.page || 0,
            hasNext: endIndex < filteredSubmissions.length,
            hasPrevious: startIndex > 0,
        };
    },

    getSubmission: async (id: string): Promise<Submission> => {
        // Mock data for initial development
        const mockSubmissions: Submission[] = [
            {
                id: 'sub1',
                submissionTime: '2025-06-18T10:00:00Z',
                attemptNumber: 1,
                status: 'GRADED',
                assignmentId: 'assign1',
                studentId: 'student1',
                submissionCodes: [
                    { id: 'code1', fileName: 'Main.java', sourceCode: 'public class Main { public static void main(String[] args) { System.out.println("Hello World"); } }', submissionId: 'sub1' }
                ],
                graderFeedback: 'Good job!',
                gradingCompletedAt: '2025-06-18T10:05:00Z'
            },
            {
                id: 'sub2',
                submissionTime: '2025-06-19T11:00:00Z',
                attemptNumber: 2,
                status: 'PENDING',
                assignmentId: 'assign1',
                studentId: 'student2',
                submissionCodes: [
                    { id: 'code2', fileName: 'Solution.java', sourceCode: 'public class Solution { /* code here */ }', submissionId: 'sub2' }
                ]
            },
            {
                id: 'sub3',
                submissionTime: '2025-06-19T12:00:00Z',
                attemptNumber: 1,
                status: 'FAILED',
                assignmentId: 'assign2',
                studentId: 'student1',
                submissionCodes: [
                    { id: 'code3', fileName: 'Test.java', sourceCode: 'public class Test { /* code with errors */ }', submissionId: 'sub3' }
                ],
                graderFeedback: 'Compilation error.',
                gradingCompletedAt: '2025-06-19T12:02:00Z'
            },
        ];

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const submission = mockSubmissions.find(s => s.id === id);
        if (!submission) {
            throw new Error('Submission not found');
        }
        return submission;
    },

    createSubmission: async (data: SubmissionForm): Promise<Submission> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { id: `new-sub-${Date.now()}`, ...data, status: 'PENDING', attemptNumber: data.attemptNumber || 1 };
    },

    updateSubmission: async (id: string, data: Partial<SubmissionForm>): Promise<Submission> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { id, ...data, status: 'UPDATED', attemptNumber: data.attemptNumber || 1, assignmentId: data.assignmentId || '', studentId: data.studentId || '' };
    },

    deleteSubmission: async (id: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
    },
};