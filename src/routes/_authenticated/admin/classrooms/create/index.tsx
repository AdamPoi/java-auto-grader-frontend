import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ClassroomForm as ClassroomFormComponent } from '@/features/classrooms/components/classrooms-form';
import type { ClassroomForm } from '@/features/classrooms/data/types';
import { useCreateClassroom } from '@/features/classrooms/hooks/use-classroom';
import { getQueryKey } from '@/features/users/hooks/use-user';
import { useAuthStore } from '@/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
  const router = useRouter();


  const createClassroomMutation = useCreateClassroom()

  const onSubmit = (data: ClassroomForm) => {
    createClassroomMutation.mutate(data, {
      onSuccess: () => {
        toast.success(`Classroom with Name ${data.name} created successfully.`);
        navigate({ to: '/admin/classrooms' });
        queryClient.refetchQueries({ queryKey: getQueryKey({ action: 'list' }) });
      },
      onError: (error) => {
        toast.error(`Failed to create classroom with Name ${data.name}: ${error.message}`);
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
              <h2 className='text-2xl font-bold tracking-tight'>Create New Classroom</h2>
              <p className='text-muted-foreground'>
                Fill in the details for the new classroom and assign permissions.
              </p>
            </div>
          </div>
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
