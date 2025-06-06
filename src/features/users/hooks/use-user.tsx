import type { SearchRequestParams } from '@/types/api.types'; // Corrected import
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { UserApi } from '../data/api';
import { type User } from '../data/schema';


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

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'confirmPassword'>) => UserApi.createUser(userData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, userData }: { userId: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'permissions' | 'isActive'>> }) => UserApi.updateUser(userId, userData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: UserApi.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
};
