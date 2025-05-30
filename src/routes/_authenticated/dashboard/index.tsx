import { createFileRoute, redirect } from '@tanstack/react-router'
import Dashboard from '@/features/dashboard'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: Dashboard,
  beforeLoad: async () => {
    const { auth } = useAuthStore.getState()
    if (!auth.accessToken) {
      throw redirect({
        to: '/login',
      })
    }
  },
})
