import { QueryCache, QueryClient } from "@tanstack/react-query";
import { Navigate } from "@tanstack/react-router";
import { AxiosError } from 'axios';
import { toast } from 'sonner';

const navigate = Navigate

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                if (failureCount >= 0 && import.meta.env.DEV) return false
                if (failureCount > 3 && import.meta.env.PROD) return false

                return !(
                    error instanceof AxiosError &&
                    [401, 403].includes(error.response?.status ?? 0)
                )
            },
            select: (data: any) => {
                if (data && typeof data === 'object' && 'data' in data) {
                    return data.data;
                }
                return data;
            },
            refetchOnWindowFocus: import.meta.env.PROD,
            staleTime: 10 * 1000, // 10s
            placeholderData: (previousData: any) => previousData,
        },
        mutations: {
            onSuccess: (data: any, variables: any, context: any) => {
                if (data && typeof data === 'object' && 'data' in data) {
                    return data.data;
                }
                return data;
            },
        },
    },
    queryCache: new QueryCache({
        onError: (error) => {
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    toast.error('Session expired!')
                }
                if (error.response?.status === 500) {
                    toast.error('Internal Server Error!')
                    navigate({ to: '/500' })
                }
                if (error.response?.status === 403) {
                    navigate({ to: '/403' });
                }
            }
        },
    }),
})
