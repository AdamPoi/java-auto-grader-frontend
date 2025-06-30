import axios from '@/lib/axios';
import type { Submission, TestSubmitRequest } from './types';

export type TimedAssessmentStartResponse = {
    startedAt: string;
    timeLimitMs?: number;
};

export type TimedAssessmentStatusResponse = {
    startedAt: string;
    remainingMs: number;
    expired: boolean;
    submitted: boolean;
};

export type TimedAssessmentSubmitPayload = {
    mainClassName: string;
    code: string;
};

export type TimedAssessmentSubmitResult = {
    submissionId: string;
    status: string;
    completedAt: string;
};

export const timedAssessmentApi = {
    start: async (assignmentId: string): Promise<TimedAssessmentStartResponse> => {
        const response = await axios.post(`/timed-assessments/${assignmentId}/start`);
        return response.data;
    },

    status: async (assignmentId: string): Promise<TimedAssessmentStatusResponse> => {
        const response = await axios.get(`/timed-assessments/${assignmentId}/status`);
        return response.data;
    },

    submit: async (
        assignmentId: string,
        data: TestSubmitRequest
    ): Promise<Submission> => {
        const response = await axios.post(`/timed-assessments/${assignmentId}/submit`, data);
        return response.data;
    },
};
