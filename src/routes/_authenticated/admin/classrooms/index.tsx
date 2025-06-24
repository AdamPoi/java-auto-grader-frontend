import Classrooms from '@/features/classrooms'
import { useAuthStore } from '@/stores/auth.store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/classrooms/')({
  component: Classrooms,
  beforeLoad: async () => {
    const { auth } = await useAuthStore.getState()

    if (!auth.hasPermission(['CLASSROOM:LIST'])) {
      throw redirect({
        to: '/403',
      })
    }

  }
})
