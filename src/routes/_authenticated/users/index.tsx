import Users from '@/features/users'
import { useAuthStore } from '@/stores/auth.store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/users/')({
  component: Users,
  beforeLoad: async () => {
    const { auth } = await useAuthStore.getState()

    if (!auth.hasPermission(['USER:LIST'])) {
      throw redirect({
        to: '/403',
      })
    }

  }
})
