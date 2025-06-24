import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ClassroomForm as ClassroomFormComponent } from '@/features/classrooms/components/classrooms-form';
import type { ClassroomForm } from '@/features/classrooms/data/types';
import { useCreateClassroom } from '@/features/classrooms/hooks/use-classroom';
import { getQueryKey } from '@/features/users/hooks/use-user';
import { useAuthStore } from '@/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/admin/classrooms/create/')({
  component: ClassroomFormPage,
  beforeLoad: async () => {
    const { auth } = await useAuthStore.getState()

    if (!auth.hasPermission(['CLASSROOM:CREATE'])) {
      throw redirect({
        to: '/403',
      })
    }

  }
});

function ClassroomFormPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();


  const createClassroomMutation = useCreateClassroom()

  const onSubmit = (data: ClassroomForm) => {
    createClassroomMutation.mutate(data, {
      onSuccess: () => {
        toast.success(`Classroom with Name ${data.name} created successfully.`);
        navigate({ to: '/admin/cllassrooms' });
        queryClient.refetchQueries({ queryKey: getQueryKey({ action: 'list' }) });
      },
      onError: (error) => {
        toast.error(`Failed to create classroom with Name ${data.name}: ${error.message}`);
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
          <h2 className='text-2xl font-bold tracking-tight'>Create New Classroom</h2>
          <p className='text-muted-foreground'>
            Fill in the details for the new classroom and assign permissions.
          </p>
        </div>
        <div className='grid gap-4 py-4'>
          <ClassroomFormComponent
            onSubmit={onSubmit}
            mutation={createClassroomMutation}

          />
        </div>
      </Main>
    </>
  );
}
