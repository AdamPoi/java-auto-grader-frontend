import axios from '@/lib/axios';
import type { SearchRequestParams, SearchResponse } from '@/types/api.types';
import type { Role, RoleForm } from './schema';

export const RoleApi = {
    getRoles: async (params: SearchRequestParams): Promise<SearchResponse<Role>> => {
        const response = await axios.get('/roles', { params });
        return response.data;
    },

    getRole: async (id: string): Promise<Role> => {
        const response = await axios.get(`/roles/${id}`);
        return response.data;
    },

    createRole: async (data: RoleForm): Promise<Role> => {
        const response = await axios.post('/roles', data);
        return response.data;
    },

    updateRole: async (id: string, data: Partial<RoleForm>): Promise<Role> => {
        const response = await axios.patch(`/roles/${id}`, data);
        return response.data;
    },

    deleteRole: async (id: string): Promise<void> => {
        await axios.delete(`/roles/${id}`);
    },
};
