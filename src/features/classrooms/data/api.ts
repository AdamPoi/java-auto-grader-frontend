import axios from '@/lib/axios';
import type { SearchRequestParams, SearchResponse } from '@/types/api.types';
import type { Classroom, ClassroomForm } from './types';

export const ClassroomApi = {
    getClassrooms: async (params: SearchRequestParams): Promise<SearchResponse<Classroom>> => {
        const response = await axios.get('/classrooms', { params });
        return response.data;
    },

    getClassroom: async (id: string): Promise<Classroom> => {
        const response = await axios.get(`/classrooms/${id}`);
        return response.data;
    },

    createClassroom: async (data: ClassroomForm): Promise<Classroom> => {
        const response = await axios.post('/classrooms', data);
        return response.data;
    },

    updateClassroom: async (id: string, data: Partial<ClassroomForm>): Promise<Classroom> => {
        const response = await axios.patch(`/classrooms/${id}`, data);
        return response.data;
    },

    deleteClassroom: async (id: string): Promise<void> => {
        await axios.delete(`/classrooms/${id}`);
    },
};