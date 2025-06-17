import type { SearchRequestParams } from '@/types/api.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { rubricApi } from '../data/api';
import type { RubricForm } from '../data/types';


const QUERY_KEY = "rubrics";

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


export const useRubrics = (params: SearchRequestParams) => {
    const query = useQuery({
        queryKey: getQueryKey({
            action: 'list',
            params
        }),
        queryFn: async () => {
            const response = await rubricApi.getRubrics(params);
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
                    return await rubricApi.getRubrics(nextPageParams);
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

export const useRubricById = (id: string) => {
    return useQuery({
        queryKey: [QUERY_KEY, id],
        queryFn: async () => {
            const response = await rubricApi.getRubric(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateRubric = (onSuccess?: () => void, onError?: (error: Error) => void) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: (rubricData: RubricForm) => rubricApi.createRubric(rubricData),
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

export const useUpdateRubric = (onSuccess?: () => void, onError?: (error: Error) => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ rubricId, rubricData }: { rubricId: string, rubricData: Partial<RubricForm> }) => rubricApi.updateRubric(rubricId, rubricData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: getQueryKey({ action: 'list' }) });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.rubricId] });
            onSuccess?.();
        },
        onError: (error) => {
            onError?.(error);
        },
    });
};

export const useDeleteRubric = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: rubricApi.deleteRubric,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey({ action: 'list' }) });
        },
    });
};