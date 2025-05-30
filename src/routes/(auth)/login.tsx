import { createFileRoute, redirect } from '@tanstack/react-router'
import Login from '@/features/auth/login'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/(auth)/login')({
  component: Login,
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()
    if (auth.accessToken) {
      throw redirect({ to: '/dashboard' })
    }
  },
})
