import axios from '@/lib/axios'
import { isAxiosError } from "axios"
import { toast } from 'sonner'
import type { ErrorResponse } from '../types/api.types'
type Params = Record<string, unknown>

interface RequestOptions {
    url: string
    params?: Params
    signal?: AbortSignal
    headers?: Record<string, string | undefined>
}

interface DataRequestOptions<T = unknown> extends RequestOptions {
    data?: T
}

export class ApiError extends Error {
    public status?: number
    public data?: ErrorResponse

    constructor(message: string, status?: number, data?: ErrorResponse) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.data = data
    }
}

function handleError(error: unknown, method: string, url: string): never {
    let errorMessage = 'Something went wrong!';

    if (isAxiosError(error)) {
        const status = error.response?.status
        const data = error.response?.data
        if (error?.response?.status === 401) {
            errorMessage = 'You are not authorized to perform this action'
        }
        if (error?.response?.status === 403) {
            errorMessage = 'You are not authorized to perform this action'
        }
        if (error?.response?.status === 409) {
            errorMessage = 'There is a conflict or duplicate entry'
        }
        errorMessage = data?.error.message
        console.error(`[API][${method}] ${url} → status=${status}`, data || error.message)
        toast.error(errorMessage);
        throw new ApiError(errorMessage, status, data)
    }
    console.error(`[API][${method}] ${url} → unexpected`, error)
    toast.error(errorMessage);
    throw error
}

export const apiClient = {
    get: async <T = unknown>({ url, params = {}, signal, headers }: RequestOptions): Promise<T> => {
        try {
            const res = await axios.get<{ data: T }>(url, { params, signal, headers })
            return res.data.data
        } catch (err) {
            handleError(err, 'GET', url)
        }
    },
    post: async <T = unknown, R = unknown>({ url, data, params = {}, signal, headers }: DataRequestOptions<T>): Promise<R> => {
        try {
            const res = await axios.post<{ data: R }>(url, data, { params, signal, headers })
            return res.data.data
        } catch (err) {
            handleError(err, 'POST', url)
        }
    },
    patch: async <T = unknown, R = unknown>({ url, data, params = {}, signal, headers }: DataRequestOptions<T>): Promise<R> => {
        try {
            const res = await axios.patch<R>(url, data, { params, signal, headers })
            return res.data
        } catch (err) {
            handleError(err, 'PATCH', url)
        }
    },
    put: async <T = unknown, R = unknown>({ url, data, params = {}, signal, headers }: DataRequestOptions<T>): Promise<R> => {
        try {
            const res = await axios.put<{ data: R }>(url, data, { params, signal, headers })
            return res.data.data
        } catch (err) {
            handleError(err, 'PUT', url)
        }
    },
    delete: async <R = unknown>({ url, params = {}, signal, headers }: RequestOptions): Promise<R> => {
        try {
            const res = await axios.delete<R>(url, { params, signal, headers })
            return res.data
        } catch (err) {
            handleError(err, 'DELETE', url)
        }
    },
}