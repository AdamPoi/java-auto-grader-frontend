import type { SearchRequestParams } from '@/types/api.types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { PermissionApi } from '../data/permission-api';

const QUERY_KEY = "permisions";

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

export const usePermission = (params: SearchRequestParams) => {
    const query = useQuery({
        queryKey: getQueryKey({ action: 'list', params }),
        queryFn: async () => {
            const response = await PermissionApi.getPermissions(params);
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
                    return await PermissionApi.getPermissions(nextPageParams);
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
