import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import type { AdminDashboard, StudentDashboard } from '@/features/dashboard/data/types'
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard'
import { useAuthStore } from '@/stores/auth.store'
import { StudentDashboardPage } from './pages/student-dashboard'
import { AdminDashboardPage } from './pages/admin-dashboard'

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-6 md:grid-cols-3">
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Skeleton className="lg:col-span-2 h-80" />
      <div className="space-y-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { auth } = useAuthStore();
  const { data, isLoading, error } = useDashboard();

  const isAdmin = auth.user?.roles?.includes('admin') || auth.user?.roles?.includes('teacher');

  const renderContent = () => {
    if (isLoading) return <DashboardSkeleton />;
    if (error) return <div className="text-red-500">Failed to load dashboard data: {error.message}</div>;
    if (!data) return <div>No dashboard data available.</div>;

    if (isAdmin) {
      return <AdminDashboardPage data={data as AdminDashboard} />;
    }
    return <StudentDashboardPage data={data as StudentDashboard} />;
  };

  return (
    <>
      <Header>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        {renderContent()}
      </Main>
    </>
  )
}