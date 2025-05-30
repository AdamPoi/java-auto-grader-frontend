import { useMutation } from '@tanstack/react-query';
import type { LoginRequest, LoginResponse } from '@/types/auth.types';
import { loginRequest } from '@/api/auth';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth.store';

export function useLogin() {
    const { auth } = useAuthStore.getState()
    const navigate = useNavigate();

    const mutation = useMutation<LoginResponse, Error, LoginRequest>({
        mutationFn: (credentials: LoginRequest) => loginRequest(credentials),
        onMutate: () => {
            console.log('Attempting login…');
        },
        onError: (error: Error) => {
            console.error('Login failed:', error);
        },
        onSuccess: (data: LoginResponse) => {
            auth.setAccessToken(data.token);
            navigate({ to: '/dashboard' });
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