import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { LoginRequest, LoginResponse } from '@/types/auth.types';
import { loginQuery } from '@/api/auth';
import { useAuthStore } from '@/stores/auth.store';
import { meQuery } from '@/api/auth';


export function useLogin() {
    const { auth } = useAuthStore.getState()
    const queryClient = useQueryClient();

    const mutation = useMutation<LoginResponse, Error, LoginRequest>({
        mutationFn: (credentials: LoginRequest) => loginQuery(credentials),
        onSuccess: async (data: LoginResponse) => {
            try {
                auth.setAccessToken(data.accessToken, data.expireIn);
                auth.setRefreshToken(data.refreshToken)
                const userData = await meQuery();
                auth.setUser(userData);
                queryClient.invalidateQueries({ queryKey: ['me'] });
            } catch (error) {
                console.error('Failed to fetch user data after login:', error);
                auth.resetTokens();
                throw error;
            }
        },
    });

    return {
        data: mutation.data,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        mutate: mutation.mutate,
        mutateAsync: mutation.mutateAsync,
        reset: mutation.reset,
    };
}