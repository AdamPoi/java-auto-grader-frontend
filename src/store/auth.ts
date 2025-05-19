import axios from 'axios'
import { create } from 'zustand'

interface User {
    id: string
    email: string
    name?: string
}

interface Credentials {
    email: string
    password: string
}

interface AuthState {
    token: string | null
    user: User | null
    login: (creds: Credentials) => Promise<void>
    register: (creds: Credentials) => Promise<void>
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
    login: async (creds) => {
        const response = await axios.post('http://localhost:4000/api/auth/login', creds)
        const { token, user } = response.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        set({ token, user })
    },
    register: async (creds) => {
        const response = await axios.post('http://localhost:4000/api/auth/register', creds)
        const { token, user } = response.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        set({ token, user })
    },
    logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ token: null, user: null })
    },
}))