import { AppSidebar } from '@/components/layout/app-sidebar'
import { TourProvider } from '@/components/tour'
import { SidebarProvider } from '@/components/ui/sidebar'
import { SearchProvider } from '@/contexts/search-context'
import { cn } from '@/lib/utils'
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
          <div
            id='content'
            className={cn(
              'ml-auto w-full max-w-full',
              'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
              'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
              'sm:transition-[width] sm:duration-200 sm:ease-linear',
              'flex h-svh flex-col',
              'group-data-[scroll-locked=1]/body:h-full',
              'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh'
            )}
          >
            <Outlet />
          </div>
        </SidebarProvider>
      </SearchProvider>
    </TourProvider>
  )
}
