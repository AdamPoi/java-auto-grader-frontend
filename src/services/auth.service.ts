import type { LoginResponse } from '@/types/backendTypes';
import { getRequest, postRequest } from '@/utils/apiHandler';
import { queryOptions } from '@tanstack/react-query';

export const loginQuery = async (
    payload: { email: string; password: string }
): Promise<LoginResponse> => {
    try {
        const data: LoginResponse = await postRequest({
            url: '/api/auth/login',
            data: payload
        });

        console.log('Fetched data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export function getMeQuery(token: string) {
    return queryOptions({
        queryKey: ['me', token],
        enabled: !!token,
        queryFn: async () => {
            try {
                const data = await getRequest({ url: "/api/me" });
                console.log("Fetched data:", data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },
    })
}
