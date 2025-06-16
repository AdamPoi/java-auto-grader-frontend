import type { SearchRequestParams } from '@/types/api.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ClassroomApi } from '../data/api';
import type { ClassroomForm } from '../data/types';


const QUERY_KEY = "classrooms";

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


export const useClassroom = (params: SearchRequestParams) => {
    const query = useQuery({
        queryKey: getQueryKey({
            action: 'list',
            params
        }),
        queryFn: async () => {
            const response = await ClassroomApi.getClassrooms(params);
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
                    return await ClassroomApi.getClassrooms(nextPageParams);
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

export const useClassroomById = (id: string) => {
    return useQuery({
        queryKey: [QUERY_KEY, id],
        queryFn: async () => {
            const response = await ClassroomApi.getClassroom(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateClassroom = (onSuccess?: () => void, onError?: (error: Error) => void) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: (classroomData: ClassroomForm) => ClassroomApi.createClassroom(classroomData),
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

export const useUpdateClassroom = (onSuccess?: () => void, onError?: (error: Error) => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ classroomId, classroomData }: { classroomId: string, classroomData: Partial<ClassroomForm> }) => ClassroomApi.updateClassroom(classroomId, classroomData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: getQueryKey({ action: 'list' }) });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.classroomId] });
            onSuccess?.();
        },
        onError: (error) => {
            onError?.(error);
        },
    });
};

export const useDeleteClassroom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ClassroomApi.deleteClassroom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey({ action: 'list' }) });
        },
    });
};