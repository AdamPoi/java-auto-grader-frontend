import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { Button } from '@/components/ui/button';
import { ClassroomForm as ClassroomFormComponent } from '@/features/classrooms/components/classrooms-form';
import { type ClassroomForm } from '@/features/classrooms/data/types';
import { useClassroomById, useUpdateClassroom } from '@/features/classrooms/hooks/use-classroom';
import { useAuthStore } from '@/stores/auth.store';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/admin/classrooms/$classroomId/edit/')({
  component: EditClassroomPage,
  beforeLoad: async () => {
    const { auth } = await useAuthStore.getState()

    if (!auth.hasPermission(['CLASSROOM:UPDATE'])) {
      throw redirect({
        to: '/403',
      })
    }

  }
});

function EditClassroomPage() {
  const { classroomId } = Route.useParams();
  const navigate = useNavigate();
  const router = useRouter();

  const { data: classroom, isLoading: isLoadingClassroom } = useClassroomById(classroomId);

  const updateClassroomMutation = useUpdateClassroom()

  const onSubmit = (data: ClassroomForm) => {
    updateClassroomMutation.mutate({ classroomId, classroomData: data }, {
      onSuccess: () => {
        toast.success(`Classroom with Name ${data.name} updated successfully.`);
        navigate({ to: '/admin/classrooms' });
      },
      onError: (error) => {
        toast.error(`Failed to update classroom with Name ${data.name}: ${error.message}`);
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
              <h2 className='text-2xl font-bold tracking-tight'>Edit Classroom: {classroom?.name}</h2>
              <p className='text-muted-foreground'>
                Edit the details for the classroom and assign students.
              </p>
            </div>
          </div>
        </div>
        <div className='grid gap-4 py-4'>
          <ClassroomFormComponent
            initialData={classroom}
            onSubmit={onSubmit}
          />
        </div>
      </Main>
    </>
  );
}
