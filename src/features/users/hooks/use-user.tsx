import type { SearchRequestParams } from '@/types/api.types'; // Corrected import
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { UserApi } from '../data/api';


const QUERY_KEY = "users";

export function getQueryKey(params: SearchRequestParams) {
    return [QUERY_KEY, params];
}

export const useUsers = (params: SearchRequestParams) => {
    const query = useQuery({
        queryKey: getQueryKey(params),
        queryFn: async () => {
            const response = await UserApi.getUsers(params);
            return response;
        },
    });


    const queryClient = useQueryClient();
    useEffect(() => {
        if (query.data?.hasNext) {
            const nextPageParams = { ...params, page: params.page + 1 };
            queryClient.prefetchQuery({
                queryKey: getQueryKey(nextPageParams),
                queryFn: async () => {
                    return await UserApi.getUsers(nextPageParams);
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
