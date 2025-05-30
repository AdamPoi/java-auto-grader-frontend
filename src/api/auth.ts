import { apiClient } from "./apiClient";
import { type LoginRequest, type LoginResponse } from "../types/auth.types";

const ENDPOINT = "/auth";
export async function loginRequest(values: LoginRequest) {
    const data = await apiClient.post<LoginRequest, LoginResponse>({
        url: `${ENDPOINT}/login`,
        data: values,
    });
    return data;
}