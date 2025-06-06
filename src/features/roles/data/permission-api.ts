import axios from '@/lib/axios';
import type { SearchRequestParams, SearchResponse } from '@/types/api.types';
import type { Permission } from './schema';

export const PermissionApi = {
    getPermissions: async (params: SearchRequestParams): Promise<SearchResponse<Permission>> => {
        const response = await axios.get('/permissions', {
            params
        });
        return response.data;
    },
};
