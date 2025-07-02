import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { Button } from '@/components/ui/button';
import { AssignmentsForm as AssignmentFormComponent } from '@/features/assignments/components/assignments-form';
import type { AssignmentForm } from '@/features/assignments/data/types';
import { useCreateAssignment } from '@/features/assignments/hooks/use-assignment';
import { getQueryKey } from '@/features/users/hooks/use-user';
import { useAuthStore } from '@/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/admin/assignments/create/')({
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
  const router = useRouter();
  const searchParams = useSearch({ from: '/_authenticated/admin/assignments/create/' }) as { courseId: string };;
  const courseId = searchParams.courseId;
  const createAssignmentMutation = useCreateAssignment()

  const onSubmit = (data: AssignmentForm) => {
    createAssignmentMutation.mutate(data, {
      onSuccess: () => {
        toast.success(`Assignment with Title ${data.title} created successfully.`);
        navigate({ to: '/admin/courses/$courseId/assignments', params: { courseId } });
        queryClient.refetchQueries({ queryKey: getQueryKey({ action: 'list' }) });
      },
      onError: (error) => {
        toast.error(`Failed to create assignment with Title ${data.title}: ${error.message}`);
      },
    });
  };

  return (
    <>
      {/* Header Menu */}
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        {/* Header Page */}
        <div className='flex flex-col gap-2'>
          <Button variant="outline" size="icon" className='w-fit p-2' onClick={() => router.history.back()}>
            <ArrowLeft className="h-4 w-4" /> <span>Back</span>
          </Button>
          <div className="flex justify-between items-center">
            <div className='mb-4'>
              <h2 className='text-2xl font-bold tracking-tight'>Create New Assignment</h2>
              <p className='text-muted-foreground'>
                Fill in the details for the new course assignment.
              </p>
            </div>
          </div>
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
