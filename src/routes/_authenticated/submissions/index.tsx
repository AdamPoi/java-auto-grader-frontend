import Roles from '@/features/roles'
import { useAuthStore } from '@/stores/auth.store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/submissions/')({
    component: () => <Roles />,
    // beforeLoad: async () => {
    //     const { auth } = await useAuthStore.getState()
    //     if (!auth.hasPermission(['ROLE:LIST'])) {
    //         throw redirect({
    //             to: '/403',
    //         })
    //     }
    // }
})
