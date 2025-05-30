export type LoginResponse = {
    token: string;
    expireIn: number;
};

export type LoginRequest = {
    email: string;
    password: string;
}