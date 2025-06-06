import Roles from '@/features/roles'
import { getAuth } from '@/hooks/use-auth'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/roles/')({
    component: () => <Roles />,
    beforeLoad: async () => {
        const { isAuthenticated } = await getAuth()
        if (!isAuthenticated) {
            throw redirect({
                to: '/401',
            })
        }
    },
})
