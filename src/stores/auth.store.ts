import { create } from 'zustand'
import { authService } from '@/services/auth.service'

interface AuthState {
    user: Record<string, any> | null
    token: string | null
    authError: string | null
    login: (data: { email: string; password: string }) => Promise<void>
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    authError: null,

    login: async ({ email, password }) => {
        try {
            const token = await authService.login({ email, password })
            const user = await authService.getMe(token)

            set({ token, user, authError: null })
            localStorage.setItem('token', token)
        } catch (err: any) {
            set({ authError: err.message })
        }
    },

    logout: () => {
        set({ token: null, user: null })
        localStorage.removeItem('token')
    },
}))