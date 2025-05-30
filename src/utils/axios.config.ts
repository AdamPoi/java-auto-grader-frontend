import Axios, { AxiosError } from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { type ErrorResponse } from "@/types/backendTypes";

const axios = Axios.create({});

// Axios default option
const serverUrl = import.meta.env.VITE_BACKEND_API_URL ?? 'http://localhost:3000';
console.log('Axios baseURL →', serverUrl)
export const baseURL = `${serverUrl}`;

axios.defaults.timeout = 120000; // Milliseconds

axios.interceptors.request.use(
    async function (config) {
        const token = useAuthStore.getState().auth.accessToken;

        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
            config.headers["Access-Control-Allow-Credentials"] = true;
        }
        config.headers["Content-Type"] = "application/json";
        config.baseURL = baseURL;

        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        let errorMsg = 'Something went wrong!';
        if (
            error &&
            typeof error === 'object' &&
            'status' in error &&
            Number(error.status) === 204
        ) {
            errorMsg = 'Content not found.'
        }

        if (error?.response?.status === 403) {
            errorMsg = 'You are not authorized to perform this action'
        }
        if (error?.response?.status === 401) {
            errorMsg = 'You are not authorized to perform this action'
        }
        if (error instanceof AxiosError && typeof error.response?.data === 'object') {
            const errorResponse = error.response?.data as ErrorResponse;
            errorMsg = errorResponse.message
        }
        return toast.error(errorMsg);

    }
);

export default axios;