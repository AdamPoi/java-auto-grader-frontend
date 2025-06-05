import { refreshTokenQuery } from '@/api/auth'; // You'll need to implement this
import Cookies from 'js-cookie'
import { create } from 'zustand'

interface AuthUser {
    id: string
    email: string
    firstName: string
    lastName: string
    roles?: string[]
    permissions?: string[]
    isActive: boolean
}

const ACCESS_TOKEN = 'java-grader-access-token'
const REFRESH_TOKEN = 'java-grader-refresh-token'
const TOKEN_EXPIRY = 'java-grader-token-expiry'
const USER = 'java-grader-user'

interface AuthState {
    auth: {
        user: AuthUser | null
        setUser: (user: AuthUser | null) => void
        accessToken: string
        refreshToken: string
        tokenExpiry: number | null
        setTokens: (accessToken: string, refreshToken: string, expireIn: number) => void
        setAccessToken: (accessToken: string, expireIn: number) => void
        setRefreshToken: (refreshToken: string) => void
        resetTokens: () => void
        refreshAccessToken: () => Promise<boolean>
        isTokenExpired: () => boolean
        reset: () => void
        initializeFromCookies: () => void
    }
}

export const useAuthStore = create<AuthState>()((set, get) => {
    const getTokenFromCookie = (key: string): string => {
        const cookieValue = Cookies.get(key)
        return cookieValue ? JSON.parse(cookieValue) : ''
    }

    const getNumberFromCookie = (key: string): number | null => {
        const cookieValue = Cookies.get(key)
        return cookieValue ? JSON.parse(cookieValue) : null
    }

    const getUserFromCookie = (): AuthUser | null => {
        const userCookie = Cookies.get(USER)
        return userCookie ? JSON.parse(userCookie) : null
    }

    const calculateExpiryDate = (expireInSeconds: number): number => {
        return Date.now() + (expireInSeconds * 1000)
    }

    const initToken = getTokenFromCookie(ACCESS_TOKEN)
    const initRefreshToken = getTokenFromCookie(REFRESH_TOKEN)
    const initTokenExpiry = getNumberFromCookie(TOKEN_EXPIRY)
    const initUser = getUserFromCookie()

    return {
        auth: {
            user: initUser,
            accessToken: initToken,
            refreshToken: initRefreshToken,
            tokenExpiry: initTokenExpiry,

            setUser: (user) =>
                set((state) => {
                    if (user) {
                        Cookies.set(USER, JSON.stringify(user), { expires: 7 }) // 7 days
                    } else {
                        Cookies.remove(USER)
                    }
                    return { ...state, auth: { ...state.auth, user } }
                }),

            setTokens: (accessToken, refreshToken, expireIn) =>
                set((state) => {
                    const expiryTime = calculateExpiryDate(expireIn)
                    const cookieExpiry = new Date(expiryTime)

                    Cookies.set(ACCESS_TOKEN, JSON.stringify(accessToken), { expires: cookieExpiry })
                    Cookies.set(REFRESH_TOKEN, JSON.stringify(refreshToken), { expires: 7 }) // 7 days
                    Cookies.set(TOKEN_EXPIRY, JSON.stringify(expiryTime))

                    return {
                        ...state,
                        auth: {
                            ...state.auth,
                            accessToken,
                            refreshToken,
                            tokenExpiry: expiryTime
                        }
                    }
                }),

            setAccessToken: (accessToken, expireIn) =>
                set((state) => {
                    const expiryTime = calculateExpiryDate(expireIn)
                    const cookieExpiry = new Date(expiryTime)

                    Cookies.set(ACCESS_TOKEN, JSON.stringify(accessToken), { expires: cookieExpiry })
                    Cookies.set(TOKEN_EXPIRY, JSON.stringify(expiryTime))

                    return {
                        ...state,
                        auth: {
                            ...state.auth,
                            accessToken,
                            tokenExpiry: expiryTime
                        }
                    }
                }),

            setRefreshToken: (refreshToken) =>
                set((state) => {
                    Cookies.set(REFRESH_TOKEN, JSON.stringify(refreshToken), { expires: 7 })
                    return { ...state, auth: { ...state.auth, refreshToken } }
                }),

            isTokenExpired: () => {
                const { tokenExpiry } = get().auth
                if (!tokenExpiry) return true
                return Date.now() >= (tokenExpiry - 5 * 60 * 1000)
            },

            resetTokens: () =>
                set((state) => {
                    Cookies.remove(ACCESS_TOKEN)
                    Cookies.remove(REFRESH_TOKEN)
                    Cookies.remove(TOKEN_EXPIRY)
                    return {
                        ...state,
                        auth: {
                            ...state.auth,
                            accessToken: '',
                            refreshToken: '',
                            tokenExpiry: null
                        }
                    }
                }),

            refreshAccessToken: async () => {
                try {
                    const { refreshToken } = get().auth
                    if (!refreshToken) {
                        throw new Error('No refresh token available')
                    }

                    const response = await refreshTokenQuery(refreshToken)
                    const { setAccessToken } = get().auth

                    setAccessToken(response.accessToken, response.expireIn)
                    return true
                } catch (error) {
                    console.error('Failed to refresh token:', error)
                    get().auth.reset()
                    return false
                }
            },

            reset: () =>
                set((state) => {
                    Cookies.remove(ACCESS_TOKEN)
                    Cookies.remove(REFRESH_TOKEN)
                    Cookies.remove(TOKEN_EXPIRY)
                    Cookies.remove(USER)
                    return {
                        ...state,
                        auth: {
                            ...state.auth,
                            user: null,
                            accessToken: '',
                            refreshToken: '',
                            tokenExpiry: null
                        },
                    }
                }),

            initializeFromCookies: () =>
                set((state) => ({
                    ...state,
                    auth: {
                        ...state.auth,
                        user: getUserFromCookie(),
                        accessToken: getTokenFromCookie(ACCESS_TOKEN),
                        refreshToken: getTokenFromCookie(REFRESH_TOKEN),
                        tokenExpiry: getNumberFromCookie(TOKEN_EXPIRY),
                    }
                })),
        },
    }
})