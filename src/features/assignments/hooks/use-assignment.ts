import type { SearchRequestParams } from '@/types/api.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { assignmentApi } from '../data/api';
import type { AssignmentForm } from '../data/types';


const QUERY_KEY = "assignments";

export function getQueryKey({ action, params }: { action?: String, params?: SearchRequestParams }) {
    let key = []
    if (action) {
        key.push(action)
    }
    key.push(QUERY_KEY)
    if (params) {
        key.push(params)
    }
    return key;
}


export const useAssignment = (params: SearchRequestParams) => {
    const query = useQuery({
        queryKey: getQueryKey({
            action: 'list',
            params
        }),
        queryFn: async () => {
            const response = await assignmentApi.getAssignments(params);
            return response;
        },
    });


    const queryClient = useQueryClient();
    useEffect(() => {
        if (query.data?.hasNext) {
            const nextPageParams = { ...params, page: params.page + 1 };
            queryClient.prefetchQuery({
                queryKey: getQueryKey({ action: 'list', params: nextPageParams }),
                queryFn: async () => {
                    return await assignmentApi.getAssignments(nextPageParams);
                },
            });
        }
    }, [query.data, params, queryClient]);

    return {
        data: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: async () => {
            await query.refetch();
        },
    };
};

export const useAssignmentById = (id: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: [QUERY_KEY, id],
        queryFn: async () => {
            const response = await assignmentApi.getAssignment(id);
            return response;
        },
        enabled: options?.enabled ?? !!id,
    });
};

export const useCreateAssignment = (onSuccess?: () => void, onError?: (error: Error) => void) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: (assignmentData: AssignmentForm) => assignmentApi.createAssignment(assignmentData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey({ action: 'list' }) });
            onSuccess?.();
        },
        onError: (error) => {
            onError?.(error);
        },
    });
    return mutation;
};

export const useUpdateAssignment = (onSuccess?: () => void, onError?: (error: Error) => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ assignmentId, assignmentData }: { assignmentId: string, assignmentData: Partial<AssignmentForm> }) => assignmentApi.updateAssignment(assignmentId, assignmentData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: getQueryKey({ action: 'list' }) });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.assignmentId] });
            onSuccess?.();
        },
        onError: (error) => {
            onError?.(error);
        },
    });
};

export const useDeleteAssignment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: assignmentApi.deleteAssignment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey({ action: 'list' }) });
        },
    });
};