import axios from '@/lib/axios';
import type { SearchRequestParams, SearchResponse } from '@/types/api.types';
import type { Course, CourseForm } from './types';

export const courseApi = {
    getCourses: async (params: SearchRequestParams): Promise<SearchResponse<Course>> => {
        const response = await axios.get('/courses', { params });
        return response.data;
    },

    getCourse: async (id: string): Promise<Course> => {
        const response = await axios.get(`/courses/${id}`);
        return response.data;
    },

    createCourse: async (data: CourseForm): Promise<Course> => {
        const response = await axios.post('/courses', data);
        return response.data;
    },

    updateCourse: async (id: string, data: Partial<CourseForm>): Promise<Course> => {
        const response = await axios.patch(`/courses/${id}`, data);
        return response.data;
    },

    deleteCourse: async (id: string): Promise<void> => {
        await axios.delete(`/courses/${id}`);
    },
};