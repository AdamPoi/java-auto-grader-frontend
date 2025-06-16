import Courses from '@/features/courses'
import { useAuthStore } from '@/stores/auth.store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/courses/')({
  component: Courses,
  beforeLoad: async () => {
    const { auth } = await useAuthStore.getState()

    if (!auth.hasPermission(['COURSE:LIST'])) {
      throw redirect({
        to: '/403',
      })
    }

  }
})
