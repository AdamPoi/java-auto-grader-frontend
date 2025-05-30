import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { User } from "./schema";
import type { AxiosError } from "axios";
import type { ErrorResponse, SearchParams } from "@/types/backendTypes";
import { UserApi } from "./api";

const UserQuery = {
    MyUser: {
        useQuery: (params: SearchParams, options?: UseQueryOptions<User[], AxiosError<ErrorResponse>>) =>
            useQuery({
                queryKey: ['MyUser'],
                queryFn: () => UserApi.getUsers(params),
                ...options,
            }),
    },
    // GetUserById: {
    //     useQuery: (
    //         id: string,
    //         options?: UseQueryOptions<UserType, AxiosError<ErrorRes>>
    //     ) =>
    //         useQuery({
    //             queryKey: ['MyUser', id],
    //             queryFn: () => getUserByIdFn(id),
    //             ...options,
    //         }),
    // },
    // GetUser: {
    //     useQuery: (options?: UseQueryOptions<UserType[], AxiosError<ErrorRes>>) =>
    //         useQuery({
    //             queryKey: ['MyUser'],
    //             queryFn: () => getUserFn(),
    //             ...options,
    //         }),
    // },
    // UpdateUser: {
    //     useMutation: (
    //         id: string,
    //         options?: UseMutationOptions<
    //             SuccessRes,
    //             AxiosError<ErrorRes>,
    //             UserFormType
    //         >
    //     ) =>
    //         useMutation({
    //             ...options,
    //             mutationFn: (data) => updateUserFn(data, id),
    //             onSuccess: (data) => {
    //                 Toaster.closeLoading('LOADING');
    //                 Toaster.openSuccess(data.message);
    //                 queryClient.invalidateQueries({ queryKey: ['MyUser', id] });
    //                 Router.push('/dashboard/user/');
    //             },
    //             onError: (error) => {
    //                 Toaster.closeLoading('LOADING');
    //                 Toaster.openError(error.response?.data.message as string);
    //             },
    //             onMutate: (variables) => {
    //                 Toaster.openLoading('Please wait');
    //             },
    //         }),
    // },
    // CreateUser: {
    //     useMutation: (
    //         options?: UseMutationOptions<
    //             SuccessRes,
    //             AxiosError<ErrorRes>,
    //             UserFormType
    //         >
    //     ) =>
    //         useMutation({
    //             ...options,
    //             mutationFn: (data) => createUserFn(data),
    //             onSuccess: (data) => {
    //                 Toaster.closeLoading('LOADING');
    //                 Toaster.openSuccess(data.message);
    //                 queryClient.invalidateQueries({ queryKey: ['MyUser'] });
    //                 Router.push('/dashboard/user/');
    //             },
    //             onError: (error) => {
    //                 Toaster.closeLoading('LOADING');
    //                 Toaster.openError(error.response?.data.message as string);
    //             },
    //             onMutate: (variables) => {
    //                 Toaster.openLoading('Please wait');
    //             },
    //         }),
    // },
    // DeleteUser: {
    //     useMutation: (
    //         options?: UseMutationOptions<SuccessRes, AxiosError<ErrorRes>, string>
    //     ) =>
    //         useMutation({
    //             ...options,
    //             mutationFn: (id) => deleteUserFn(id),
    //             onSuccess: (data) => {
    //                 Toaster.closeLoading('LOADING');
    //                 Toaster.openSuccess(data.message);
    //                 queryClient.invalidateQueries({ queryKey: ['MyUser'] });
    //             },
    //             onError: (error) => {
    //                 Toaster.closeLoading('LOADING');
    //                 Toaster.openError(error.response?.data.message as string);
    //             },
    //             onMutate: (variables) => {
    //                 Toaster.openLoading('Please wait');
    //             },
    //         }),
    // },
};

export default UserQuery;