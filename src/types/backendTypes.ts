export type LoginResponse = {
    token: string
}

export type LoginPayload = {
    email: string
    password: string
}

export type ErrorResponse = {
    type: string
    title: string
    status: number
    detail: string
    instance: string
    message: string
}

export type SearchParams = {
    page?: number
    pageSize?: number
    q?: string
    sort?: string
    order?: string
}