import axios from '@/lib/axios';
import type { SearchRequestParams, SearchResponse } from '@/types/api.types';
import type { Submission, SubmissionForm } from './types';

export const submissionApi = {
    getSubmissions: async (params: SearchRequestParams): Promise<SearchResponse<Submission>> => {
        const response = await axios.get('/submissions', { params });
        return response.data;
    },

    getSubmission: async (id: string): Promise<Submission> => {
        const response = await axios.get(`/submissions/${id}`);
        return response.data;
    },

    createSubmission: async (data: SubmissionForm): Promise<Submission> => {
        const response = await axios.post('/submissions', data);
        return response.data;
    },

    updateSubmission: async (id: string, data: Partial<SubmissionForm>): Promise<Submission> => {
        const response = await axios.patch(`/submissions/${id}`, data);
        return response.data;
    },

    deleteSubmission: async (id: string): Promise<void> => {
        await axios.delete(`/submissions/${id}`);
    },

    getSubmissionsByAssignment: async (assignmentId: string, params: SearchRequestParams): Promise<SearchResponse<Submission>> => {
        const searchParams = {
            ...params,
            filter: `assignmentId=${assignmentId}`,
        };
        const response = await axios.get('/submissions', { params: searchParams });
        return response.data;
    },

    getSubmissionsByStudent: async (studentId: string, params: SearchRequestParams): Promise<SearchResponse<Submission>> => {
        const searchParams = {
            ...params,
            filter: `studentId=${studentId}`,
        };
        const response = await axios.get('/submissions', { params: searchParams });
        return response.data;
    },

    submitForGrading: async (id: string): Promise<Submission> => {
        const response = await axios.post(`/submissions/${id}/submit`);
        return response.data;
    },

    rerunTests: async (id: string): Promise<Submission> => {
        const response = await axios.post(`/submissions/${id}/rerun-tests`);
        return response.data;
    },
};