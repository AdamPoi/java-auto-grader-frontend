import axios from '@/lib/axios';
import type { SearchRequestParams, SearchResponse } from '@/types/api.types';
import type { RubricGrade, RubricGradeForm } from './types';

export const rubricGradeApi = {
    getRubricGrades: async (params: SearchRequestParams): Promise<SearchResponse<RubricGrade>> => {
        const response = await axios.get('/rubric-grades', { params });
        return response.data;
    },

    getRubricGrade: async (id: string): Promise<RubricGrade> => {
        const response = await axios.get(`/rubric-grades/${id}`);
        return response.data;
    },

    createRubricGrade: async (data: RubricGradeForm): Promise<RubricGrade> => {
        const response = await axios.post('/rubric-grades', data);
        return response.data;
    },

    updateRubricGrade: async (id: string, data: Partial<RubricGradeForm>): Promise<RubricGrade> => {
        const response = await axios.patch(`/rubric-grades/${id}`, data);
        return response.data;
    },

    deleteRubricGrade: async (id: string): Promise<void> => {
        await axios.delete(`/rubric-grades/${id}`);
    },

    getRubricGradesByAssignmentId: async (assignmentId: string): Promise<SearchResponse<RubricGrade>> => {
        const response = await axios.get(`/assignments/${assignmentId}/rubric-grades`);
        return response.data;
    },
};