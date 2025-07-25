import type { StudentSubmissionAiFeedbackRequest, SubmissionForm, TestSubmitRequest } from '@/features/submissions/data/types';
import type { SearchRequestParams } from '@/types/api.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { submissionApi } from '../data/api';

export function useSubmissionsList(params: SearchRequestParams, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['submissions', params],
        queryFn: () => submissionApi.getSubmissions(params),
        enabled: options?.enabled ?? true,
    });
}

export function useSubmission(id: string, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['submission', id],
        queryFn: () => submissionApi.getSubmission(id),
        enabled: options?.enabled ?? !!id,
    });
}

export function useCreateSubmission() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: SubmissionForm) => submissionApi.createSubmission(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions'] });
        },
    });
}

export function useUpdateSubmission() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<SubmissionForm> }) =>
            submissionApi.updateSubmission(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions'] });
            queryClient.invalidateQueries({ queryKey: ['submission'] });
        },
    });
}

export function useDeleteSubmission() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => submissionApi.deleteSubmission(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions'] });
        },
    });
}

export function useTryOutSubmission() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: TestSubmitRequest) => submissionApi.tryOutSubmission(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions'] });
        },
    });
}

export function useSubmitStudentSubmission() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: TestSubmitRequest) => submissionApi.submitStudentSubmission(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions'] });
        },
    });
}


export function useAiCodeFeedback() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ data }: { data: StudentSubmissionAiFeedbackRequest }) =>
            submissionApi.getAiCodeFeedback(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions'] });
        }
    });
}
// export function useBulkSubmission() {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: (data: TestSubmitRequest) => submissionApi.submitBulkStudentSubmission(data),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['submissions'] });
//         },
//     });
// }