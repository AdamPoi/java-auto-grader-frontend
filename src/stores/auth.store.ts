import { meQuery, refreshTokenQuery } from '@/api/auth';
import Cookies from 'js-cookie';
import { create } from 'zustand';

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
        isAuthenticated: boolean
        setTokens: (accessToken: string, refreshToken: string, expireIn: number) => void
        setAccessToken: (accessToken: string, expireIn: number) => void
        setRefreshToken: (refreshToken: string) => void
        resetTokens: () => void
        refreshAccessToken: () => Promise<boolean>
        isTokenExpired: () => boolean
        reset: () => void
        initializeFromCookies: () => void
        hasPermission: (permissions: string[]) => boolean
        hasRole: (roles: string[]) => boolean
        refetchUser: () => Promise<void>
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

    const calculateExpiryDate = (expireInMilliseconds: number): number => {
        return Date.now() + expireInMilliseconds
    }

    const initToken = getTokenFromCookie(ACCESS_TOKEN)
    const initRefreshToken = getTokenFromCookie(REFRESH_TOKEN)
    const initTokenExpiry = getNumberFromCookie(TOKEN_EXPIRY)
    const initUser = getUserFromCookie()
    const initIsAuthenticated = !!initToken && (!initTokenExpiry || initTokenExpiry > Date.now())
    return {
        auth: {
            user: initUser,
            accessToken: initToken,
            refreshToken: initRefreshToken,
            tokenExpiry: initTokenExpiry,
            isAuthenticated: initIsAuthenticated,
            setIsAuthenticated: (isAuthenticated: boolean) => set((state) => ({ ...state, auth: { ...state.auth, isAuthenticated } })),
            setUser: (user) =>
                set((state) => {
                    if (user) {
                        Cookies.set(USER, JSON.stringify(user), { expires: 7 }) // 7 days
                    } else {
                        Cookies.remove(USER)
                    }
                    return { ...state, auth: { ...state.auth, user } }
                }),

            setTokens: (accessToken, refreshToken, expireInMilliseconds) =>
                set((state) => {
                    const expiryTime = calculateExpiryDate(expireInMilliseconds)
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
                            tokenExpiry: expiryTime,
                            isAuthenticated: true,

                        }
                    }
                }),

            setAccessToken: (accessToken, expireInMilliseconds) =>
                set((state) => {
                    const expiryTime = calculateExpiryDate(expireInMilliseconds)
                    const cookieExpiry = new Date(expiryTime)

                    Cookies.set(ACCESS_TOKEN, JSON.stringify(accessToken), { expires: cookieExpiry })
                    Cookies.set(TOKEN_EXPIRY, JSON.stringify(expiryTime))

                    return {
                        ...state,
                        auth: {
                            ...state.auth,
                            accessToken,
                            tokenExpiry: expiryTime,
                            isAuthenticated: true,
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
                return Date.now() - tokenExpiry > 0
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
                            tokenExpiry: null,
                            isAuthenticated: false,

                        }
                    }
                }),

            refreshAccessToken: async () => {
                const maxRetries = 3;

                for (let attempt = 1; attempt <= maxRetries; attempt++) {
                    try {
                        const { refreshToken } = get().auth
                        if (!refreshToken) {
                            get().auth.reset()
                            throw new Error('No refresh token available')
                        }

                        const response = await refreshTokenQuery(refreshToken);

                        const { setAccessToken } = get().auth
                        setAccessToken(response.accessToken, response.expireIn)
                        return true;

                    } catch (error) {
                        console.error(`Failed to refresh token (attempt ${attempt}/${maxRetries}):`, error)

                        if (attempt === maxRetries) {
                            get().auth.reset()
                            return false;
                        }

                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    }
                }

                return false;
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
                            tokenExpiry: null,
                            isAuthenticated: false
                        },
                    }
                }),

            initializeFromCookies: () => {
                set((state) => ({
                    ...state,
                    auth: {
                        ...state.auth,
                        user: getUserFromCookie(),
                        accessToken: getTokenFromCookie(ACCESS_TOKEN),
                        refreshToken: getTokenFromCookie(REFRESH_TOKEN),
                        tokenExpiry: getNumberFromCookie(TOKEN_EXPIRY),
                    }
                }));
                get().auth.refetchUser();
            },
            hasPermission: (permissions: string[]) => {
                const { user } = get().auth
                if (!user?.permissions) return false;
                return permissions.some(permission => user.permissions!.includes(permission));
            },
            hasRole: (roles: string[]) => {
                const { user } = get().auth
                if (!user?.roles) return false;
                return roles.some(role => user.roles!.includes(role));
            },

            refetchUser: async () => {
                const { user, setUser } = get().auth;
                if (!user) {
                    try {
                        const response = await meQuery();
                        setUser(response);
                    } catch (error) {
                        console.error('Error fetching user:', error);
                        get().auth.reset();
                    }
                }
            },
        },

    }
})
