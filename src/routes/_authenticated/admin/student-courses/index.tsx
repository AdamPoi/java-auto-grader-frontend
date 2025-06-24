import { createFileRoute, redirect } from '@tanstack/react-router';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { StudentCourseCard } from '@/features/courses/components/student-course/student-course-card';
import { StudentCoursekeletonCard } from '@/features/courses/components/student-course/student-course-skeleton-card';
import { useCourse } from '@/features/courses/hooks/use-course';
import { useAuthStore } from '@/stores/auth.store';

export const Route = createFileRoute('/_authenticated/admin/student-courses/')({
    component: CourseFormPage,
    beforeLoad: async () => {
        const { auth } = await useAuthStore.getState()

        if (!auth.hasPermission(['COURSE:LIST'])) {
            throw redirect({
                to: '/403',
            })
        }

    }
});

function CourseFormPage() {


    const { data, isLoading, isError, error } = useCourse({
        page: 0,
        size: 1000,
        filter: "", // RHS colon filter
    });

    return (
        <>
            <Header fixed>
                <div className='ml-auto flex items-center space-x-4'>
                    {/* Add any header elements here if needed */}
                </div>
            </Header>
            <Main>
                <div className='mb-4'>
                    <h2 className='text-2xl font-bold tracking-tight'>Create New Course</h2>
                    <p className='text-muted-foreground'>
                        Fill in the details for the new course and assign permissions.
                    </p>
                </div>
                <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2 xl:grid-cols-3 mt-12">
                    {isLoading && Array.from({ length: 3 }).map((_, i) => <StudentCoursekeletonCard key={i} />)}

                    {isError && (
                        <div className="col-span-full text-center text-red-500 bg-red-100 p-4 rounded-md">
                            <p className="font-bold">An error occurred:</p>
                            <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
                        </div>
                    )}

                    {data?.content?.map((course) => (
                        <StudentCourseCard key={course.id} course={course} />
                    ))}
                </div>
            </Main>
        </>
    );
}
