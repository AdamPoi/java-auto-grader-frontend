import axios from '@/lib/axios';
import type { AdminDashboard, StudentDashboard } from './types';
export type DashboardData = AdminDashboard | StudentDashboard;

export const dashboardApi = {
    getDashboard: async (): Promise<DashboardData> => {
        const response = await axios.get('/dashboard');
        return response.data;
    },
};