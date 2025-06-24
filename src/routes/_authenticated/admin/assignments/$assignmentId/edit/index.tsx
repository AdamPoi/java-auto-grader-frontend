import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { AssignmentsForm as AssignmentFormComponent } from '@/features/assignments/components/assignments-form';
import { type AssignmentForm } from '@/features/assignments/data/types';
import { useAssignmentById, useUpdateAssignment } from '@/features/assignments/hooks/use-assignment';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/admin/assignments/$assignmentId/edit/')({
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
  const router = useRouter();

  const { data: assignment, isLoading: isLoadingAssignment } = useAssignmentById(assignmentId);

  const updateAssignmentMutation = useUpdateAssignment()

  const onSubmit = (data: AssignmentForm) => {
    updateAssignmentMutation.mutate({ assignmentId, assignmentData: data }, {
      onSuccess: () => {
        toast.success(`Assignment with Title ${data.title} updated successfully.`);
        router.history.back();
      },
      onError: (error) => {
        toast.error(`Failed to update assignment with Title ${data.title}: ${error.message}`);
      },
    });
  };

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
