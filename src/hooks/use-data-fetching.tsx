import { useLoaderStore } from '@/stores/loader.store';
import { useErrorNotification } from './use-error-notification';
import type { CustomError } from '@/utils/handle-server-error';
import { useLoading } from './use-loading';

interface UseDataFetchingParams {
    isLoading: boolean;
    isError: boolean;
    error: CustomError | null;
    errorMessage: string;
}

export const useDataFetching = ({ isLoading, isError, error, errorMessage }: UseDataFetchingParams) => {
    const { setIsLoading } = useLoaderStore();
    useErrorNotification(isError, errorMessage, error);
    useLoading(isLoading, setIsLoading);
};