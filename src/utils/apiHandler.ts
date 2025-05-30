import axios from "@/utils/axios.config"
import { isAxiosError } from "axios"
type Params = Record<string, unknown>

interface RequestOptions {
    url: string
    params?: Params
}

interface DataRequestOptions<T = unknown> extends RequestOptions {
    data?: T
}

export class ApiError extends Error {
    public status?: number
    public data?: unknown

    constructor(message: string, status?: number, data?: unknown) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.data = data
    }
}

function handleError(err: unknown, method: string, url: string): never {
    if (isAxiosError(err)) {
        const status = err.response?.status
        const data = err.response?.data
        console.error(`[API][${method}] ${url} → status=${status}`, data || err.message)
        throw new ApiError(err.message, status, data)
    }
    console.error(`[API][${method}] ${url} → unexpected`, err)
    throw err
}

export const getRequest = async <T = unknown>({
    url,
    params = {},
}: RequestOptions): Promise<T> => {
    try {
        const res = await axios.get<T>(url, { params })
        return res.data
    } catch (err) {
        handleError(err, 'GET', url)
    }
}

export const postRequest = async <T = unknown, R = unknown>({
    url,
    data,
    params = {},
}: DataRequestOptions<T>): Promise<R> => {
    try {
        const res = await axios.post<R>(url, data, { params })
        return res.data
    } catch (err) {
        handleError(err, 'POST', url)
    }
}

export const patchRequest = async <T = unknown, R = unknown>({
    url,
    data,
    params = {},
}: DataRequestOptions<T>): Promise<R> => {
    try {
        const res = await axios.patch<R>(url, data, { params })
        return res.data
    } catch (err) {
        handleError(err, 'PATCH', url)
    }
}

export const putRequest = async <T = unknown, R = unknown>({
    url,
    data,
    params = {},
}: DataRequestOptions<T>): Promise<R> => {
    try {
        const res = await axios.put<R>(url, data, { params })
        return res.data
    } catch (err) {
        handleError(err, 'PUT', url)
    }
}

export const deleteRequest = async <R = unknown>({
    url,
    params = {},
}: RequestOptions): Promise<R> => {
    try {
        const res = await axios.delete<R>(url, { params })
        return res.data
    } catch (err) {
        handleError(err, 'DELETE', url)
    }
}