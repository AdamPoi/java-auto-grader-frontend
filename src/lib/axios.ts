import { refreshTokenQuery } from "@/api/auth";
import { useAuthStore } from "@/stores/auth.store";
import Axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

const axios = Axios.create({});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}
// Axios default option
const serverUrl = import.meta.env.VITE_BACKEND_API_URL ?? 'http://localhost:3000';
export const baseURL = `${serverUrl}`;

axios.defaults.timeout = 60000; // Milliseconds

axios.interceptors.request.use(
    async function (config) {
        const { auth } = useAuthStore.getState();

        // Only add auth header if both user and token exist
        if (auth.accessToken && !auth.isTokenExpired()) {
            config.headers["Authorization"] = `Bearer ${auth.accessToken}`;
        }
        config.headers["Content-Type"] = "application/json";
        config.baseURL = baseURL;

        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

async function retryRefreshToken(refreshToken: string, maxRetries = 5, timeoutMs = 10000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 1) {
                await new Promise(resolve => setTimeout(resolve, timeoutMs));
            }

            return await refreshTokenQuery(refreshToken);
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            if (error instanceof AxiosError && error.response?.status === 401) {
                throw error;
            }
        }
    }
    throw new Error('Max retries exceeded');
}

axios.interceptors.response.use(
    function (response) {
        return response;
    },
    async function (error: AxiosError) {
        const originalRequest: CustomAxiosRequestConfig | undefined = error.config;

        const { auth } = useAuthStore.getState();
        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry
        ) {

            if (!auth.refreshToken) {
                auth.reset();
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                // Retry refresh token with 5 retries and 10 second timeout
                const response = await retryRefreshToken(auth.refreshToken, 5, 10000);

                auth.setAccessToken(response.accessToken, response.expireIn);

                originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;

                return axios(originalRequest);
            } catch (refreshError) {
                auth.reset();
                toast.error('Session expired. Please log in again.');
                return Promise.reject(refreshError);
            }
        }



        return Promise.reject(error);
    }
);


export default axios;