import { createFileRoute, redirect, useNavigate, useParams } from '@tanstack/react-router';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { AssignmentsForm as AssignmentFormComponent } from '@/features/assignments/components/assignments-form';
import { type AssignmentForm } from '@/features/assignments/data/types';
import { useAssignmentById, useUpdateAssignment } from '@/features/assignments/hooks/use-assignment';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/courses/$courseId/assignments/$assignmentId/edit/')({
  component: EditAssignmentPage,
  beforeLoad: async () => {
    const { auth } = await useAuthStore.getState()

    if (!auth.hasPermission(['ASSIGNMENT:UPDATE'])) {
      throw redirect({
        to: '/403',
      })
    }

  }
});

function EditAssignmentPage() {
  const { assignmentId } = Route.useParams();
  const navigate = useNavigate();
  const { courseId } = useParams({ from: '/_authenticated/courses/$courseId/assignments/$assignmentId/edit/' });

  const { data: assignment, isLoading: isLoadingAssignment } = useAssignmentById(assignmentId);

  const updateAssignmentMutation = useUpdateAssignment()

  const onSubmit = (data: AssignmentForm) => {
    updateAssignmentMutation.mutate({ assignmentId, assignmentData: data }, {
      onSuccess: () => {
        toast.success(`Assignment with Title ${data.title} updated successfully.`);
        navigate({ to: '/courses/$courseId/assignments', params: { courseId } });
      },
      onError: (error) => {
        toast.error(`Failed to update assignment with Title ${data.title}: ${error.message}`);
      },
    });
  };

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'>
        </div>
      </Header>
      <Main>
        <div className='mb-4'>
          <h2 className='text-2xl font-bold tracking-tight'>Edit Assignment: {assignment?.title}</h2>
          <p className='text-muted-foreground'>
            Edit the details for the assignment and assign students.
          </p>
        </div>
        <div className='grid gap-4 py-4'>
          <AssignmentFormComponent
            initialData={assignment}
            onSubmit={onSubmit}
          />
        </div>
      </Main>
    </>
  );
}
