import Login from '@/features/auth/login'
import { useAuthStore } from '@/stores/auth.store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/login')({
  component: Login,
  beforeLoad: async () => {
    const { auth } = useAuthStore.getState()

    if (auth.isTokenExpired() && auth.refreshToken) {
      const canRefresh = await auth.refreshAccessToken()
      if (!canRefresh) {
        throw redirect({ to: '/401' })
      }
    }
    if (auth.isAuthenticated) {
      throw redirect({ to: '/admin/dashboard' })
    }
  },
})
