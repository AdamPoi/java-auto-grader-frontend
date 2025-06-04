export type ErrorResponse = {
    status: number;
    message: string;
    path: string;
}


export type SearchRequestParams = {
    search: string;
    page: number;
    sort: string;
    limit: number;
    order: string;
}