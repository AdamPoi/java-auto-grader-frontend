import axios from '@/lib/axios';
import type { SearchRequestParams, SearchResponse } from '@/types/api.types';
import type { Rubric, RubricForm } from './types';

export const rubricApi = {
    getRubrics: async (params: SearchRequestParams): Promise<SearchResponse<Rubric>> => {
        const response = await axios.get('/rubrics', { params });
        return response.data;
    },

    getRubric: async (id: string): Promise<Rubric> => {
        const response = await axios.get(`/rubrics/${id}`);
        return response.data;
    },

    createRubric: async (data: RubricForm): Promise<Rubric> => {
        const response = await axios.post('/rubrics', data);
        return response.data;
    },

    updateRubric: async (id: string, data: Partial<RubricForm>): Promise<Rubric> => {
        const response = await axios.patch(`/rubrics/${id}`, data);
        return response.data;
    },

    deleteRubric: async (id: string): Promise<void> => {
        await axios.delete(`/rubrics/${id}`);
    },

    fetchRubricsByAssignmentId: async (assignmentId: string): Promise<Rubric[]> => {
        const response = await axios.get(`/assignments/${assignmentId}/rubrics`);
        return response.data;
    },
};