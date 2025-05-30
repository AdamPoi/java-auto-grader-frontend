import { useEffect } from 'react';

export const useLoading = (isLoading: boolean, setIsLoading: (loading: boolean) => void) => {
    useEffect(() => {
        setIsLoading(isLoading);
    }, [isLoading, setIsLoading]);
};