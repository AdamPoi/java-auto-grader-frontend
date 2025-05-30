import { useDataFetching } from '@/hooks/use-data-fetching';
import type { SearchParams } from '@/types/backendTypes';
import { useQuery } from '@tanstack/react-query';
import { UserApi } from '../data/api';
// import { UserApi } from '@/app/api/userApi';
// import { USERS } from '@/app/ts/constants/process';
// import { useDataFetching } from '@/hooks/useDataFetching';
// import { useQueryProps } from '@/app/ts/interfaces/configs/types';
// import { ERROR_FETCHING_USERS } from '@/app/ts/constants/messages';

export const useUsers = (params: SearchParams) => {
    const errorMessage = "Something went wrong while fetching users";
    const getUsers = async () => {
        return await UserApi.getUsers(params);
    };
    const {
        data: users,
        isLoading: isLoadingUsers,
        refetch: refetchUsers,
        error: errorUsers,
        isError: isErrorUsers,
    } = useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
        retry: 0,
    });

    useDataFetching({ isLoading: isLoadingUsers, isError: isErrorUsers, error: errorUsers, errorMessage });

    return { users, isLoadingUsers, refetchUsers, errorUsers };
};