import { errorNotification, type CustomError } from '@/utils/handle-server-error';
import { useEffect } from 'react';

export const useErrorNotification = (isError: boolean, title: string, error: CustomError | null = null) => {
    useEffect(() => {
        errorNotification(isError, title, error);
    }, [isError]);
};