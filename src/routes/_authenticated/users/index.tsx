import { createFileRoute, redirect } from '@tanstack/react-router'
import Users from '@/features/users'
import { getAuth } from '@/hooks/use-auth'

export const Route = createFileRoute('/_authenticated/users/')({
  component: Users,
  beforeLoad: async () => {
    const { isAuthenticated } = await getAuth()
    if (!isAuthenticated) {
      throw redirect({
        to: '/401',
      })
    }
  },
})
