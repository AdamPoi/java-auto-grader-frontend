import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => {

    return (
      <div className="min-h-screen bg-gray-100">
        <Outlet />
        <TanStackRouterDevtools />
      </div>
    )
  },
})