import Axios from "axios";
import { useAuthStore } from "@/stores/auth.store";

const axios = Axios.create({});

// Axios default option
const serverUrl = import.meta.env.VITE_BACKEND_API_URL ?? 'http://localhost:3000';
console.log("serverUrl", serverUrl);
export const baseURL = `${serverUrl}`;

axios.defaults.timeout = 60000; // Milliseconds

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
export default axios