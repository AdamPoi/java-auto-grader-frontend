import { meQuery } from '@/api/auth'
import { useAuthStore } from '@/stores/auth.store'
import { useLoaderStore } from '@/stores/loader.store'

export const getAuth = async (): Promise<{
    isAuthenticated: boolean
    user: any
    accessToken: string | null
}> => {
    const { auth } = useAuthStore.getState()
    const { setIsLoading } = useLoaderStore.getState()

    if (!auth.accessToken || (auth.isTokenExpired() && auth.refreshToken)) {
        try {
            setIsLoading(true)
            const success = await auth.refreshAccessToken()

            if (success) {
                setIsLoading(false)
                return getAuth()
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

            if (error?.status === 401 || error?.response?.status === 401) {
                if (auth.refreshToken) {
                    auth.resetTokens()
                    return getAuth()
                } else {
                    auth.reset()
                    return { isAuthenticated: false, user: null, accessToken: null }
                }
            }

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