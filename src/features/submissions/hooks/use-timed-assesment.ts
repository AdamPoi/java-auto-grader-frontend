import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { timedAssessmentApi } from '../data/timed-assesment-api';
import type { TestSubmitRequest } from '../data/types';

export function useTimedAssessmentStart(assignmentId: string) {
    return useMutation({
        mutationFn: () => timedAssessmentApi.start(assignmentId),
    });
}

export function useTimedAssessmentStatus(assignmentId: string, options?: { enabled?: boolean; refetchInterval?: number }) {
    return useQuery({
        queryKey: ['timedAssessmentStatus', assignmentId],
        queryFn: () => timedAssessmentApi.status(assignmentId),
        enabled: !!assignmentId && (options?.enabled ?? true),
        refetchInterval: options?.refetchInterval,
    });
}

export function useTimedAssessmentSubmit(assignmentId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: TestSubmitRequest) =>
            timedAssessmentApi.submit(assignmentId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timedAssessmentStatus', assignmentId] });
            queryClient.invalidateQueries({ queryKey: ['submissions'] });
        },
    });
}
