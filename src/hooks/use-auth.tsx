import { useAuthStore } from '@/stores/auth.store'
import { meQuery } from '@/api/auth'
import { useLoaderStore } from '@/stores/loader.store'

export const getAuth = async (): Promise<{
    isAuthenticated: boolean
    user: any
    accessToken: string | null
}> => {
    const { auth } = useAuthStore.getState()
    const { setIsLoading } = useLoaderStore.getState()

    // Check if token is expired and try to refresh
    if (!auth.accessToken || (auth.isTokenExpired() && auth.refreshToken)) {
        try {
            setIsLoading(true)
            const success = await auth.refreshAccessToken()

            if (success) {
                // Get updated auth state after refresh
                setIsLoading(false)
                return getAuth() // Recursive call with new token
            } else {
                setIsLoading(false)
                return { isAuthenticated: false, user: null, accessToken: null }
            }
        } catch (error) {
            console.error('Token refresh failed:', error)
            auth.reset()
            setIsLoading(false)
            return { isAuthenticated: false, user: null, accessToken: null }
        }
    }

    // If have access token but no user, fetch user
    if (auth.accessToken && !auth.user && !auth.isTokenExpired()) {
        try {
            setIsLoading(true)
            const userData = await meQuery()

            auth.setUser(userData)
            setIsLoading(false)
            return {
                isAuthenticated: true,
                user: userData,
                accessToken: auth.accessToken
            }

        } catch (error: any) {
            console.error('User fetch failed:', error)
            setIsLoading(false)

            // If 401, token might be invalid, try refresh if we have refresh token
            if (error?.status === 401 || error?.response?.status === 401) {
                if (auth.refreshToken) {
                    auth.resetTokens() // Clear invalid access token but keep refresh token
                    return getAuth() // Try refresh
                } else {
                    auth.reset()
                    return { isAuthenticated: false, user: null, accessToken: null }
                }
            }

            // For other errors, still consider authenticated but without user data
            return {
                isAuthenticated: !auth.isTokenExpired(),
                user: null,
                accessToken: auth.accessToken
            }
        }
    }

    return {
        isAuthenticated: !!auth.accessToken && !auth.isTokenExpired(),
        user: auth.user,
        accessToken: auth.accessToken
    }
}