import { createRootRoute, Link, Outlet, useRouter } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useAuthStore } from '@/store/auth'

export const Route = createRootRoute({
  component: () => {
    const router = useRouter()
    const token = useAuthStore((state) => state.token)
    const logout = useAuthStore((state) => state.logout)

    return (
      <>
        <div className="p-2 flex gap-2">
          <Link to="/" className="[&.active]:font-bold">
            Home
          </Link>{' '}
          <Link to="/about" className="[&.active]:font-bold">
            About
          </Link>
          {!token && (
            <>
              <Link to="/login" className="[&.active]:font-bold ml-2">
                Login
              </Link>
              <Link to="/register" className="[&.active]:font-bold ml-2">
                Register
              </Link>
            </>
          )}
          {token && (
            <>
              <Link to="/dashboard" className="[&.active]:font-bold ml-2">
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout()
                  router.navigate({ to: '/login' })
                }}
                className="ml-2 text-red-500"
              >
                Logout
              </button>
            </>
          )}
        </div>
        <hr />
        <Outlet />
        <TanStackRouterDevtools />
      </>
    )
  },
})