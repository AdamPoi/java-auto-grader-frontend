export type LoginResponse = {
    accessToken: string;
    refreshToken: string;
    expireIn: number;
};

export type LoginRequest = {
    email: string;
    password: string;
}


export type MeResponse = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles?: string[];
    permissions?: string[];
    isActive: boolean;
}

export type RefreshTokenResponse = {
    accessToken: string;
    expireIn: number;
};