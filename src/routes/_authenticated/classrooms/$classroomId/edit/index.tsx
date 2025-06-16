import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ClassroomForm as ClassroomFormComponent } from '@/features/classrooms/components/classrooms-form';
import { type ClassroomForm } from '@/features/classrooms/data/types';
import { useClassroomById, useUpdateClassroom } from '@/features/classrooms/hooks/use-classroom';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/classrooms/$classroomId/edit/')({
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

  const { data: classroom, isLoading: isLoadingClassroom } = useClassroomById(classroomId);

  const updateClassroomMutation = useUpdateClassroom()

  const onSubmit = (data: ClassroomForm) => {
    updateClassroomMutation.mutate({ classroomId, classroomData: data }, {
      onSuccess: () => {
        toast.success(`Classroom with Name ${data.name} updated successfully.`);
        navigate({ to: '/classrooms' });
      },
      onError: (error) => {
        toast.error(`Failed to update classroom with Name ${data.name}: ${error.message}`);
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
          <h2 className='text-2xl font-bold tracking-tight'>Edit Classroom: {classroom?.name}</h2>
          <p className='text-muted-foreground'>
            Edit the details for the classroom and assign students.
          </p>
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
