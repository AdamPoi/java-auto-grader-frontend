import { useQuery } from "@tanstack/react-query";
import { meQuery } from "@/api/auth";
import { useAuthStore } from "@/stores/auth.store";

const QUERY_KEY = "me";

export function useMe() {
    const { auth } = useAuthStore();

    const query = useQuery({
        queryKey: [QUERY_KEY],
        queryFn: meQuery,
        enabled: !!auth.accessToken, // Only fetch if we have a token
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        retry: (failureCount, error: any) => {
            // Don't retry if it's an auth error
            if (error?.status === 401) return false;
            return failureCount < 3;
        },
    });

    return query;
}