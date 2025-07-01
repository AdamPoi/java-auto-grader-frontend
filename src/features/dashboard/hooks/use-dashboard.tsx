import type { SearchRequestParams } from '@/types/api.types';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../data/api';


const QUERY_KEY = "dashboard";

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



export const useDashboard = () => {
    return useQuery({
        queryKey: [QUERY_KEY],
        queryFn: async () => {
            const response = await dashboardApi.getDashboard();
            return response;
        },
    });
};

