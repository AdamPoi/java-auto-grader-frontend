export type ErrorResponse = {
    status: number;
    message: string;
    path: string;
}


export type SearchRequestParams = {
    page: number;
    size: number;
    filter?: string;
}

export type SearchResponse<T> = {
    content: T[];
    page: number;
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
