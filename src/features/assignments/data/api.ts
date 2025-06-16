import type { SearchResponse } from '@/types/api.types';
import type { Assignment, AssignmentForm } from './types';
import axios from '@/lib/axios';
import type { SearchRequestParams } from '@/types/api.types';

export const assignmentApi = {
    getAssignments: async (params: SearchRequestParams): Promise<SearchResponse<Assignment>> => {
        const response = await axios.get('/assignments', { params });
        return response.data;
    },
    getCourseAssignment: async (courseId: string, params: SearchRequestParams): Promise<SearchResponse<Assignment>> => {
        const response = await axios.get(`/courses/${courseId}/assignments`, { params });
        return response.data;
    },

    getAssignment: async (id: string): Promise<Assignment> => {
        const response = await axios.get(`/assignments/${id}`);
        return response.data;
    },

    createAssignment: async (data: AssignmentForm): Promise<Assignment> => {
        const response = await axios.post('/assignments', data);
        return response.data;
    },

    updateAssignment: async (id: string, data: Partial<AssignmentForm>): Promise<Assignment> => {
        const response = await axios.patch(`/assignments/${id}`, data);
        return response.data;
    },

    deleteAssignment: async (id: string): Promise<void> => {
        await axios.delete(`/assignments/${id}`);
    },
};