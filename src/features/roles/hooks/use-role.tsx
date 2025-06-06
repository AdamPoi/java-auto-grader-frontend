import type { SearchRequestParams } from '@/types/api.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { RoleApi } from '../data/api';
import type { RoleForm } from '../data/schema';


const QUERY_KEY = "roles";

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


export const useRole = (params: SearchRequestParams) => {
    const query = useQuery({
        queryKey: getQueryKey({
            action: 'list',
            params
        }),
        queryFn: async () => {
            const response = await RoleApi.getRoles(params);
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
                    return await RoleApi.getRoles(nextPageParams);
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

export const useCreateRole = (onSuccess?: () => void, onError?: (error: Error) => void) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: (roleData: RoleForm) => RoleApi.createRole(roleData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey({ action: 'create' }) });
            onSuccess?.();
        },
        onError: (error) => {
            onError?.(error);
        },
    });
    return mutation;
};

export const useUpdateRole = (onSuccess?: () => void, onError?: (error: Error) => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ roleId, roleData }: { roleId: string, roleData: Partial<RoleForm> }) => RoleApi.updateRole(roleId, roleData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey({ action: 'update' }) });
            onSuccess?.();
        },
        onError: (error) => {
            onError?.(error);
        },
    });
};

export const useDeleteRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: RoleApi.deleteRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey({ action: 'delete' }) });
        },
    });
};