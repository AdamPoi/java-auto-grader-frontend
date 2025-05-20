import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Header } from '@/components/ui/header'
import { Sidebar } from '@/components/ui/sidebar'
import Footer from '@/components/ui/footer'

export const Route = createFileRoute('/_studentLayout')({
  component: StudentLayout,
})

function StudentLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}
