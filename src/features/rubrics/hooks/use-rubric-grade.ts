import type { SearchRequestParams } from '@/types/api.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { rubricGradeApi } from '../data/rubric-grade-api';
import type { RubricGradeForm } from '../data/types';


const QUERY_KEY = "rubricGrades";

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


export const useRubricGrades = (params: SearchRequestParams) => {
    const query = useQuery({
        queryKey: getQueryKey({
            action: 'list',
            params
        }),
        queryFn: async () => {
            const response = await rubricGradeApi.getRubricGrades(params);
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
                    return await rubricGradeApi.getRubricGrades(nextPageParams);
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

export const useRubricGradeById = (id: string) => {
    return useQuery({
        queryKey: [QUERY_KEY, id],
        queryFn: async () => {
            const response = await rubricGradeApi.getRubricGrade(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateRubricGrade = (onSuccess?: () => void, onError?: (error: Error) => void) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: (rubricGradeData: RubricGradeForm) => rubricGradeApi.createRubricGrade(rubricGradeData),
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

export const useSaveManyRubricGrades = (onSuccess?: () => void, onError?: (error: Error) => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ assignmentId, rubricGradeData }: { assignmentId: string, rubricGradeData: RubricGradeForm[] }) =>
            rubricGradeApi.saveManyRubricGradeByAssignment(assignmentId, rubricGradeData), onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: getQueryKey({ action: 'list' }) });
                onSuccess?.();
            },
        onError: (error) => {
            onError?.(error);
        },
    });
};

export const useUpdateRubricGrade = (onSuccess?: () => void, onError?: (error: Error) => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ rubricGradeId, rubricGradeData }: { rubricGradeId: string, rubricGradeData: Partial<RubricGradeForm> }) => rubricGradeApi.updateRubricGrade(rubricGradeId, rubricGradeData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: getQueryKey({ action: 'list' }) });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.rubricGradeId] });
            onSuccess?.();
        },
        onError: (error) => {
            onError?.(error);
        },
    });
};

export const useDeleteRubricGrade = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: rubricGradeApi.deleteRubricGrade,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey({ action: 'list' }) });
        },
    });
};

export const useRubricGradesByAssignment = (assignmentId: string) => {

    const query = useQuery({
        queryKey: getQueryKey({
            action: 'list',
        }),
        queryFn: async () => {
            const response = await rubricGradeApi.getRubricGradesByAssignmentId(assignmentId);
            return response;
        },
        enabled: !!assignmentId,
    });
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