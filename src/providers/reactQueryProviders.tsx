import React from 'react';
import {
    MutationCache,
    QueryCache,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import { Toaster, toast as sonnerToast } from 'sonner';

export enum TOAST_SEVERITY {
    SUCCESS = 'success',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

export const showToast = (
    severity: TOAST_SEVERITY,
    summary: string,
    detail: string,
    life: number = 5000
) => {
    const message = `${summary}: ${detail}`;

    switch (severity) {
        case TOAST_SEVERITY.SUCCESS:
            sonnerToast.success(message, { duration: life });
            break;
        case TOAST_SEVERITY.INFO:
            sonnerToast.info(message, { duration: life });
            break;
        case TOAST_SEVERITY.WARN:
            sonnerToast.warning(message, { duration: life });
            break;
        case TOAST_SEVERITY.ERROR:
            sonnerToast.error(message, { duration: life });
            break;
        default:
            sonnerToast(message, { duration: life });
            break;
    }
};

export function ReactQueryProvider({
    children,
}: React.PropsWithChildren) {
    const queryClient = new QueryClient({
        queryCache: new QueryCache({
            onError: (error: any) => {
                console.error('Query Error:', JSON.stringify(error));
            },
        }),
        mutationCache: new MutationCache({
            onError: (error: any) => {
                console.error('Mutation Error:', JSON.stringify(error));
            },
        }),
    });

    return (
        <QueryClientProvider client={queryClient}>
            <Toaster />
            {children}
        </QueryClientProvider>
    );
}


