import { createFileRoute, redirect } from '@tanstack/react-router'
import Dashboard from '@/features/dashboard'
import { getAuth } from '@/hooks/use-auth'

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: Dashboard,
  beforeLoad: async () => {
    const { isAuthenticated } = await getAuth()
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
      })
    }
  },
})
