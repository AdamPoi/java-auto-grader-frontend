import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { CourseForm as CourseFormComponent } from '@/features/courses/components/courses-form';
import type { CourseForm } from '@/features/courses/data/types';
import { useCreateCourse } from '@/features/courses/hooks/use-course';
import { getQueryKey } from '@/features/users/hooks/use-user';
import { useAuthStore } from '@/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/admin/courses/create/')({
  component: CourseFormPage,
  beforeLoad: async () => {
    const { auth } = await useAuthStore.getState()

    if (!auth.hasPermission(['COURSE:CREATE'])) {
      throw redirect({
        to: '/403',
      })
    }

  }
});

function CourseFormPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();


  const createCourseMutation = useCreateCourse()

  const onSubmit = (data: CourseForm) => {
    createCourseMutation.mutate(data, {
      onSuccess: () => {
        toast.success(`Course with Name ${data.name} created successfully.`);
        navigate({ to: '/admin/courses' });
        queryClient.refetchQueries({ queryKey: getQueryKey({ action: 'list' }) });
      },
      onError: (error) => {
        toast.error(`Failed to create course with Name ${data.name}: ${error.message}`);
      },
    });
  };

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
        <div className='grid gap-4 py-4'>
          <CourseFormComponent
            onSubmit={onSubmit}
            mutation={createCourseMutation}
          />
        </div>
      </Main>
    </>
  );
}
