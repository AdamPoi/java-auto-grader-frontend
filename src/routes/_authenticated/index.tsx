import Dashboard from '@/features/dashboard'
import { useAuthStore } from '@/stores/auth.store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard,
  beforeLoad: async () => {
    const { auth } = await useAuthStore.getState()
    if (auth.hasRole(['admin'])) {
      throw redirect({
        to: '/admin',
      })
    }
    if (auth.hasRole(['student']) || auth.hasRole(['teacher'])) {
      throw redirect({
        to: '/app',
      })
    }
  }
})
