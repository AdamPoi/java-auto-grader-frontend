import { AppSidebar } from '@/components/layout/app-sidebar'
import { TourProvider } from '@/components/tour'
import { SidebarProvider } from '@/components/ui/sidebar'
import { SearchProvider } from '@/contexts/search-context'
import { useAuthStore } from '@/stores/auth.store'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import Cookies from 'js-cookie'

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
  beforeLoad: async () => {
    const { auth } = useAuthStore.getState()

    if (auth.isTokenExpired() && auth.refreshToken) {
      const canRefresh = await auth.refreshAccessToken()
      if (!canRefresh) {
        throw redirect({ to: '/401' })
      }
    }
    if (!auth.isAuthenticated) {
      throw redirect({ to: '/login' })
    }

    if (!auth.user && auth.isAuthenticated) {
      auth.refetchUser()
    }
  },
})


function RouteComponent() {
  const defaultOpen = Cookies.get('sidebar_state') !== 'false'
  return (
    <TourProvider>
      <SearchProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />

          <Outlet />
        </SidebarProvider>
      </SearchProvider>
    </TourProvider>
  )
}
