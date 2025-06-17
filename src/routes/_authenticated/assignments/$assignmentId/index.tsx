import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssignmentsForm as AssignmentFormComponent } from '@/features/assignments/components/assignments-form';
import { useAssignmentById, useCreateAssignment } from '@/features/assignments/hooks/use-assignment';
import CodeEditor from '@/features/code-editor';
import Rubrics from '@/features/rubrics';
import RubricsProvider from '@/features/rubrics/context/rubrics-context';
import { TestBuilder } from '@/features/test-builder';
import { useAuthStore } from '@/stores/auth.store';
import { EditIcon } from 'lucide-react';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';

export const Route = createFileRoute('/_authenticated/assignments/$assignmentId/')({
  component: AssignmentManagePage,
  beforeLoad: async () => {
    const { auth } = await useAuthStore.getState()

    if (!auth.hasPermission(['ASSIGNMENT:CREATE'])) {
      throw redirect({
        to: '/403',
      })
    }

  }
});

function AssignmentManagePage() {
  const navigate = useNavigate();
  const router = useRouter()
  const { assignmentId } = Route.useParams();

  const createAssignmentMutation = useCreateAssignment()
  const { data: assignment, isLoading: isLoadingAssignment } = useAssignmentById(assignmentId);

  return (
    <RubricsProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className="flex justify-between items-center">
          <div className='mb-4'>
            <h2 className='text-2xl font-bold tracking-tight'>Assignment Details</h2>
            <p className='text-muted-foreground'>
              Manage your assignment details, rubrics, tests, and code compilation.
            </p>
          </div>
          <div className='ml-auto flex items-center space-x-4'>
            <Button
              type='button'
              variant='default'
              onClick={() => {
                navigate({
                  to: '/assignments/$assignmentId/edit',
                  params: { assignmentId: assignmentId },
                });
              }}>
              Edit <EditIcon className='ml-2 h-4 w-4' />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full-sm">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details" >
              Details
            </TabsTrigger>
            <TabsTrigger value="rubrics">
              Rubrics
            </TabsTrigger>
            <TabsTrigger value="test-builder">
              Test Builder
            </TabsTrigger>
            <TabsTrigger value="compiler">
              Compiler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <div className='grid gap-4 py-4'>
              <AssignmentFormComponent
                initialData={assignment}
                withFooter={false}
              />
            </div>
          </TabsContent>

          <TabsContent value="rubrics" className="mt-6" data-testid="rubrics-tab">
            <div className="p-6 border rounded-lg" data-testid="rubrics-tab-content">
              <Rubrics assignmentId={assignmentId} />
            </div>
          </TabsContent>
          <TabsContent value="test-builder" className="mt-6" data-testid="test-builder-tab">
            <TestBuilder />
          </TabsContent>
          <TabsContent value="compiler" className="mt-6" data-testid="compiler-tab">
            <CodeEditor />
          </TabsContent>
        </Tabs>
        <div className="flex justify-start mt-8">
          <Button type='button' variant='outline' onClick={() => router.history.back()}>
            Back
          </Button>
        </div>
      </Main>
    </RubricsProvider>
  );
}