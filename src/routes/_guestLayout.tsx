import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Header } from '@/components/ui/header'
import Footer from '@/components/ui/footer'

export const Route = createFileRoute('/_guestLayout')({
  component: GuestLayout,
})

export function GuestLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}