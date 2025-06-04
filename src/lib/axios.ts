import Axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { refreshTokenQuery } from "@/api/auth";
import type { ErrorResponse } from "@/types/api.types";

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
        const token = useAuthStore.getState().auth.accessToken;

        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        config.headers["Content-Type"] = "application/json";
        config.baseURL = baseURL;

        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

export default axios