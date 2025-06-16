import { createFileRoute, redirect, useNavigate, useParams } from '@tanstack/react-router';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { AssignmentsForm as AssignmentFormComponent } from '@/features/assignments/components/assignments-form';
import type { AssignmentForm } from '@/features/assignments/data/types';
import { useCreateAssignment } from '@/features/assignments/hooks/use-assignment';
import { getQueryKey } from '@/features/users/hooks/use-user';
import { useAuthStore } from '@/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/courses/$courseId/assignments/create/')({
  component: AssignmentFormPage,
  beforeLoad: async () => {
    const { auth } = await useAuthStore.getState()

    if (!auth.hasPermission(['ASSIGNMENT:CREATE'])) {
      throw redirect({
        to: '/403',
      })
    }

  }
});

function AssignmentFormPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { courseId } = useParams({ from: '/_authenticated/courses/$courseId/assignments/create/' });

  const createAssignmentMutation = useCreateAssignment()

  const onSubmit = (data: AssignmentForm) => {
    createAssignmentMutation.mutate(data, {
      onSuccess: () => {
        toast.success(`Assignment with Title ${data.title} created successfully.`);
        navigate({ to: '/courses/$courseId/assignments', params: { courseId } });
        queryClient.refetchQueries({ queryKey: getQueryKey({ action: 'list' }) });
      },
      onError: (error) => {
        toast.error(`Failed to create assignment with Title ${data.title}: ${error.message}`);
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
          <h2 className='text-2xl font-bold tracking-tight'>Create New Assignment</h2>
          <p className='text-muted-foreground'>
            Fill in the details for the new course assignment.
          </p>
        </div>
        <div className='grid gap-4 py-4'>
          <AssignmentFormComponent
            onSubmit={onSubmit}
            mutation={createAssignmentMutation}
          />
        </div>
      </Main>
    </>
  );
}
