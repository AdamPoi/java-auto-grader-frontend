import { meQuery } from '@/api/auth';
import { useAuthStore } from '@/stores/auth.store';
import { useLoaderStore } from '@/stores/loader.store';

export const getAuth = async (): Promise<{
    isAuthenticated: boolean
    user: any
    accessToken: string | null
    hasPermission: (permissions: string[]) => boolean
    hasRole: (roles: string[]) => boolean
}> => {
    const { auth } = useAuthStore.getState()
    const { setIsLoading } = useLoaderStore.getState()
    console.log(auth.accessToken)
    console.log(auth.isTokenExpired())
    if (auth.isTokenExpired() && auth.refreshToken) {
        auth.reset()

        try {
            setIsLoading(true)
            const success = await auth.refreshAccessToken()
            if (success) {
                setIsLoading(false)
                const { auth: updatedAuth } = useAuthStore.getState();
                const hasPermissionFunc = (permissions: string[]) => updatedAuth.hasPermission(permissions);
                const hasRoleFunc = (roles: string[]) => updatedAuth.hasRole(roles);
                console.log(updatedAuth.accessToken)
                console.log(updatedAuth.isTokenExpired())
                return {
                    isAuthenticated: updatedAuth.accessToken != null && !updatedAuth.isTokenExpired(),
                    user: updatedAuth.user,
                    accessToken: updatedAuth.accessToken,
                    hasPermission: hasPermissionFunc,
                    hasRole: hasRoleFunc
                };
            } else {
                setIsLoading(false)
                return { isAuthenticated: false, user: null, accessToken: null, hasPermission: () => false, hasRole: () => false }
            }
        } catch (error) {
            console.error('Token refresh failed:', error)
            auth.reset()
            setIsLoading(false)
            return { isAuthenticated: false, user: null, accessToken: null, hasPermission: () => false, hasRole: () => false }
        }
    }

    if (auth.accessToken && !auth.user && !auth.isTokenExpired()) {
        try {
            setIsLoading(true)
            const userData = await meQuery()

            auth.setUser(userData)
            setIsLoading(false)
            const hasPermissionFunc = (permissions: string[]) => auth.hasPermission(permissions);
            const hasRoleFunc = (roles: string[]) => auth.hasRole(roles);
            return {
                isAuthenticated: true,
                user: userData,
                accessToken: auth.accessToken,
                hasPermission: hasPermissionFunc,
                hasRole: hasRoleFunc
            }

        } catch (error: any) {
            console.error('User fetch failed:', error)
            setIsLoading(false)

            if (error?.status === 401 || error?.response?.status === 401) {
                if (auth.refreshToken) {
                    auth.resetTokens()
                    return { isAuthenticated: false, user: null, accessToken: null, hasPermission: () => false, hasRole: () => false }
                } else {
                    auth.reset()
                    return { isAuthenticated: false, user: null, accessToken: null, hasPermission: () => false, hasRole: () => false }
                }
            }

            return {
                isAuthenticated: !auth.isTokenExpired(),
                user: null,
                accessToken: auth.accessToken,
                hasPermission: () => false,
                hasRole: () => false
            }
        }
    }

    const hasPermissionFunc = (permissions: string[]) => auth.hasPermission(permissions);
    const hasRoleFunc = (roles: string[]) => auth.hasRole(roles);
    return {
        isAuthenticated: !!auth.accessToken && !auth.isTokenExpired(),
        user: auth.user,
        accessToken: auth.accessToken,
        hasPermission: hasPermissionFunc,
        hasRole: hasRoleFunc
    }
}
