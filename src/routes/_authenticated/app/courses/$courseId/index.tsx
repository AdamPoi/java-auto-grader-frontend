import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AssignmentCard } from '@/features/assignments/components/assignment-card';
import type { Assignment } from '@/features/assignments/data/types';
import { useCourseById } from '@/features/courses/hooks/use-course';
import { createFileRoute, useNavigate, useParams, useRouter } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/app/courses/$courseId/')({
  component: CourseDetailPage,
})


function CourseDetailPage() {
  const { courseId } = useParams({ from: '/_authenticated/app/courses/$courseId/' })
  const { data: course, isLoading: isLoadingCourse } = useCourseById(courseId)
  const router = useRouter();
  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>

        <div className='mb-4 flex flex-wrap items-center justify-between space-y-2'>
          {isLoadingCourse ? (
            <Skeleton className='h-8 w-64' />
          ) : (
            <div className='flex items-center gap-4'>
              <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => router.history.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className='flex flex-col'>
                <span className='text-sm text-muted-foreground'>Back to Courses</span>
                <h1 className="text-2xl font-bold tracking-tight">{course?.name}</h1>
              </div>
            </div>
          )}

        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingCourse
              ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))
              : course?.assignments?.map((assignment: Assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
          </div>
        </div>
      </Main>
    </>
  );
}
