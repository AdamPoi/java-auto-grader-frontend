import { apiClient } from "../lib/apiClient";
import { type LoginRequest, type LoginResponse, type MeResponse, type RefreshTokenResponse } from "../types/auth.types";

const ENDPOINT = "/auth";
export async function loginQuery(values: LoginRequest) {
    const data = await apiClient.post<LoginRequest, LoginResponse>({
        url: `${ENDPOINT}/login`,
        data: values,
    });
    return data
}

export async function registerQuery(values: LoginRequest) {
    const data = await apiClient.post<LoginRequest, LoginResponse>({
        url: `${ENDPOINT}/login`,
        data: values,
    });
    return data;
}
export async function meQuery() {
    const data = await apiClient.get<MeResponse>({
        url: `${ENDPOINT}/me`,
    });
    return data;
}

export async function refreshTokenQuery(refreshToken: string) {
    const data = await apiClient.post<{ refreshToken: string }, RefreshTokenResponse>({
        url: `${ENDPOINT}/refresh`,
        data: {
            refreshToken
        },
        headers: {
            Authorization: undefined
        }
    });
    return data;
}