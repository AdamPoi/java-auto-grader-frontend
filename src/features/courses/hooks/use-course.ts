import type { SearchRequestParams } from '@/types/api.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { courseApi } from '../data/api';
import type { CourseForm } from '../data/types';


const QUERY_KEY = "courses";

export function getQueryKey({ action, params }: { action?: String, params?: SearchRequestParams }) {
    let key = []
    if (action) {
        key.push(action)
    }
    key.push(QUERY_KEY)
    if (params) {
        key.push(params)
    }
    return key;
}


export const useCourse = (params: SearchRequestParams) => {
    const query = useQuery({
        queryKey: getQueryKey({
            action: 'list',
            params
        }),
        queryFn: async () => {
            const response = await courseApi.getCourses(params);
            return response;
        },
    });


    const queryClient = useQueryClient();
    useEffect(() => {
        if (query.data?.hasNext) {
            const nextPageParams = { ...params, page: params.page + 1 };
            queryClient.prefetchQuery({
                queryKey: getQueryKey({ action: 'list', params: nextPageParams }),
                queryFn: async () => {
                    return await courseApi.getCourses(nextPageParams);
                },
            });
        }
    }, [query.data, params, queryClient]);

    return {
        data: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: async () => {
            await query.refetch();
        },
    };
};

export const useCourseById = (id: string) => {
    return useQuery({
        queryKey: [QUERY_KEY, id],
        queryFn: async () => {
            const response = await courseApi.getCourse(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateCourse = (onSuccess?: () => void, onError?: (error: Error) => void) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: (courseData: CourseForm) => courseApi.createCourse(courseData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey({ action: 'list' }) });
            onSuccess?.();
        },
        onError: (error) => {
            onError?.(error);
        },
    });
    return mutation;
};

export const useUpdateCourse = (onSuccess?: () => void, onError?: (error: Error) => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ courseId, courseData }: { courseId: string, courseData: Partial<CourseForm> }) => courseApi.updateCourse(courseId, courseData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: getQueryKey({ action: 'list' }) });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.courseId] });
            onSuccess?.();
        },
        onError: (error) => {
            onError?.(error);
        },
    });
};

export const useDeleteCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: courseApi.deleteCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey({ action: 'list' }) });
        },
    });
};